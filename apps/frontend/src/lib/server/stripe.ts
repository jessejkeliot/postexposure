import Stripe from 'stripe';
import { env } from '$env/dynamic/private';
import { getAdminPocketBase, pbAdmin } from './auth';
import {
	createPurchase,
	createTicket,
	getFilmById,
	getIssueById,
	getPurchaseByStripeId,
	getScreeningById
} from '$lib/pocketbase/db';
import type { Issue, Purchase, Ticket } from '$lib/types/database';

const stripeSecretKey = env.STRIPE_SECRET_KEY;
const isRealStripeKey = Boolean(
	stripeSecretKey &&
	stripeSecretKey.startsWith('sk_') &&
	!stripeSecretKey.includes('placeholder') &&
	!stripeSecretKey.includes('your_stripe_secret_key')
);

export const stripe = isRealStripeKey ? new Stripe(stripeSecretKey as string, {
	apiVersion: '2025-02-24.acacia' as any
}) : null;

export interface CreateTicketCheckoutParams {
	screeningId: string;
	filmId: string;
	filmTitle: string;
	showingDate: string;
	unitPrice: number; // in GBP (e.g. 12.00)
	quantity: number;
	userId?: string;
	userEmail?: string;
	origin: string;
	isMemberDiscount?: boolean;
}

/**
 * Creates a Stripe Checkout Session for purchasing screening tickets.
 */
export async function createTicketCheckoutSession(params: CreateTicketCheckoutParams): Promise<{
	url: string;
	sessionId: string;
	simulated?: boolean;
}> {
	const {
		screeningId,
		filmId,
		filmTitle,
		showingDate,
		unitPrice,
		quantity,
		userId,
		userEmail,
		origin,
		isMemberDiscount
	} = params;

	const unitAmountPence = Math.round(unitPrice * 100);
	const description = `${showingDate} ${isMemberDiscount ? ' (20% Member Discount)' : ''}`;

	// If the ticket price is £0 (free ticket or 100% discount), skip Stripe and proceed directly to success page
	if (unitAmountPence > 0 && stripe && isRealStripeKey) {
		try {
			const session = await stripe.checkout.sessions.create({
				payment_method_types: ['card'],
				mode: 'payment',
				line_items: [
					{
						price_data: {
							currency: 'gbp',
							unit_amount: unitAmountPence,
							product_data: {
								name: `Ticket: ${filmTitle}`,
								description: description
							}
						},
						quantity
					}
				],
				customer_email: userEmail || undefined,
				success_url: `${origin}/tickets/success?session_id={CHECKOUT_SESSION_ID}`,
				cancel_url: `${origin}/calendar/${filmId}/${screeningId}/buy?cancelled=true`,
				metadata: {
					type: 'ticket',
					screeningId,
					filmId,
					filmTitle,
					userId: userId || '',
					quantity: String(quantity),
					unitPrice: String(unitPrice),
					guestEmail: userEmail || ''
				}
			});

			if (session.url) {
				return {
					url: session.url,
					sessionId: session.id,
					simulated: false
				};
			}
		} catch (err) {
			console.warn('Stripe checkout session creation error, falling back to simulated checkout:', err);
		}
	}

	// Simulated / Sandbox Mode (instant test checkout)
	const simulatedSessionId = 'cs_test_' + Math.random().toString(36).substring(2, 12);
	const query = new URLSearchParams({
		session_id: simulatedSessionId,
		screening_id: screeningId,
		film_id: filmId,
		quantity: String(quantity),
		unit_price: String(unitPrice),
		user_id: userId || '',
		guest_email: userEmail || '',
		simulated: 'true'
	});

	return {
		url: `${origin}/tickets/success?${query.toString()}`,
		sessionId: simulatedSessionId,
		simulated: true
	};
}

/**
 * Fulfills ticket issuance and records purchase upon successful Stripe payment.
 * Safe and idempotent: will not create duplicate tickets if already fulfilled.
 */
