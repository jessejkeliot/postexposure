import type { PageServerLoad } from './$types';
import { getRecentArticles, getScreeningsForYear } from '$lib/pocketbase/db';

export const load: PageServerLoad = async ({ locals }) => {
	const [articles, screenings] = await Promise.all([
		getRecentArticles(6, locals.pb),
		getScreeningsForYear(undefined, locals.pb)
	]);

	return {
		articles,
		screenings
	};
};
