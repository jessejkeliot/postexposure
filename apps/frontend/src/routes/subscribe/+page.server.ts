import { redirect, fail, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { createPurchase, updateUserSubscription } from '$lib/pocketbase/db';

export const load: PageServerLoad = async ({ locals }) => {
	// Gating: If logged in and ALREADY subscribed, redirect away to account page
	if (locals.user && locals.user.isSubscribed) {
		redirect(303, '/account?already_subscribed=true');
	}

	return {
		user: locals.user
	};
};

export const actions: Actions = {
	subscribeDirect: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { message: 'Please log in or register before subscribing.' });
		}

		const data = await request.formData();
		const tier = data.get('tier')?.toString() || 'supporter';
		const billing = data.get('billing')?.toString() || 'monthly';

		const tierDetails: Record<string, { name: string; priceMonthly: number; priceAnnual: number }> = {
			reader: { name: 'Digital Reader', priceMonthly: 8, priceAnnual: 80 },
			supporter: { name: 'Supporter Membership', priceMonthly: 15, priceAnnual: 150 },
			patron: { name: 'Curator Patron', priceMonthly: 30, priceAnnual: 300 }
		};

		const selectedTier = tierDetails[tier] || tierDetails.supporter;
		const amount = billing === 'annual' ? selectedTier.priceAnnual : selectedTier.priceMonthly;
		const durationDays = billing === 'annual' ? 365 : 30;
		const expiresAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString();
		const paymentId = 'stripe_sub_' + Math.random().toString(36).substring(2, 12);

		try {
			await createPurchase({
				user: locals.user.id,
				type: 'subscription',
				item_id: `sub_${tier}_${billing}`,
				item_name: `${selectedTier.name} (${billing === 'annual' ? 'Annual' : 'Monthly'})`,
				amount,
				currency: 'usd',
				status: 'completed',
				stripe_payment_id: paymentId
			}, locals.pb);

			await updateUserSubscription(locals.user.id, true, selectedTier.name, expiresAt, locals.pb);

			redirect(303, `/subscribe/success?tier=${tier}&billing=${billing}`);
		} catch (err) {
			if (err && typeof err === 'object' && 'status' in err && (err as { status: number }).status === 303) {
				throw err;
			}
			return fail(500, { message: err instanceof Error ? err.message : 'Subscription failed' });
		}
	}
};
