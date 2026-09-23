<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import type { ActionData, PageProps } from './$types';
	import IssueCoverFlip from '$lib/components/IssueCoverFlip.svelte';

	let { data, form }: PageProps & { form?: ActionData } = $props();

	let isSubmitting = $state(false);

	const issue = $derived(data.issue);
	const basePrice = $derived(issue.price ?? 15.0);
	const isSubscribed = $derived(Boolean(data.user?.isSubscribed));
	const unitPrice = $derived(isSubscribed ? basePrice * 0.8 : basePrice);
	const formattedTotal = $derived(unitPrice.toFixed(2));
	const savings = $derived(isSubscribed ? (basePrice - unitPrice).toFixed(2) : '0.00');

	const formattedDate = $derived(
		issue.publish_date
			? new Intl.DateTimeFormat('en-UK', {
					month: 'long',
					year: 'numeric'
				}).format(new Date(issue.publish_date))
			: null
	);
</script>

<svelte:head>
	<title>Purchase Issue: {issue.title} | Post Exposure</title>
	<meta
		name="description"
		content="Order digital PDF and print edition of {issue.title} from Post Exposure Magazine."
	/>
</svelte:head>

<div class="mx-auto max-w-3xl py-8">
	<!-- Back Link -->
	<a
		href={resolve('/issues')}
		class="inline-flex items-center gap-1 text-xs uppercase tracking-widest hover:opacity-75 mb-6"
	>
		<span class="icon-[boxicons--chevron-left] btn-icon-sm"></span>
		<span>Back to Issues</span>
	</a>

	<div class="border-2 border-surface-950 dark:border-surface-50 p-6 md:p-8 bg-surface-50 dark:bg-surface-950">
		<div class="border-b-2 border-surface-950 dark:border-surface-50 pb-6 mb-6">
			<div class="flex items-center justify-between text-xs uppercase tracking-widest opacity-60 mb-2">
				<span>Magazine Edition Purchase</span>
				<span>Instant PDF Download + Archive</span>
			</div>
			<h1 class="text-3xl md:text-5xl font-bold tracking-tight uppercase">
				{issue.title}
			</h1>
			{#if formattedDate}
				<p class="text-sm mt-1 opacity-80">
					Published {formattedDate}
				</p>
			{/if}
		</div>

		<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
			<div class="md:col-span-1 flex justify-center">
				<div class="w-full max-w-[240px]">
					<IssueCoverFlip {issue} variant="compact" showFlipHint />
				</div>
			</div>

			<div class="md:col-span-2 space-y-4 text-sm">
				{#if issue.description}
					<div class="border border-surface-950 dark:border-surface-50 p-4">
						<div class="text-xs uppercase opacity-60 mb-1">Editorial Synopsis</div>
						<p class="text-xs leading-relaxed opacity-85">
							{issue.description}
						</p>
					</div>
				{/if}

				<div class="border border-surface-950 dark:border-surface-50 p-4">
					<div class="text-xs uppercase opacity-60 mb-1">Pricing & Benefits</div>
					{#if isSubscribed}
						<div class="flex items-center gap-2 text-emerald-500 font-bold">
							<span class="icon-[boxicons--check-shield] btn-icon-base"></span>
							<span>20% Member Discount Applied (£{formattedTotal})</span>
						</div>
					{:else}
						<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
							<span>Standard Rate: £{basePrice.toFixed(2)}</span>
							<a
								href={resolve('/subscribe')}
								class="text-xs font-bold text-primary-500 uppercase underline hover:opacity-80"
							>
								Subscribe for 20% off
							</a>
						</div>
					{/if}
				</div>
			</div>
		</div>

		{#if form?.error}
			<div class="mb-6 p-4 border-2 border-red-500 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs">
				<span class="font-bold uppercase">[Error]:</span> {form.error}
			</div>
		{/if}

		<form
			method="POST"
			action="?/checkout"
			use:enhance={() => {
				isSubmitting = true;
				return async ({ update }) => {
					isSubmitting = false;
					await update();
				};
			}}
			class="space-y-6"
		>
			<input type="hidden" name="issueId" value={issue.id} />

			<div class="space-y-4">
				{#if !data.user}
					<div class="space-y-1">
						<label for="email" class="block text-xs uppercase tracking-wider font-bold">
							Email Address for PDF Download & Receipt <span class="text-red-500">*</span>
						</label>
						<input
							type="email"
							id="email"
							name="email"
							required
							placeholder="you@example.com"
							class="w-full border-2 border-surface-950 dark:border-surface-50 bg-transparent px-3 py-2 text-sm focus:outline-none"
						/>
						<p class="text-xs opacity-60">
							Already a member? <a href={resolve('/login')} class="underline font-bold">Sign in</a> to apply discounts and sync your library.
						</p>
					</div>
				{/if}
			</div>

			<!-- Order Summary Breakdown -->
			<div class="border-t-2 border-surface-950 dark:border-surface-50 pt-4 space-y-2 text-sm">
				<div class="flex justify-between">
					<span>1x Magazine Digital & Print Edition</span>
					<span>£{basePrice.toFixed(2)}</span>
				</div>
				{#if isSubscribed}
					<div class="flex justify-between text-emerald-500">
						<span>Member Discount (20%)</span>
						<span>-£{savings}</span>
					</div>
				{/if}
				<div class="flex justify-between font-bold text-lg border-t border-surface-950 dark:border-surface-50 pt-2">
					<span>Total Amount</span>
					<span>£{formattedTotal}</span>
				</div>
			</div>

			<button
				type="submit"
				disabled={isSubmitting}
				class="btn preset-filled w-full py-3.5 text-sm uppercase tracking-widest font-bold flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
			>
				{#if isSubmitting}
					<span class="icon-[boxicons--loader-lines] animate-spin text-base"></span>
					<span>Redirecting to Stripe Checkout...</span>
				{:else}
					<span class="icon-[boxicons--credit-card] text-base"></span>
					<span>Pay with Stripe (£{formattedTotal})</span>
				{/if}
			</button>

			<div class="flex items-center justify-center gap-2 text-[11px] uppercase tracking-wider opacity-60">
				<span class="icon-[boxicons--lock]"></span>
				<span>Secured by Stripe Payments & SSL Encryption</span>
			</div>
		</form>
	</div>
</div>
