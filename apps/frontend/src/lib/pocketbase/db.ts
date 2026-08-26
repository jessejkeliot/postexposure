import { Temporal } from '@js-temporal/polyfill';
import type PocketBase from 'pocketbase';
import { pb as defaultClient } from './client';
import type { Article, Author, Category, Film, Screening, Season } from '$lib/types/database';
import { getWeekDateRange } from '$lib/funcs/dates';

export interface PaginationOptions {
	page?: number;
	perPage?: number;
	filter?: string;
	sort?: string;
	expand?: string;
}

export type TemporalDateInput =
	| Temporal.PlainDate
	| Temporal.PlainDateTime
	| Temporal.Instant
	| Temporal.ZonedDateTime
	| string
	| Date;

/**
 * Normalizes any temporal or date input into an ISO string format for PocketBase queries.
 */
export function toTemporalIsoString(date: TemporalDateInput): string {
	if (typeof date === 'string') {
		return date;
	}
	if (date instanceof Temporal.PlainDate) {
		return date.toPlainDateTime({ hour: 0, minute: 0, second: 0 }).toString({ smallestUnit: 'second' });
	}
	if (
		date instanceof Temporal.PlainDateTime ||
		date instanceof Temporal.Instant ||
		date instanceof Temporal.ZonedDateTime
	) {
		return date.toString();
	}
	if (date instanceof Date) {
		return Temporal.Instant.fromEpochMilliseconds(date.getTime()).toString();
	}
	return String(date);
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
	const res = await client.collection('articles').getList<Article>(1, limit, {
		sort: '-published_at',
		expand: 'category,author',
		filter: 'published_at != ""'
	});
	return res.items;
}

/**
 * Fetch articles published before a given Temporal date/instant.
 */
export async function getArticlesPublishedBefore(
	date: TemporalDateInput,
	limit = 10,
	client: PocketBase = defaultClient
): Promise<Article[]> {
	const iso = toTemporalIsoString(date);
	const res = await client.collection('articles').getList<Article>(1, limit, {
		filter: `published_at <= "${iso}" && published_at != ""`,
		sort: '-published_at',
		expand: 'category,author'
	});
	return res.items;
}

/**
 * Fetch articles published within a Temporal date range.
 */
export async function getArticlesByDateRange(
	startDate: TemporalDateInput,
	endDate: TemporalDateInput,
	client: PocketBase = defaultClient
): Promise<Article[]> {
	const startIso = toTemporalIsoString(startDate);
	const endIso = toTemporalIsoString(endDate);

	return await client.collection('articles').getFullList<Article>({
		filter: `published_at >= "${startIso}" && published_at <= "${endIso}"`,
		sort: '-published_at',
		expand: 'category,author'
	});
}

/**
 * Fetch paginated list of articles.
 */
export async function getArticles(
	options: PaginationOptions = {},
	client: PocketBase = defaultClient
) {
	const { page = 1, perPage = 10, filter, sort = '-published_at', expand = 'category,author' } = options;
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
		sort: '-published_at',
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
		sort: '-published_at',
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
		sort: '-published_at',
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
// Seasons, Films & Screenings Helpers (Temporal-powered)
// -------------------------------------------------------------

/**
 * Fetch active seasons relative to a Temporal instant or now.
 */
export async function getCurrentSeasons(
	referenceInstant: TemporalDateInput = Temporal.Now.instant(),
	client: PocketBase = defaultClient
): Promise<Season[]> {
	const iso = toTemporalIsoString(referenceInstant);
	return await client.collection('seasons').getFullList<Season>({
		filter: `end_date >= "${iso}"`,
		sort: 'start_date'
	});
}

export async function getAllFilms(client: PocketBase = defaultClient): Promise<Film[]> {
	return await client.collection('films').getFullList<Film>({
		sort: 'title'
	});
}

/**
 * Fetch screenings within a specific Temporal date range.
 */
export async function getScreeningsByDateRange(
	startDate: TemporalDateInput,
	endDate: TemporalDateInput,
	client: PocketBase = defaultClient
): Promise<Screening[]> {
	const startIso = toTemporalIsoString(startDate);
	const endIso = toTemporalIsoString(endDate);

	return await client.collection('screenings').getFullList<Screening>({
		filter: `showing_date >= "${startIso}" && showing_date <= "${endIso}"`,
		sort: 'showing_date,showing_time',
		expand: 'film'
	});
}

/**
 * Fetch screenings for the current week using Temporal PlainDate calculations.
 */
export async function getScreeningsForCurrentWeek(
	timeZone = Temporal.Now.timeZoneId(),
	client: PocketBase = defaultClient
): Promise<Screening[]> {
	const today = Temporal.Now.plainDateISO(timeZone);
	// dayOfWeek: 1 (Monday) to 7 (Sunday) in ISO calendar
	const {start, end} = getWeekDateRange(today, timeZone);

	const startOfWeekIso = start.toPlainDateTime({ hour: 0, minute: 0, second: 0 }).toString();
	const endOfWeekIso = end.toPlainDateTime({ hour: 23, minute: 59, second: 59 }).toString();

	return await getScreeningsByDateRange(startOfWeekIso, endOfWeekIso, client);
}

/**
 * Fetch upcoming screenings from today onwards using Temporal.
 */
export async function getUpcomingScreenings(
	limit = 10,
	from: TemporalDateInput = Temporal.Now.instant(),
	client: PocketBase = defaultClient
): Promise<Screening[]> {
	const iso = toTemporalIsoString(from);
	return await client.collection('screenings').getList<Screening>(1, limit, {
		filter: `showing_date >= "${iso}"`,
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
