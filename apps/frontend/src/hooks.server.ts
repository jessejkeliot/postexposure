import PocketBase from 'pocketbase';
import { env } from '$env/dynamic/private';
import type { Handle } from '@sveltejs/kit';
import { auth } from '$lib/server/auth';

export const handle: Handle = async ({ event, resolve }) => {
	// 1. Create a fresh PocketBase instance per request
	event.locals.pb = new PocketBase(env.POCKETBASE_URL || 'http://127.0.0.1:8090');
	event.locals.user = null;
	event.locals.session = null;

	// 2. Try to get session from Better Auth
	try {
		const session = await auth.api.getSession({
			headers: event.request.headers
		});

		if (session && session.user) {
			event.locals.session = session.session;
			event.locals.user = {
				id: session.user.id,
				email: session.user.email,
				name: session.user.name,
				role: (session.user as Record<string, unknown>).role as string || 'user',
				isSubscribed: Boolean((session.user as Record<string, unknown>).isSubscribed),
				subscriptionTier: (session.user as Record<string, unknown>).subscriptionTier as string || '',
				subscriptionExpiresAt: (session.user as Record<string, unknown>).subscriptionExpiresAt as string || '',
				emailVerified: session.user.emailVerified,
				image: session.user.image || undefined
			};
		}
	} catch (err) {
		console.warn('Better Auth session retrieval error in hook:', err);
	}

	// 3. Fallback to PocketBase authStore if Better Auth returned no session
	if (!event.locals.user) {
		event.locals.pb.authStore.loadFromCookie(event.request.headers.get('cookie') || '');
		try {
			if (event.locals.pb.authStore.isValid) {
				await event.locals.pb.collection('users').authRefresh();
				const record = event.locals.pb.authStore.record;
				if (record) {
					event.locals.user = {
						id: record.id,
						email: record.email,
						name: record.name || record.email.split('@')[0],
						role: record.role || 'user',
						isSubscribed: Boolean(record.isSubscribed),
						subscriptionTier: record.subscriptionTier || '',
						subscriptionExpiresAt: record.subscriptionExpiresAt || '',
						emailVerified: Boolean(record.verified)
					};
				}
			}
		} catch {
			event.locals.pb.authStore.clear();
		}
	}

	// 4. Process the request
	const response = await resolve(event);

	// 5. Append PocketBase auth cookie if active
	if (event.locals.pb.authStore.isValid) {
		response.headers.append(
			'set-cookie',
			event.locals.pb.authStore.exportToCookie({
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				sameSite: 'lax',
				path: '/'
			})
		);
	}

	return response;
};
