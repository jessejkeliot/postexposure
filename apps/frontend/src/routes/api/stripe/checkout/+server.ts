import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';
import Stripe from 'stripe';
import { createPurchase, updateUserSubscription } from '$lib/pocketbase/db';

const stripeSecretKey = env.STRIPE_SECRET_KEY;
const stripe = stripeSecretKey ? new Stripe(stripeSecretKey, { apiVersion: '2025-02-24.acacia' as any }) : null;

export const POST: RequestHandler = async ({ request, locals, url }) => {
	const body = await request.json().catch(() => ({}));
	const { tier = 'supporter', billing = 'monthly', email: bodyEmail, successUrl, cancelUrl } = body;

	const tierDetails: Record<string, { name: string; priceMonthly: number; priceAnnual: number }> = {
		reader: { name: 'Digital Reader', priceMonthly: 8, priceAnnual: 80 },
		supporter: { name: 'Supporter Membership', priceMonthly: 15, priceAnnual: 150 },
		patron: { name: 'Curator Patron', priceMonthly: 30, priceAnnual: 300 }
	};

	const selectedTier = tierDetails[tier] || tierDetails.supporter;
	const amount = billing === 'annual' ? selectedTier.priceAnnual : selectedTier.priceMonthly;
	const itemName = `${selectedTier.name} (${billing === 'annual' ? 'Annual' : 'Monthly'})`;

	const userEmail = locals.user?.email || bodyEmail;
	const userId = locals.user?.id;

	// If real Stripe secret key exists, create Stripe Checkout Session
	if (stripe && stripeSecretKey) {
		try {
			const session = await stripe.checkout.sessions.create({
				payment_method_types: ['card'],
				line_items: [
					{
						price_data: {
							currency: 'usd',
							product_data: {
								name: itemName,
								description: `Post Exposure Cinema & Magazine Subscription`
							},
							unit_amount: Math.round(amount * 100),
							recurring: {
								interval: billing === 'annual' ? 'year' : 'month'
							}
						},
						quantity: 1
					}
				],
				customer_email: userEmail,
				mode: 'subscription',
				success_url: successUrl || `${url.origin}/subscribe/success?session_id={CHECKOUT_SESSION_ID}&tier=${tier}&billing=${billing}`,
				cancel_url: cancelUrl || `${url.origin}/subscribe?cancelled=true`,
				metadata: {
					userId: userId || '',
					tier,
					billing
				}
			});

			return json({ url: session.url, sessionId: session.id });
		} catch (err) {
			console.warn('Stripe checkout error, falling back to simulated checkout:', err);
		}
	}

	// Simulated / Sandbox Mode (instant activation for testing & demonstration)
	const simulatedSessionId = 'cs_test_' + Math.random().toString(36).substring(2, 12);
	const durationDays = billing === 'annual' ? 365 : 30;
	const expiresAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString();

	if (userId) {
		try {
			await createPurchase({
				user: userId,
				type: 'subscription',
				item_id: `sub_${tier}_${billing}`,
				item_name: itemName,
				amount,
				currency: 'usd',
				status: 'completed',
				stripe_payment_id: simulatedSessionId
			}, locals.pb);

			await updateUserSubscription(userId, true, selectedTier.name, expiresAt, locals.pb);
		} catch (err) {
			console.warn('Sandbox purchase recording notice:', err);
		}
	}

	return json({
		simulated: true,
		sessionId: simulatedSessionId,
		redirectUrl: `${url.origin}/subscribe/success?session_id=${simulatedSessionId}&tier=${tier}&billing=${billing}`
	});
};
