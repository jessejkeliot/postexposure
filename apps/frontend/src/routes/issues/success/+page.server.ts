import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { fulfillIssueSession } from '$lib/server/stripe';
import { getIssueById, getIssuePdfUrl } from '$lib/pocketbase/db';

export const load: PageServerLoad = async ({ url, locals }) => {
	const sessionId = url.searchParams.get('session_id');
	const issueIdParam = url.searchParams.get('issue_id');
	const unitPriceParam = url.searchParams.get('unit_price');
	const userIdParam = url.searchParams.get('user_id') || locals.user?.id;
	const guestEmailParam = url.searchParams.get('guest_email') || locals.user?.email;

	let issue = null;
	let purchase = null;

	if (sessionId) {
		const fulfillment = await fulfillIssueSession(sessionId, {
			issueId: issueIdParam || undefined,
			unitPrice: unitPriceParam ? parseFloat(unitPriceParam) : undefined,
			userId: userIdParam || undefined,
			guestEmail: guestEmailParam || undefined
		});

		if (fulfillment.issue) {
			issue = fulfillment.issue;
		}
		if (fulfillment.purchase) {
			purchase = fulfillment.purchase;
		}
	}

	if (!issue && issueIdParam) {
		issue = await getIssueById(issueIdParam, locals.pb);
	}

	if (!issue) {
		error(404, 'Magazine issue or purchase receipt not found');
	}

	const pdfUrl = getIssuePdfUrl(issue);

	return {
		issue,
		purchase,
		pdfUrl,
		user: locals.user,
		sessionId
	};
};
