import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';
import { stripe, fulfillTicketSession, fulfillIssueSession } from '$lib/server/stripe';

export const POST: RequestHandler = async ({ request }) => {
	const webhookSecret = env.STRIPE_WEBHOOK_SECRET;
	const body = await request.text();
	const sig = request.headers.get('stripe-signature');

	let event: any;

	if (stripe && webhookSecret && sig) {
		try {
			event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
		} catch (err: any) {
			console.error('Webhook signature verification failed:', err.message);
			return json({ error: 'Webhook signature verification failed' }, { status: 400 });
		}
	} else {
		try {
			event = JSON.parse(body);
		} catch {
			return json({ error: 'Invalid JSON payload' }, { status: 400 });
		}
	}

	if (event.type === 'checkout.session.completed') {
		const session = event.data.object;
		if (session.metadata?.type === 'ticket') {
			await fulfillTicketSession(session.id);
		} else if (session.metadata?.type === 'issue') {
			await fulfillIssueSession(session.id);
		}
	}

	return json({ received: true });
};
