import type { PageServerLoad } from './$types';
import { getRecentArticles, getScreeningsForYear } from '$lib/pocketbase/db';

export const load: PageServerLoad = async () => {
	const [articles, screenings] = await Promise.all([
		getRecentArticles(4),
		getScreeningsForYear()
	]);

	return {
		articles,
		screenings
	};
};
