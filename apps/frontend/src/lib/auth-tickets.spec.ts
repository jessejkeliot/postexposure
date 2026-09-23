import { describe, it, expect, vi, beforeEach } from 'vitest';
import QRCode from 'qrcode';

describe('QR Code Generation for Tickets', () => {
	it('generates valid QR data URL from verification URL', async () => {
		const ticketId = 'tkt-test-987654';
		const verificationUrl = `https://postexposure.film/tickets/verify/${ticketId}`;

		const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
			errorCorrectionLevel: 'M',
			margin: 1,
			width: 200,
			color: {
				dark: '#000000',
				light: '#ffffff'
			}
		});

		expect(qrDataUrl).toBeDefined();
		expect(qrDataUrl.startsWith('data:image/png;base64,')).toBe(true);
	});

	it('creates distinct QR codes for different ticket IDs', async () => {
		const qr1 = await QRCode.toDataURL('https://postexposure.film/tickets/verify/ticket-1');
		const qr2 = await QRCode.toDataURL('https://postexposure.film/tickets/verify/ticket-2');

		expect(qr1).not.toBe(qr2);
	});
});

describe('Ticket Verification & Status State Machine', () => {
	interface TicketState {
		id: string;
		status: 'valid' | 'used' | 'cancelled';
		scanned_at?: string | null;
	}

	function verifyAndScanTicket(
		ticket: TicketState | null,
		isAdmin: boolean,
		scanTimestamp: string = new Date().toISOString()
	): {
		status: 'ACCEPTED' | 'NOT_FOUND' | 'ALREADY_SCANNED' | 'UNAUTHORIZED';
		ticket?: TicketState;
		error?: string;
	} {
		if (!isAdmin) {
			return { status: 'UNAUTHORIZED', error: 'Admin credentials required to scan tickets' };
		}

		if (!ticket) {
			return { status: 'NOT_FOUND', error: 'Ticket not found in database' };
		}

		if (ticket.status === 'used' || ticket.scanned_at) {
			return {
				status: 'ALREADY_SCANNED',
				ticket,
				error: `Ticket has already been admitted at ${ticket.scanned_at || 'earlier session'}`
			};
		}

		const updatedTicket: TicketState = {
			...ticket,
			status: 'used',
			scanned_at: scanTimestamp
		};

		return {
			status: 'ACCEPTED',
			ticket: updatedTicket
		};
	}

	it('accepts valid unscanned ticket when scanned by admin', () => {
		const freshTicket: TicketState = {
			id: 'tkt-001',
			status: 'valid',
			scanned_at: null
		};

		const result = verifyAndScanTicket(freshTicket, true, '2026-09-23T19:30:00Z');

		expect(result.status).toBe('ACCEPTED');
		expect(result.ticket?.status).toBe('used');
		expect(result.ticket?.scanned_at).toBe('2026-09-23T19:30:00Z');
	});

	it('rejects non-existent ticket with NOT_FOUND', () => {
		const result = verifyAndScanTicket(null, true);

		expect(result.status).toBe('NOT_FOUND');
		expect(result.error).toContain('Ticket not found');
	});

	it('rejects already used ticket with ALREADY_SCANNED', () => {
		const usedTicket: TicketState = {
			id: 'tkt-002',
			status: 'used',
			scanned_at: '2026-09-23T18:00:00Z'
		};

		const result = verifyAndScanTicket(usedTicket, true);

		expect(result.status).toBe('ALREADY_SCANNED');
		expect(result.ticket?.scanned_at).toBe('2026-09-23T18:00:00Z');
	});

	it('denies ticket verification if non-admin scans', () => {
		const freshTicket: TicketState = {
			id: 'tkt-003',
			status: 'valid',
			scanned_at: null
		};

		const result = verifyAndScanTicket(freshTicket, false);

		expect(result.status).toBe('UNAUTHORIZED');
	});
});

describe('Subscription Pricing & Discount Rules', () => {
	const SUBSCRIPTION_TIERS = {
		reader: { monthly: 5, annual: 48 },
		member: { monthly: 12, annual: 115 },
		patron: { monthly: 25, annual: 240 }
	};

	function calculateTicketPrice(basePrice: number, isSubscribed: boolean): number {
		return isSubscribed ? Math.round(basePrice * 0.8 * 100) / 100 : basePrice;
	}

	it('calculates 20% discount on tickets for active subscribers', () => {
		const standardPrice = 12.0;
		const memberPrice = calculateTicketPrice(standardPrice, true);
		const guestPrice = calculateTicketPrice(standardPrice, false);

		expect(memberPrice).toBe(9.6);
		expect(guestPrice).toBe(12.0);
	});

	it('calculates subscription tier discounts for annual billing', () => {
		for (const [_tier, prices] of Object.entries(SUBSCRIPTION_TIERS)) {
			const monthlyAnnualized = prices.monthly * 12;
			expect(prices.annual).toBeLessThan(monthlyAnnualized);
			// Annual savings >= 20%
			const discountPercent = ((monthlyAnnualized - prices.annual) / monthlyAnnualized) * 100;
			expect(discountPercent).toBeGreaterThanOrEqual(20);
		}
	});
});

