import type PocketBase from 'pocketbase';
import { pb as defaultClient } from './client';
import type { Article, Author, Category, Film, Screening, Season } from '$lib/types/database';

export interface PaginationOptions {
	page?: number;
	perPage?: number;
	filter?: string;
	sort?: string;
	expand?: string;
}

// -------------------------------------------------------------
// Articles Helpers
// -------------------------------------------------------------

/**
 * Fetch the most recent articles.
 */
export async function getRecentArticles(
	limit = 10,
	client: PocketBase = defaultClient
): Promise<Article[]> {
	return await client.collection('articles').getFullList<Article>({
		batch: limit,
		sort: '-published_at,-created',
		expand: 'category,author',
		filter: 'published_at != null'
	});
}

/**
 * Fetch paginated list of articles.
 */
export async function getArticles(
	options: PaginationOptions = {},
	client: PocketBase = defaultClient
) {
	const { page = 1, perPage = 10, filter, sort = '-published_at,-created', expand = 'category,author' } = options;
	return await client.collection('articles').getList<Article>(page, perPage, {
		filter,
		sort,
		expand
	});
}

/**
 * Fetch a single article by slug.
 */
export async function getArticleBySlug(
	slug: string,
	client: PocketBase = defaultClient
): Promise<Article | null> {
	try {
		return await client.collection('articles').getFirstListItem<Article>(`slug="${slug}"`, {
			expand: 'category,author'
		});
	} catch {
		return null;
	}
}

/**
 * Fetch a single article by ID.
 */
export async function getArticleById(
	id: string,
	client: PocketBase = defaultClient
): Promise<Article | null> {
	try {
		return await client.collection('articles').getOne<Article>(id, {
			expand: 'category,author'
		});
	} catch {
		return null;
	}
}

/**
 * Fetch N articles by a specific author ID.
 */
export async function getArticlesByAuthor(
	authorId: string,
	limit = 10,
	client: PocketBase = defaultClient
): Promise<Article[]> {
	return await client.collection('articles').getList<Article>(1, limit, {
		filter: `author="${authorId}"`,
		sort: '-published_at,-created',
		expand: 'category,author'
	}).then((res) => res.items);
}

/**
 * Fetch N articles in a specific category ID.
 */
export async function getArticlesByCategory(
	categoryId: string,
	limit = 10,
	client: PocketBase = defaultClient
): Promise<Article[]> {
	return await client.collection('articles').getList<Article>(1, limit, {
		filter: `category="${categoryId}"`,
		sort: '-published_at,-created',
		expand: 'category,author'
	}).then((res) => res.items);
}

/**
 * Search articles by query in title, excerpt, or content.
 */
export async function searchArticles(
	query: string,
	limit = 10,
	client: PocketBase = defaultClient
): Promise<Article[]> {
	const sanitized = query.replace(/"/g, '\\"');
	return await client.collection('articles').getList<Article>(1, limit, {
		filter: `title ~ "${sanitized}" || excerpt ~ "${sanitized}"`,
		sort: '-published_at,-created',
		expand: 'category,author'
	}).then((res) => res.items);
}

// -------------------------------------------------------------
// Authors & Categories Helpers
// -------------------------------------------------------------

export async function getAllCategories(client: PocketBase = defaultClient): Promise<Category[]> {
	return await client.collection('categories').getFullList<Category>({
		sort: 'name'
	});
}

export async function getCategoryBySlug(
	slug: string,
	client: PocketBase = defaultClient
): Promise<Category | null> {
	try {
		return await client.collection('categories').getFirstListItem<Category>(`slug="${slug}"`);
	} catch {
		return null;
	}
}

export async function getAllAuthors(client: PocketBase = defaultClient): Promise<Author[]> {
	return await client.collection('authors').getFullList<Author>({
		sort: 'name'
	});
}

export async function getAuthorById(
	id: string,
	client: PocketBase = defaultClient
): Promise<Author | null> {
	try {
		return await client.collection('authors').getOne<Author>(id);
	} catch {
		return null;
	}
}

// -------------------------------------------------------------
// Seasons, Films & Screenings Helpers
// -------------------------------------------------------------

export async function getCurrentSeasons(client: PocketBase = defaultClient): Promise<Season[]> {
	const now = new Date().toISOString();
	return await client.collection('seasons').getFullList<Season>({
		filter: `end_date >= "${now}"`,
		sort: 'start_date'
	});
}

export async function getAllFilms(client: PocketBase = defaultClient): Promise<Film[]> {
	return await client.collection('films').getFullList<Film>({
		sort: 'title'
	});
}

/**
 * Fetch screenings within a specific date range (ISO strings or Date objects).
 */
export async function getScreeningsByDateRange(
	startDate: Date | string,
	endDate: Date | string,
	client: PocketBase = defaultClient
): Promise<Screening[]> {
	const startIso = typeof startDate === 'string' ? startDate : startDate.toISOString();
	const endIso = typeof endDate === 'string' ? endDate : endDate.toISOString();

	return await client.collection('screenings').getFullList<Screening>({
		filter: `showing_date >= "${startIso}" && showing_date <= "${endIso}"`,
		sort: 'showing_date,showing_time',
		expand: 'film'
	});
}

/**
 * Fetch upcoming screenings from today onwards.
 */
export async function getUpcomingScreenings(
	limit = 10,
	client: PocketBase = defaultClient
): Promise<Screening[]> {
	const now = new Date().toISOString();
	return await client.collection('screenings').getList<Screening>(1, limit, {
		filter: `showing_date >= "${now}"`,
		sort: 'showing_date,showing_time',
		expand: 'film'
	}).then((res) => res.items);
}

/**
 * Helper to build PocketBase file URL.
 */
export function getFileUrl(
	record: { id: string; collectionId?: string; collectionName?: string },
	filename: string,
	options: { thumb?: string } = {},
	client: PocketBase = defaultClient
): string {
	if (!filename) return '';
	return client.files.getURL(record, filename, options);
}
