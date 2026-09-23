import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { fulfillTicketSession } from '$lib/server/stripe';

export const load: PageServerLoad = async ({ url, locals }) => {
	const sessionId = url.searchParams.get('session_id');

	if (!sessionId) {
		error(400, 'Missing Stripe checkout session ID.');
	}

	const screeningId = url.searchParams.get('screening_id') || undefined;
	const filmId = url.searchParams.get('film_id') || undefined;
	const quantityStr = url.searchParams.get('quantity');
	const quantity = quantityStr ? parseInt(quantityStr, 10) : undefined;
	const unitPriceStr = url.searchParams.get('unit_price');
	const unitPrice = unitPriceStr ? parseFloat(unitPriceStr) : undefined;
	const userId = url.searchParams.get('user_id') || locals.user?.id || undefined;
	const guestEmail = url.searchParams.get('guest_email') || locals.user?.email || undefined;

	const fulfillment = await fulfillTicketSession(sessionId, {
		screeningId,
		filmId,
		quantity,
		unitPrice,
		userId,
		guestEmail
	});

	if (!fulfillment.success && fulfillment.tickets.length === 0) {
		error(400, fulfillment.error || 'Ticket fulfillment could not be completed.');
	}

	return {
		sessionId,
		tickets: fulfillment.tickets,
		purchase: fulfillment.purchase,
		user: locals.user
	};
};
