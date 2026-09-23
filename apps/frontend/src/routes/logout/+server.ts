import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { auth } from '$lib/server/auth';

export const GET: RequestHandler = async ({ request, locals }) => {
	try {
		await auth.api.signOut({
			headers: request.headers
		});
	} catch (err) {
		console.warn('Logout error:', err);
	}

	locals.pb.authStore.clear();
	locals.user = null;
	locals.session = null;

	redirect(303, '/');
};

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		await auth.api.signOut({
			headers: request.headers
		});
	} catch (err) {
		console.warn('Logout error:', err);
	}

	locals.pb.authStore.clear();
	locals.user = null;
	locals.session = null;

	redirect(303, '/');
};
