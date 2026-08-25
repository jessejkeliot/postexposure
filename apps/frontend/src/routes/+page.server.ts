import type { PageServerLoad } from './$types';
import { getRecentArticles } from '$lib/pocketbase/db';

export const load: PageServerLoad = async () => {
	const articles = await getRecentArticles(4);

	return {
		articles
	};
};