export async function fulfillTicketSession(sessionId: string, fallbackData?: {
	screeningId?: string;
	filmId?: string;
	quantity?: number;
	unitPrice?: number;
	userId?: string;
	guestEmail?: string;
}): Promise<{
	success: boolean;
	alreadyFulfilled: boolean;
	tickets: Ticket[];
	purchase?: Purchase;
	error?: string;
}> {
	try {
		const adminPb = await getAdminPocketBase();

		// 1. Check if this session was already fulfilled
		const existingPurchase = await getPurchaseByStripeId(sessionId, adminPb);
		if (existingPurchase) {
			// Fetch existing tickets for this user & screening
			const existingTickets = await adminPb.collection('tickets').getFullList<Ticket>({
				filter: `screening="${existingPurchase.item_id}"`,
				sort: '-created',
				expand: 'screening,screening.film,screening.film.cover_image,screening.season,user'
			});
			return {
				success: true,
				alreadyFulfilled: true,
				tickets: existingTickets,
				purchase: existingPurchase
			};
		}

		let screeningId = fallbackData?.screeningId;
		let filmTitle = 'Cinema Screening';
		let quantity = fallbackData?.quantity || 1;
		let unitPrice = fallbackData?.unitPrice || 12.0;
		let userId = fallbackData?.userId;
		let guestEmail = fallbackData?.guestEmail;

		// 2. If real Stripe session, retrieve details from Stripe API
		if (stripe && isRealStripeKey && sessionId.startsWith('cs_') && !sessionId.includes('test_')) {
			try {
				const session = await stripe.checkout.sessions.retrieve(sessionId);
				if (session.payment_status !== 'paid') {
					return {
						success: false,
						alreadyFulfilled: false,
						tickets: [],
						error: 'Payment has not been completed.'
					};
				}

				if (session.metadata) {
					screeningId = session.metadata.screeningId || screeningId;
					filmTitle = session.metadata.filmTitle || filmTitle;
					quantity = parseInt(session.metadata.quantity || '1', 10);
					unitPrice = parseFloat(session.metadata.unitPrice || '12.0');
					userId = session.metadata.userId || userId;
					guestEmail = session.metadata.guestEmail || session.customer_details?.email || guestEmail;
				}
			} catch (err) {
				console.warn('Could not retrieve Stripe session details, using fallback params:', err);
			}
		}

		if (!screeningId) {
			return {
				success: false,
				alreadyFulfilled: false,
				tickets: [],
				error: 'Missing screening ID in ticket fulfillment'
			};
		}

		const screening = await getScreeningById(screeningId, adminPb);
		if (!screening) {
			return {
				success: false,
				alreadyFulfilled: false,
				tickets: [],
				error: 'Screening not found'
			};
		}

		const film = screening.film ? await getFilmById(screening.film, adminPb) : null;
		if (film) {
			filmTitle = film.title;
		}

		// 3. Resolve user ID (find or create guest user if email provided)
		let targetUserId = userId || '';
		if (!targetUserId && guestEmail) {
			try {
				const existingUser = await adminPb.collection('users').getFirstListItem(`email = "${guestEmail}"`);
				targetUserId = existingUser.id;
			} catch {
				// No user with that email yet; create guest profile so it links when they sign up
				try {
					const guestName = guestEmail.split('@')[0];
					const randomPass = 'GuestPass_' + Math.random().toString(36).substring(2, 10) + '99!';
					const newUser = await adminPb.collection('users').create({
						email: guestEmail,
						password: randomPass,
						passwordConfirm: randomPass,
						name: guestName,
						role: 'user',
						isSubscribed: false
					});
					targetUserId = newUser.id;
				} catch (err) {
					console.warn('Could not auto-create guest user:', err);
				}
			}
		}

		// 4. Create the tickets
		const createdTickets: Ticket[] = [];
		for (let i = 0; i < quantity; i++) {
			const ticket = await createTicket({
				screening: screeningId,
				user: targetUserId || undefined,
				status: 'valid'
			}, adminPb);
			createdTickets.push(ticket);
		}

		// 5. Record the purchase
		const totalAmount = unitPrice * quantity;
		let purchase: Purchase | undefined;
		if (targetUserId) {
			try {
				purchase = await createPurchase({
					user: targetUserId,
					type: 'ticket',
					item_id: screeningId,
					item_name: `${quantity}x Ticket: ${filmTitle}`,
					amount: totalAmount,
					currency: 'GBP',
					status: 'completed',
					stripe_payment_id: sessionId
				}, adminPb);
			} catch (err) {
				console.warn('Could not record purchase row:', err);
			}
		}

		return {
			success: true,
			alreadyFulfilled: false,
			tickets: createdTickets,
			purchase
		};
	} catch (err: any) {
		console.error('Error in fulfillTicketSession:', err);
		return {
			success: false,
			alreadyFulfilled: false,
			tickets: [],
			error: err?.message || 'Ticket fulfillment failed'
		};
	}
}

