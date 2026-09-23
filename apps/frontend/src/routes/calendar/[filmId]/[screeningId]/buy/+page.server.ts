import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getFilmById, getScreeningById, getRemainingTickets } from '$lib/pocketbase/db';
import { createTicketCheckoutSession } from '$lib/server/stripe';
import { formatScreeningDate, formatScreeningTime } from '$lib/funcs/dates';

export const load: PageServerLoad = async ({ params, locals }) => {
	const film = await getFilmById(params.filmId);
	if (!film) {
		error(404, 'Film not found');
	}

	const screening = await getScreeningById(params.screeningId);
	if (!screening) {
		error(404, 'Screening not found');
	}

	return {
		film,
		screening,
		user: locals.user
	};
};

export const actions: Actions = {
	checkout: async ({ request, params, locals, url }) => {
		const film = await getFilmById(params.filmId);
		const screening = await getScreeningById(params.screeningId);
		
		


		if (!film || !screening) {
			return fail(404, { error: 'Film or screening not found' });
		}

		const remaining = getRemainingTickets(screening);
		if (remaining <= 0) {
			return fail(400, { error: 'Sorry, this screening is sold out.' });
		}

		const data = await request.formData();
		const quantity = Math.max(1, Math.min(Math.min(6, remaining), parseInt(data.get('quantity') as string, 10) || 1));
		
		if (quantity > remaining) {
			return fail(400, { error: `Only ${remaining} ticket(s) remaining for this screening.` });
		}

		const email = (data.get('email') as string)?.trim() || locals.user?.email || '';

		if (!email && !locals.user) {
			return fail(400, { error: 'Please sign in or provide an email address for your ticket confirmation.' });
		}

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
			unitPrice,
			quantity,
			userId,
			userEmail,
			origin: url.origin,
			isMemberDiscount: isSubscribed
		});

		redirect(303, checkout.url);
	}
};
