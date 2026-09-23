import { betterAuth } from 'better-auth';
import { pocketBaseAdapter } from 'pocketbase-better-auth';
import { env } from '$env/dynamic/private';
import PocketBase from 'pocketbase';

const pbUrl = env.POCKETBASE_URL || 'http://127.0.0.1:8090';
const adminEmail = env.POCKETBASE_ADMIN_EMAIL || 'admin@magazine.com';
const adminPassword = env.POCKETBASE_ADMIN_PASSWORD || '12345678910';

export const pbAdmin = new PocketBase(pbUrl);

/**
 * Ensures pbAdmin has an active superuser authentication session.
 */
export async function getAdminPocketBase(): Promise<PocketBase> {
	if (pbAdmin.authStore.isValid) {
		return pbAdmin;
	}
	try {
		await pbAdmin.collection('_superusers').authWithPassword(adminEmail, adminPassword);
	} catch {
		try {
			await (pbAdmin as any).admins.authWithPassword(adminEmail, adminPassword);
		} catch (err) {
			console.warn('Could not authenticate PocketBase superuser client:', err);
		}
	}
	return pbAdmin;
}

// Better Auth PocketBase adapter instance
export const auth = betterAuth({
	baseURL: env.BETTER_AUTH_URL || 'http://localhost:5173',
	secret: env.BETTER_AUTH_SECRET || 'postexposure-better-auth-secret-key-cinema-123456789',
	database: pocketBaseAdapter({
		pb: {
			url: pbUrl,
			adminEmail,
			adminPassword
		},
		usePlural: true,
		debugLogs: false
	}),
	databaseHooks: {
		user: {
			create: {
				before: async (user) => {
					const randomPass = 'PbPass_' + Math.random().toString(36).substring(2, 10) + '99!';
					return {
						data: {
							...user,
							password: randomPass,
							passwordConfirm: randomPass
						}
					};
				}
			}
		}
	},
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: false
	},
	user: {
		additionalFields: {
			password: {
				type: 'string',
				required: false,
				input: false
			},
			passwordConfirm: {
				type: 'string',
				required: false,
				input: false
			},
			role: {
				type: 'string',
				required: false,
				defaultValue: 'user',
				input: true
			},
			isSubscribed: {
				type: 'boolean',
				required: false,
				defaultValue: false,
				input: true
			},
			subscriptionTier: {
				type: 'string',
				required: false,
				defaultValue: '',
				input: true
			},
			subscriptionExpiresAt: {
				type: 'string',
				required: false,
				defaultValue: '',
				input: true
			}
		}
	}
});

export type Auth = typeof auth;
