import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getAllIssues, getIssueById } from '$lib/pocketbase/db';
import { createIssueCheckoutSession } from '$lib/server/stripe';

export const load: PageServerLoad = async ({ url, locals }) => {
	const issueId = url.searchParams.get('issueId') || url.searchParams.get('id');
	let issue = null;

	if (issueId) {
		issue = await getIssueById(issueId, locals.pb);
	}

	if (!issue) {
		const allIssues = await getAllIssues(locals.pb);
		if (allIssues.length > 0) {
			issue = allIssues[0];
		}
	}

	if (!issue) {
		error(404, 'Magazine issue not found');
	}

	return {
		issue,
		user: locals.user
	};
};

export const actions: Actions = {
	checkout: async ({ request, locals, url }) => {
		const data = await request.formData();
		const issueId = (data.get('issueId') as string)?.trim();
		const email = (data.get('email') as string)?.trim() || locals.user?.email || '';

		if (!issueId) {
			return fail(400, { error: 'Issue ID is required' });
		}

		const issue = await getIssueById(issueId, locals.pb);
		if (!issue) {
			return fail(404, { error: 'Issue not found' });
		}

		if (!email && !locals.user) {
			return fail(400, { error: 'Please sign in or provide an email address for your purchase receipt and PDF download link.' });
		}

		const isSubscribed = Boolean(locals.user?.isSubscribed);
		const basePrice = issue.price ?? 15.0;
		const unitPrice = isSubscribed ? basePrice * 0.8 : basePrice;

		const userEmail = locals.user?.email || email || '';
		const userId = locals.user?.id || '';

		const checkout = await createIssueCheckoutSession({
			issueId: issue.id,
			issueTitle: issue.title,
			unitPrice,
			userId,
			userEmail,
			origin: url.origin,
			isMemberDiscount: isSubscribed
		});

		redirect(303, checkout.url);
	}
};
