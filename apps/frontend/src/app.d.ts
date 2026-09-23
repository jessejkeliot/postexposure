import type PocketBase from 'pocketbase';
import type { User as DbUser } from '$lib/types/database';

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			pb: PocketBase;
			user: (DbUser & {
				id: string;
				email: string;
				name: string;
				role?: string;
				isSubscribed?: boolean;
				subscriptionTier?: string;
				subscriptionExpiresAt?: string;
				emailVerified?: boolean;
				image?: string;
			}) | null;
			session: {
				id: string;
				userId: string;
				expiresAt: Date;
				[key: string]: unknown;
			} | null;
		}
		interface PageData {
			user?: (DbUser & {
				id: string;
				email: string;
				name: string;
				role?: string;
				isSubscribed?: boolean;
				subscriptionTier?: string;
				subscriptionExpiresAt?: string;
			}) | null;
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