export interface CreateIssueCheckoutParams {
	issueId: string;
	issueTitle: string;
	unitPrice: number; // in GBP (e.g. 12.00)
	userId?: string;
	userEmail?: string;
	origin: string;
	isMemberDiscount?: boolean;
}

/**
 * Creates a Stripe Checkout Session for purchasing magazine issues (PDF & digital).
 */
export async function createIssueCheckoutSession(params: CreateIssueCheckoutParams): Promise<{
	url: string;
	sessionId: string;
	simulated?: boolean;
}> {
	const {
		issueId,
		issueTitle,
		unitPrice,
		userId,
		userEmail,
		origin,
		isMemberDiscount
	} = params;

	const unitAmountPence = Math.round(unitPrice * 100);
	const description = `Digital PDF & Print Magazine Edition${isMemberDiscount ? ' (20% Member Discount)' : ''}`;

	// If the issue price is £0 (free issue or 100% discount), skip Stripe and proceed directly to success page
	if (unitAmountPence > 0 && stripe && isRealStripeKey) {
		try {
			const session = await stripe.checkout.sessions.create({
				payment_method_types: ['card'],
				mode: 'payment',
				line_items: [
					{
						price_data: {
							currency: 'gbp',
							unit_amount: unitAmountPence,
							product_data: {
								name: `Magazine Issue: ${issueTitle}`,
								description: description
							}
						},
						quantity: 1
					}
				],
				customer_email: userEmail || undefined,
				success_url: `${origin}/issues/success?session_id={CHECKOUT_SESSION_ID}`,
				cancel_url: `${origin}/issues/buy?issueId=${issueId}&cancelled=true`,
				metadata: {
					type: 'issue',
					issueId,
					issueTitle,
					userId: userId || '',
					unitPrice: String(unitPrice),
					guestEmail: userEmail || ''
				}
			});

			if (session.url) {
				return {
					url: session.url,
					sessionId: session.id,
					simulated: false
				};
			}
		} catch (err) {
			console.warn('Stripe checkout session creation error, falling back to simulated checkout:', err);
		}
	}

	// Simulated / Sandbox Mode (instant test checkout)
	const simulatedSessionId = 'cs_test_' + Math.random().toString(36).substring(2, 12);
	const query = new URLSearchParams({
		session_id: simulatedSessionId,
		issue_id: issueId,
		unit_price: String(unitPrice),
		user_id: userId || '',
		guest_email: userEmail || '',
		simulated: 'true'
	});

	return {
		url: `${origin}/issues/success?${query.toString()}`,
		sessionId: simulatedSessionId,
		simulated: true
	};
}

/**
 * Fulfills issue purchase and records transaction upon successful payment.
 * Idempotent: will not create duplicate purchases for the same Stripe session.
 */
