import type { PageServerLoad } from './$types';
import { getAllUpcomingScreenings } from '$lib/pocketbase/db';

export const load: PageServerLoad = async () => {
	const screenings = await getAllUpcomingScreenings();

	return {
		screenings
	};
};
