import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { Article } from '$lib/types/database';
import { getArticleBySlug, getArticleCoverUrl, getArticlesByCategory, getRecentArticles } from '$lib/pocketbase/db';

export const load: PageServerLoad = async ({ params }) => {
	const article = await getArticleBySlug(params.slug);

	if (!article) {
		error(404, 'Article not found');
	}
	const coverUrl = getArticleCoverUrl(article, { thumb: '1200x800' });

	// Fetch related articles (same category if available, excluding current article)
	let moreArticles: Article[] = [];
	if (article.category) {
		const categoryArticles = await getArticlesByCategory(article.category, 4);
		moreArticles = categoryArticles.filter((a) => a.id !== article.id);
	}

	// If fewer than 3 related articles found, supplement with recent articles
	if (moreArticles.length < 3) {
		const recent = await getRecentArticles(6);
		const filteredRecent = recent.filter(
			(a) => a.id !== article.id && !moreArticles.some((m) => m.id === a.id)
		);
		moreArticles = [...moreArticles, ...filteredRecent].slice(0, 3);
	} else {
		moreArticles = moreArticles.slice(0, 3);
	}

	return {
		article,
		coverUrl,
		moreArticles
	};
};