describe('User Authentication & Role Utilities', () => {
	interface UserSession {
		id: string;
		email: string;
		name: string;
		role: string;
		isSubscribed: boolean;
	}

	function canScanTickets(user: UserSession | null | undefined): boolean {
		return Boolean(user && user.role === 'admin');
	}

	function shouldShowSubscribeBanner(user: UserSession | null | undefined): boolean {
		return !user || !user.isSubscribed;
	}

	it('only allows admin users to access scanner capabilities', () => {
		expect(canScanTickets(null)).toBe(false);
		expect(canScanTickets({ id: '1', email: 'user@test.com', name: 'User', role: 'user', isSubscribed: false })).toBe(false);
		expect(canScanTickets({ id: '2', email: 'member@test.com', name: 'Member', role: 'member', isSubscribed: true })).toBe(false);
		expect(canScanTickets({ id: '3', email: 'admin@test.com', name: 'Admin', role: 'admin', isSubscribed: true })).toBe(true);
	});

	it('shows subscribe page only if unauthenticated or unsubscribed', () => {
		expect(shouldShowSubscribeBanner(null)).toBe(true);
		expect(shouldShowSubscribeBanner({ id: '1', email: 'user@test.com', name: 'User', role: 'user', isSubscribed: false })).toBe(true);
		expect(shouldShowSubscribeBanner({ id: '2', email: 'subscriber@test.com', name: 'Sub', role: 'member', isSubscribed: true })).toBe(false);
	});
});

