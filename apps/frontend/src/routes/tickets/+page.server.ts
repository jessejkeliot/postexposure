import type { PageServerLoad } from './$types';
import { getUserTickets } from '$lib/pocketbase/db';
import type { Ticket } from '$lib/types/database';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		return {
			tickets: [] as Ticket[],
			user: null
		};
	}

	const tickets = await getUserTickets(locals.user.id, locals.pb);

	return {
		tickets,
		user: locals.user
	};
};
