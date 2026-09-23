<script lang="ts">
	import type { PageProps } from './$types';
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';

	let { data }: PageProps = $props();
	const pageFlag = false;

	let billing = $state<'monthly' | 'annual'>('monthly');
	let loadingTier = $state<string | null>(null);
	let error = $state<string | null>(null);
	let guestEmail = $state('');

	interface Tier {
		id: string;
		name: string;
		description: string;
		priceMonthly: number;
		priceAnnual: number;
		popular?: boolean;
		features: string[];
	}

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
			<div class="flex items-center justify-center gap-3 pt-4">
				<div
					class="inline-flex border border-surface-300 bg-surface-100 p-1 text-xs dark:border-surface-700 dark:bg-surface-800"
				>
					<button
						type="button"
						onclick={() => (billing = 'monthly')}
						class="px-4 py-2 font-bold tracking-wider uppercase transition-colors {billing ===
						'monthly'
							? 'bg-surface-950 text-surface-50 shadow-sm dark:bg-surface-50 dark:text-surface-950'
							: 'text-surface-600 hover:opacity-80 dark:text-surface-400'}"
					>
						Monthly Billing
					</button>
					<button
						type="button"
						onclick={() => (billing = 'annual')}
						class="flex items-center gap-1.5 px-4 py-2 font-bold tracking-wider uppercase transition-colors {billing ===
						'annual'
							? 'bg-surface-950 text-surface-50 shadow-sm dark:bg-surface-50 dark:text-surface-950'
							: 'text-surface-600 hover:opacity-80 dark:text-surface-400'}"
					>
						<span>Annual Billing</span>
						<span
							class="py-0.2 rounded-sm bg-emerald-500 px-1.5 text-[9px] font-bold text-white uppercase"
						>
							Save 20%
						</span>
					</button>
				</div>
			</div>
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
			{#each tiers as tier (tier.id)}
				{@const price = billing === 'annual' ? tier.priceAnnual : tier.priceMonthly}
				{@const period = billing === 'annual' ? '/ year' : '/ month'}
				<div
					class="relative flex flex-col justify-between border {tier.popular
						? 'border-2 border-surface-950 shadow-lg dark:border-surface-50'
						: 'border-surface-300 dark:border-surface-700'} bg-surface-50 p-6 transition-all hover:border-surface-950 sm:p-8 dark:bg-surface-900 dark:hover:border-surface-100"
				>
					{#if tier.popular}
						<div
							class="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-surface-950 px-3 py-1 text-[10px] font-bold tracking-widest text-surface-50 uppercase dark:bg-surface-50 dark:text-surface-950"
						>
							Most Popular
						</div>
					{/if}

					<div>
						<!-- Tier Header -->
						<div class="border-b border-surface-200 pb-5 dark:border-surface-800">
							<span class="text-[10px] tracking-widest text-surface-500 uppercase">
								Tier // 0{tiers.indexOf(tier) + 1}
							</span>
							<h2 class="mt-1 text-2xl font-bold tracking-tight uppercase">{tier.name}</h2>
							<p class="mt-2 min-h-8 text-xs text-surface-600 dark:text-surface-400">
								{tier.description}
							</p>
						</div>

						<!-- Price Display -->
						<div
							class="flex items-baseline gap-1 border-b border-surface-200 py-6 dark:border-surface-800"
						>
							<span class="text-4xl font-bold tracking-tight sm:text-5xl">${price}</span>
							<span class="text-xs text-surface-500 uppercase">{period}</span>
						</div>

						<!-- Feature List -->
						<ul class="space-y-3 py-6 text-xs">
							{#each tier.features as feature}
								<li class="flex items-start gap-2.5">
									<span class="mt-0.5 icon-[boxicons--check] shrink-0 text-base text-emerald-500"
									></span>
									<span class="leading-snug text-surface-700 dark:text-surface-300">{feature}</span>
								</li>
							{/each}
						</ul>
					</div>

					<!-- Subscribe CTA Button -->
					<div class="border-t border-surface-200 pt-6 dark:border-surface-800">
						<button
							type="button"
							disabled={loadingTier !== null}
							onclick={() => handleSubscribe(tier)}
							class="w-full py-3.5 {tier.popular
								? 'bg-surface-950 font-bold tracking-widest text-surface-50 uppercase dark:bg-surface-50 dark:text-surface-950'
								: 'btn preset-outlined font-bold tracking-widest uppercase'} flex items-center justify-center gap-2 text-xs transition-opacity hover:opacity-90 disabled:opacity-50"
						>
							{#if loadingTier === tier.id}
								<span class="icon-[boxicons--loader-lines] animate-spin text-base"></span>
								<span>Connecting Stripe...</span>
							{:else}
								<span class="icon-[boxicons--credit-card]"></span>
								<span>Subscribe with Stripe</span>
							{/if}
						</button>

						<div
							class="mt-2 flex items-center justify-center gap-1.5 text-[10px] text-surface-500 uppercase"
						>
							<span class="icon-[boxicons--shield-quarter]"></span>
							<span>Secure 256-bit encrypted checkout</span>
						</div>
					</div>
				</div>
			{/each}
		</div>

		<!-- FAQ / Assurance Section -->
		<section
			class="mx-auto max-w-4xl space-y-8 border-t border-surface-300 pt-12 dark:border-surface-700"
		>
			<h2 class="text-center text-2xl font-bold tracking-tight uppercase">Membership FAQ</h2>
			<div class="grid grid-cols-1 gap-6 text-xs md:grid-cols-2">
				<div
					class="space-y-2 border border-surface-200 bg-surface-50 p-4 dark:border-surface-800 dark:bg-surface-900"
				>
					<h3 class="text-sm font-bold uppercase">Can I cancel anytime?</h3>
					<p class="leading-relaxed text-surface-600 dark:text-surface-400">
						Yes. You can easily manage and cancel your active subscription with one click from your
						Account settings whenever you wish.
					</p>
				</div>
				<div
					class="space-y-2 border border-surface-200 bg-surface-50 p-4 dark:border-surface-800 dark:bg-surface-900"
				>
					<h3 class="text-sm font-bold uppercase">How do screening discounts work?</h3>
					<p class="leading-relaxed text-surface-600 dark:text-surface-400">
						Once subscribed, your 20% discount is automatically applied to all repertory film
						screening reservations made through your account.
					</p>
				</div>
			</div>
		</section>
	</div>
{:else}
	<p>Unfinished</p>
{/if}
