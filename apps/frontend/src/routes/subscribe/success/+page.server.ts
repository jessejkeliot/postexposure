import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, locals }) => {
	const tier = url.searchParams.get('tier') || 'supporter';
	const billing = url.searchParams.get('billing') || 'monthly';
	const sessionId = url.searchParams.get('session_id') || '';

	return {
		tier,
		billing,
		sessionId,
		user: locals.user
	};
};
