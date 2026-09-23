import { redirect, fail, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getUserPurchases, getUserTickets } from '$lib/pocketbase/db';
import { auth, getAdminPocketBase } from '$lib/server/auth';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		redirect(303, '/login?redirect=/account');
	}

	const [purchases, tickets] = await Promise.all([
		getUserPurchases(locals.user.id, locals.pb),
		getUserTickets(locals.user.id, locals.pb)
	]);

	return {
		user: locals.user,
		purchases,
		tickets
	};
};

export const actions: Actions = {
	updateProfile: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { message: 'Unauthorized' });
		}

		const data = await request.formData();
		const name = data.get('name')?.toString();

		if (!name || !name.trim()) {
			return fail(400, { message: 'Name is required' });
		}

		try {
			await locals.pb.collection('users').update(locals.user.id, {
				name: name.trim()
			});
			return { success: true, message: 'Profile updated successfully' };
		} catch (err) {
			return fail(500, { message: err instanceof Error ? err.message : 'Failed to update profile' });
		}
	},

	cancelSubscription: async ({ locals }) => {
		if (!locals.user) {
			return fail(401, { message: 'Unauthorized' });
		}

		try {
			await locals.pb.collection('users').update(locals.user.id, {
				isSubscribed: false,
				subscriptionTier: '',
				subscriptionExpiresAt: ''
			});
			return { success: true, message: 'Subscription cancelled.' };
		} catch (err) {
			return fail(500, { message: err instanceof Error ? err.message : 'Failed to cancel subscription' });
		}
	},

	deleteAccount: async ({ request, locals, cookies }) => {
		if (!locals.user) {
			return fail(401, { message: 'Unauthorized' });
		}

		const userId = locals.user.id;
		const pbAdmin = await getAdminPocketBase();

		try {
			// Sign out better-auth session if possible
			try {
				await auth.api.signOut({
					headers: request.headers
				});
			} catch (err) {
				console.warn('Better auth sign out error before delete:', err);
			}

			// Clean up sessions and accounts records for user
			try {
				const sessions = await pbAdmin.collection('sessions').getFullList({
					filter: `userId = "${userId}"`
				});
				for (const s of sessions) {
					await pbAdmin.collection('sessions').delete(s.id);
				}
			} catch {}

			try {
				const accounts = await pbAdmin.collection('accounts').getFullList({
					filter: `userId = "${userId}"`
				});
				for (const a of accounts) {
					await pbAdmin.collection('accounts').delete(a.id);
				}
			} catch {}

			// Delete user record from PocketBase
			await pbAdmin.collection('users').delete(userId);

			// Clear session cookies and local auth state
			cookies.delete('better-auth.session_token', { path: '/' });
			cookies.delete('better-auth.session_data', { path: '/' });
			cookies.delete('pb_auth', { path: '/' });
			locals.pb.authStore.clear();
			locals.user = null;
			locals.session = null;
		} catch (err) {
			console.error('Account deletion error:', err);
			return fail(500, { message: err instanceof Error ? err.message : 'Failed to delete account' });
		}

		redirect(303, '/');
	}
};
