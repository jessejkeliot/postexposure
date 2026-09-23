import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	const redirectTo = url.searchParams.get('redirect') || '/account';
	if (locals.user) {
		redirect(303, redirectTo);
	}
	return {
		redirectTo
	};
};