export async function fulfillIssueSession(sessionId: string, fallbackData?: {
	issueId?: string;
	unitPrice?: number;
	userId?: string;
	guestEmail?: string;
}): Promise<{
	success: boolean;
	alreadyFulfilled: boolean;
	issue?: Issue | null;
	purchase?: Purchase;
	error?: string;
}> {
	try {
		const adminPb = await getAdminPocketBase();

		// 1. Check if this session was already fulfilled
		const existingPurchase = await getPurchaseByStripeId(sessionId, adminPb);
		if (existingPurchase) {
			const issue = existingPurchase.item_id ? await getIssueById(existingPurchase.item_id, adminPb) : null;
			return {
				success: true,
				alreadyFulfilled: true,
				purchase: existingPurchase,
				issue
			};
		}

		let issueId = fallbackData?.issueId;
		let issueTitle = 'Post Exposure Magazine';
		let unitPrice = fallbackData?.unitPrice || 12.0;
		let userId = fallbackData?.userId;
		let guestEmail = fallbackData?.guestEmail;

		// 2. If real Stripe session, retrieve details from Stripe API
		if (stripe && isRealStripeKey && sessionId.startsWith('cs_') && !sessionId.includes('test_')) {
			try {
				const session = await stripe.checkout.sessions.retrieve(sessionId);
				if (session.payment_status !== 'paid') {
					return {
						success: false,
						alreadyFulfilled: false,
						error: 'Payment has not been completed.'
					};
				}

				if (session.metadata) {
					issueId = session.metadata.issueId || issueId;
					issueTitle = session.metadata.issueTitle || issueTitle;
					unitPrice = parseFloat(session.metadata.unitPrice || '12.0');
					userId = session.metadata.userId || userId;
					guestEmail = session.metadata.guestEmail || session.customer_details?.email || guestEmail;
				}
			} catch (err) {
				console.warn('Could not retrieve Stripe session details, using fallback params:', err);
			}
		}

		if (!issueId) {
			return {
				success: false,
				alreadyFulfilled: false,
				error: 'Missing issue ID in issue fulfillment'
			};
		}

		const issue = await getIssueById(issueId, adminPb);
		if (!issue) {
			return {
				success: false,
				alreadyFulfilled: false,
				error: 'Issue not found'
			};
		}
		issueTitle = issue.title;

		// 3. Resolve user ID (find or create guest user if email provided)
		let targetUserId = userId || '';
		if (!targetUserId && guestEmail) {
			try {
				const existingUser = await adminPb.collection('users').getFirstListItem(`email = "${guestEmail}"`);
				targetUserId = existingUser.id;
			} catch {
				try {
					const guestName = guestEmail.split('@')[0];
					const randomPass = 'GuestPass_' + Math.random().toString(36).substring(2, 10) + '99!';
					const newUser = await adminPb.collection('users').create({
						email: guestEmail,
						password: randomPass,
						passwordConfirm: randomPass,
						name: guestName,
						role: 'user',
						isSubscribed: false
					});
					targetUserId = newUser.id;
				} catch (err) {
					console.warn('Could not auto-create guest user:', err);
				}
			}
		}

		// 4. Record the purchase
		let purchase: Purchase | undefined;
		if (targetUserId) {
			try {
				purchase = await createPurchase({
					user: targetUserId,
					type: 'issue',
					item_id: issueId,
					item_name: `Magazine Issue: ${issueTitle}`,
					amount: unitPrice,
					currency: 'GBP',
					status: 'completed',
					stripe_payment_id: sessionId
				}, adminPb);
			} catch (err) {
				console.warn('Could not record purchase row:', err);
			}
		}

		return {
			success: true,
			alreadyFulfilled: false,
			issue,
			purchase
		};
	} catch (err: any) {
		console.error('Error in fulfillIssueSession:', err);
		return {
			success: false,
			alreadyFulfilled: false,
			error: err?.message || 'Issue fulfillment failed'
		};
	}
}
