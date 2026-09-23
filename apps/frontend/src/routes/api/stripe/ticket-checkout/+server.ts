import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getFilmById, getScreeningById } from '$lib/pocketbase/db';
import { createTicketCheckoutSession } from '$lib/server/stripe';
import { pbAdmin } from '$lib/server/auth';
import { formatScreeningDate, formatScreeningTime } from '$lib/funcs/dates';

export const POST: RequestHandler = async ({ request, locals, url }) => {
	const body = await request.json().catch(() => ({}));
	const { screeningId, quantity = 1, email } = body;

	if (!screeningId) {
		error(400, 'Missing screeningId');
	}

	const screening = await getScreeningById(screeningId, pbAdmin);
	if (!screening) {
		error(404, 'Screening not found');
	}

	const film = screening.film ? await getFilmById(screening.film, pbAdmin) : null;
	if (!film) {
		error(404, 'Film not found');
	}

	const numQuantity = Math.max(1, Math.min(6, parseInt(String(quantity), 10) || 1));
	const isSubscribed = Boolean(locals.user?.isSubscribed);
	const basePrice = screening.price ?? 12.0;
	const unitPrice = isSubscribed ? basePrice * 0.8 : basePrice;

	const userEmail = locals.user?.email || email || '';
	const userId = locals.user?.id || '';

	const checkout = await createTicketCheckoutSession({
		screeningId: screening.id,
		filmId: film.id,
		filmTitle: film.title,
		showingDate: screening.showing_date ? formatScreeningDate(screening.showing_date) : '',
		showingTime: screening.showing_date ? formatScreeningTime(screening.showing_date) : '',
		unitPrice,
		quantity: numQuantity,
		userId,
		userEmail,
		origin: url.origin,
		isMemberDiscount: isSubscribed
	});

	return json(checkout);
};
