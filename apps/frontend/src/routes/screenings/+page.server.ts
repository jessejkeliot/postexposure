import type { PageServerLoad } from './$types';
import { getAllUpcomingScreenings } from '$lib/pocketbase/db';

export const load: PageServerLoad = async ({ locals }) => {
	const screenings = await getAllUpcomingScreenings(undefined, locals.pb);

	return {
		screenings
	};
};
