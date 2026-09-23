import type { PageServerLoad } from './$types';
import { getAllIssues } from '$lib/pocketbase/db';

export const load: PageServerLoad = async ({ locals }) => {
	const pbClient = locals.pb;
	const issues = await getAllIssues(pbClient);

	const latestIssue = issues.length > 0 ? issues[0] : null;
	const pastIssues = issues.length > 1 ? issues.slice(1) : [];

	return {
		latestIssue,
		pastIssues,
		allIssues: issues
	};
};
