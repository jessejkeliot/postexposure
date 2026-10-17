import type { PageServerLoad } from './$types';
import { getScreeningsForYear } from '$lib/pocketbase/db';

export const load: PageServerLoad = async ({ locals }) => {
	const screenings = await getScreeningsForYear(undefined, locals.pb);

	return {
		screenings
	};
};