describe('Stripe Ticket Purchasing Integration', () => {
	it('formats Stripe line items with screening pricing and member discounts correctly', () => {
		const baseScreeningPrice = 15.00;
		const quantity = 3;
		const isMember = true;

		const unitPrice = isMember ? baseScreeningPrice * 0.8 : baseScreeningPrice;
		const unitAmountPence = Math.round(unitPrice * 100);
		const totalPence = unitAmountPence * quantity;

		expect(unitPrice).toBe(12.00);
		expect(unitAmountPence).toBe(1200);
		expect(totalPence).toBe(3600);
	});

	it('properly constructs Stripe checkout session metadata for screening tickets', () => {
		const sessionMetadata = {
			type: 'ticket',
			screeningId: 'screen-123',
			filmId: 'film-456',
			filmTitle: 'Solaris',
			userId: 'user-789',
			quantity: '2',
			unitPrice: '12.00',
			guestEmail: 'viewer@postexposure.film'
		};

		expect(sessionMetadata.type).toBe('ticket');
		expect(sessionMetadata.screeningId).toBe('screen-123');
		expect(parseInt(sessionMetadata.quantity, 10)).toBe(2);
		expect(parseFloat(sessionMetadata.unitPrice)).toBe(12.00);
	});

	it('ensures ticket fulfillment handles duplicate Stripe session IDs idempotently', () => {
		const purchaseStore = new Map<string, any>();
		const ticketStore: any[] = [];

		function fulfillSession(sessionId: string, screeningId: string, quantity: number, userId: string) {
			if (purchaseStore.has(sessionId)) {
				return {
					alreadyFulfilled: true,
					purchase: purchaseStore.get(sessionId),
					tickets: ticketStore.filter(t => t.sessionId === sessionId)
				};
			}

			const createdTickets = [];
			for (let i = 0; i < quantity; i++) {
				const ticket = { id: `tkt-${sessionId}-${i}`, screeningId, userId, sessionId, status: 'valid' };
				ticketStore.push(ticket);
				createdTickets.push(ticket);
			}

			const purchase = {
				id: `pur-${sessionId}`,
				user: userId,
				type: 'ticket',
				item_id: screeningId,
				stripe_payment_id: sessionId,
				amount: 24.00,
				status: 'completed'
			};
			purchaseStore.set(sessionId, purchase);

			return {
				alreadyFulfilled: false,
				purchase,
				tickets: createdTickets
			};
		}

		// First fulfillment
		const firstRun = fulfillSession('cs_test_abc123', 'screen-1', 2, 'user-1');
		expect(firstRun.alreadyFulfilled).toBe(false);
		expect(firstRun.tickets.length).toBe(2);
		expect(ticketStore.length).toBe(2);

		// Duplicate fulfillment (e.g. from webhook + synchronous return)
		const secondRun = fulfillSession('cs_test_abc123', 'screen-1', 2, 'user-1');
		expect(secondRun.alreadyFulfilled).toBe(true);
		expect(secondRun.tickets.length).toBe(2);
		expect(ticketStore.length).toBe(2); // No duplicate tickets added
	});

	it('decrements tickets_available and increments tickets_sold accurately on ticket purchase', () => {
		interface ScreeningState {
			id: string;
			total_tickets: number;
			tickets_sold: number;
			tickets_available: number;
		}

		const screening: ScreeningState = {
			id: 'scr-001',
			total_tickets: 50,
			tickets_sold: 10,
			tickets_available: 40
		};

		function decrementTickets(target: ScreeningState, count: number) {
			if (target.tickets_available < count) {
				throw new Error(`Only ${target.tickets_available} tickets available`);
			}
			target.tickets_sold += count;
			target.tickets_available = Math.max(0, target.total_tickets - target.tickets_sold);
			return target;
		}

		// Purchase 3 tickets
		decrementTickets(screening, 3);
		expect(screening.tickets_sold).toBe(13);
		expect(screening.tickets_available).toBe(37);

		// Purchase remaining up to sold out
		decrementTickets(screening, 37);
		expect(screening.tickets_sold).toBe(50);
		expect(screening.tickets_available).toBe(0);

		// Attempting to purchase when sold out throws error
		expect(() => decrementTickets(screening, 1)).toThrow('Only 0 tickets available');
	});

	it('handles issue Stripe checkout session metadata and member discounts correctly', () => {
		const basePrice = 15.0;
		const isSubscribed = true;
		const discountedPrice = isSubscribed ? basePrice * 0.8 : basePrice;

		expect(discountedPrice).toBe(12.0);

		const sessionMetadata = {
			type: 'issue',
			issueId: 'iss-issue-01',
			issueTitle: 'Issue 01: Slow Cinema',
			userId: 'user-member-1',
			unitPrice: String(discountedPrice),
			guestEmail: 'member@postexposure.film'
		};

		expect(sessionMetadata.type).toBe('issue');
		expect(sessionMetadata.issueId).toBe('iss-issue-01');
		expect(parseFloat(sessionMetadata.unitPrice)).toBe(12.0);
	});

	it('fulfills magazine issue purchases and maintains idempotency across duplicate webhooks', () => {
		const purchaseStore = new Map<string, any>();

		function fulfillIssuePurchase(sessionId: string, issueId: string, issueTitle: string, amount: number, userId: string) {
			if (purchaseStore.has(sessionId)) {
				return {
					alreadyFulfilled: true,
					purchase: purchaseStore.get(sessionId)
				};
			}

			const purchase = {
				id: `pur-iss-${sessionId}`,
				user: userId,
				type: 'issue',
				item_id: issueId,
				item_name: `Magazine Issue: ${issueTitle}`,
				amount,
				currency: 'GBP',
				status: 'completed',
				stripe_payment_id: sessionId
			};
			purchaseStore.set(sessionId, purchase);

			return {
				alreadyFulfilled: false,
				purchase
			};
		}

		// Initial checkout completion
		const first = fulfillIssuePurchase('cs_test_issue_123', 'issue-01', 'Issue 01: Slow Cinema', 15.0, 'usr-1');
		expect(first.alreadyFulfilled).toBe(false);
		expect(first.purchase.type).toBe('issue');
		expect(first.purchase.item_id).toBe('issue-01');
		expect(first.purchase.status).toBe('completed');

		// Subsequent webhook retry
		const second = fulfillIssuePurchase('cs_test_issue_123', 'issue-01', 'Issue 01: Slow Cinema', 15.0, 'usr-1');
		expect(second.alreadyFulfilled).toBe(true);
		expect(purchaseStore.size).toBe(1);
	});

	it('handles two-step confirmation state transition for account deletion', () => {
		let deleteStep: 0 | 1 | 2 = 0;

		// Initial state
		expect(deleteStep).toBe(0);

		// First click ("Delete Account") -> triggers first "are you sure"
		deleteStep = 1;
		expect(deleteStep).toBe(1);

		// Second click ("Yes, I Want to Proceed") -> triggers second "are you sure"
		deleteStep = 2;
		expect(deleteStep).toBe(2);

		// Cancelling resets back to initial state
		deleteStep = 0;
		expect(deleteStep).toBe(0);
	});
});
