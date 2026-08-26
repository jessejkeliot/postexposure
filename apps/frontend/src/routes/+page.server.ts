import type { PageServerLoad } from './$types';
import { getRecentArticles, getScreeningsForCurrentWeek } from '$lib/pocketbase/db';

export const load: PageServerLoad = async () => {
	const [articles, screenings] = await Promise.all([
		getRecentArticles(4),
		getScreeningsForCurrentWeek()
	]);

	return {
		articles,
		screenings
	};
};
