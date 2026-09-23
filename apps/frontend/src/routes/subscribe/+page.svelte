<script lang="ts">
	import type { PageProps } from './$types';
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';
	import BillingCycleToggle from '$lib/components/subscribe/BillingCycleToggle.svelte';
	import SubscriptionTierCard, { type Tier } from '$lib/components/subscribe/SubscriptionTierCard.svelte';
	import MembershipFAQ from '$lib/components/subscribe/MembershipFAQ.svelte';

	let { data }: PageProps = $props();
	const pageFlag = false;

	let billing = $state<'monthly' | 'annual'>('monthly');
	let loadingTier = $state<string | null>(null);
	let error = $state<string | null>(null);
	let guestEmail = $state('');

	const tiers: Tier[] = [
		{
			id: 'reader',
			name: 'Digital Reader',
			description: 'Complete digital access for passionate film readers and researchers.',
			priceMonthly: 8,
			priceAnnual: 80,
			features: [
				'Full access to all published digital magazine issues',
				'High-resolution PDF edition downloads',
				'Searchable retrospective film archive',
				'Weekly curated film digest email'
			]
		},
		{
			id: 'supporter',
			name: 'Supporter Membership',
			description: 'For cinema regulars wanting screening discounts and editorial deep dives.',
			priceMonthly: 15,
			priceAnnual: 150,
			popular: true,
			features: [
				'Everything in Digital Reader',
				'20% member discount on all screening tickets',
				'Priority ticket booking window for repertory seasons',
				'Exclusive longform critical essays & director interviews',
				'Post Exposure digital membership card'
			]
		},
		{
			id: 'patron',
			name: 'Curator Patron',
			description: 'Directly fund independent film preservation and repertory cinema programming.',
			priceMonthly: 30,
			priceAnnual: 300,
			features: [
				'Everything in Supporter Membership',
				'4 complimentary cinema screening tickets per year',
				'Annual limited-edition archival print publication',
				'Invitations to curator Q&As & preview screenings',
				'Special recognition in publication masthead'
			]
		}
	];

	async function handleSubscribe(tier: Tier) {
		error = null;

		if (!data.user && !guestEmail.trim()) {
			error = 'Please enter your email or sign in to subscribe.';
			return;
		}

		loadingTier = tier.id;

		try {
			const res = await fetch('/api/stripe/checkout', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					tier: tier.id,
					billing,
					email: data.user?.email || guestEmail.trim(),
					successUrl: `${window.location.origin}/subscribe/success?session_id={CHECKOUT_SESSION_ID}&tier=${tier.id}&billing=${billing}`
				})
			});

			const result = await res.json();

			if (!res.ok) {
				throw new Error(result.message || 'Failed to start Stripe checkout');
			}

			if (result.url) {
				window.location.href = result.url;
			} else if (result.redirectUrl) {
				goto(result.redirectUrl);
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'An error occurred while connecting to Stripe.';
			loadingTier = null;
		}
	}
</script>

<svelte:head>
	<title>Membership & Subscriptions | Post Exposure</title>
</svelte:head>

{#if pageFlag}
	<div class="mx-auto max-w-6xl space-y-12 py-6 sm:py-12">
		<!-- Page Header -->
		<div class="mx-auto max-w-2xl space-y-3 text-center">
			<span class="text-xs tracking-widest text-surface-500 uppercase">
				Support Independent Cinema & Criticism
			</span>
			<h1 class="text-4xl font-bold tracking-tight uppercase sm:text-6xl">Join Post Exposure</h1>
			<p class="text-sm leading-relaxed text-surface-600 sm:text-base dark:text-surface-400">
				Subscribe to unlock our complete digital magazine archive, gain priority cinema admission,
				and support deep, longform film scholarship.
			</p>

			<!-- Billing Cycle Toggle -->
			<BillingCycleToggle {billing} onChange={(cycle) => (billing = cycle)} />
		</div>

		<!-- Error Alert -->
		{#if error}
			<div
				class="mx-auto flex max-w-md items-center gap-2 border border-error-500/50 bg-error-500/10 p-4 text-xs text-error-600 dark:text-error-400"
			>
				<span class="icon-[boxicons--alert-circle] text-lg"></span>
				<span>{error}</span>
			</div>
		{/if}

		<!-- Guest Email Notice (if not logged in) -->
		{#if !data.user}
			<div
				class="mx-auto max-w-md space-y-2 border border-surface-300 bg-surface-50 p-4 text-xs dark:border-surface-700 dark:bg-surface-900"
			>
				<div class="flex items-center justify-between">
					<span class="font-bold tracking-wider text-surface-500 uppercase">Fast Checkout</span>
					<a
						href={resolve('/login?redirect=/subscribe')}
						class="font-bold uppercase underline hover:text-primary-500"
					>
						Or Sign In First ↗
					</a>
				</div>
				<input
					type="email"
					bind:value={guestEmail}
					placeholder="Enter your email for subscription receipt..."
					class="w-full border bg-surface-100 px-3 py-2 text-xs outline-none focus:border-surface-950 dark:bg-surface-800 dark:focus:border-surface-50"
				/>
			</div>
		{/if}

		<!-- Tier Cards Grid -->
		<div class="grid grid-cols-1 items-stretch gap-8 md:grid-cols-3">
			{#each tiers as tier, i (tier.id)}
				<SubscriptionTierCard
					{tier}
					tierIndex={i}
					{billing}
					{loadingTier}
					onSubscribe={handleSubscribe}
				/>
			{/each}
		</div>

		<!-- FAQ / Assurance Section -->
		<MembershipFAQ />
	</div>
{:else}
	<p>Unfinished</p>
{/if}
