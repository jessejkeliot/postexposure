import type { PageServerLoad } from './$types';
import { getScreeningsForYear } from '$lib/pocketbase/db';

export const load: PageServerLoad = async () => {
	const screenings = await getScreeningsForYear();

	return {
		screenings
	};
};
