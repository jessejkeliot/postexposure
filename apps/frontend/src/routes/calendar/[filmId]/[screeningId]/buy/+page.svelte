<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import type { ActionData, PageProps } from './$types';
	import { getFilmCoverUrl, getRemainingTickets, isScreeningSoldOut } from '$lib/pocketbase/db';
	import ScreeningSummaryCard from '$lib/components/checkout/ScreeningSummaryCard.svelte';
	import TicketOrderSummary from '$lib/components/checkout/TicketOrderSummary.svelte';
	import SoldOutNotice from '$lib/components/checkout/SoldOutNotice.svelte';

	let { data, form }: PageProps & { form?: ActionData } = $props();

	let quantity = $state(1);
	let isSubmitting = $state(false);

	const remainingTickets = $derived(getRemainingTickets(data.screening));
	const isSoldOut = $derived(isScreeningSoldOut(data.screening) || remainingTickets <= 0);
	const maxSelectable = $derived(Math.max(1, Math.min(6, remainingTickets)));
	const allowedQuantities = $derived(
		Array.from({ length: maxSelectable }, (_, i) => i + 1)
	);

	const basePrice = $derived(data.screening.price ?? 12.0);
	const isSubscribed = $derived(Boolean(data.user?.isSubscribed));
	const unitPrice = $derived(isSubscribed ? basePrice * 0.8 : basePrice);
	const totalPrice = $derived((unitPrice * quantity).toFixed(2));
	const savings = $derived(isSubscribed ? ((basePrice - unitPrice) * quantity).toFixed(2) : '0.00');

	const coverUrl = $derived(getFilmCoverUrl(data.film, { thumb: '800x600' }));
</script>

<svelte:head>
	<title>Reserve Tickets: {data.film.title} | Post Exposure</title>
</svelte:head>

<div class="mx-auto max-w-3xl py-8">
	<!-- Back link -->
	<a
		href={resolve(`/calendar/${data.film.id}/${data.screening.id}`)}
		class="mb-6 inline-flex items-center gap-1 text-xs tracking-widest uppercase hover:opacity-75"
	>
		<span class="btn-icon-sm icon-[boxicons--chevron-left]"></span>
		<span>Back to Screening Details</span>
	</a>

	<div
		class="border-2 border-surface-950 bg-surface-50 p-6 md:p-8 dark:border-surface-50 dark:bg-surface-950"
	>
		<!-- Screening Summary Header and Pricing Card -->
		<ScreeningSummaryCard
			film={data.film}
			screening={data.screening}
			{coverUrl}
			{basePrice}
			{unitPrice}
			{isSubscribed}
			{remainingTickets}
			{isSoldOut}
		/>

		{#if form?.error}
			<div
				class="mb-6 border-2 border-red-500 bg-red-50 p-4 text-xs text-red-700 dark:bg-red-950/40 dark:text-red-300"
			>
				<span class="font-bold uppercase">[Error]:</span>
				{form.error}
			</div>
		{/if}

		{#if isSoldOut}
			<SoldOutNotice />
		{:else}
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
				<div class="space-y-4">
					<div class="space-y-1">
						<label for="quantity" class="block text-xs font-bold tracking-wider uppercase">
							Number of Tickets
						</label>
						<div class="flex items-center gap-4">
							<select
								id="quantity"
								name="quantity"
								bind:value={quantity}
								class="w-32 border-2 border-surface-950 bg-transparent px-3 py-2 text-sm font-bold outline-none focus:outline-none dark:border-surface-50"
							>
								{#each allowedQuantities as count (count)}
									<option value={count} class="dark:bg-surface-900"
										>{count} {count === 1 ? 'ticket' : 'tickets'}</option
									>
								{/each}
							</select>
							<span class="text-xs opacity-70">
								(Max {maxSelectable} {maxSelectable === 1 ? 'ticket' : 'tickets'} per reservation)
							</span>
						</div>
					</div>

					{#if !data.user}
						<div class="space-y-1 pt-2">
							<label for="email" class="block text-xs font-bold tracking-wider uppercase">
								Reservation Email <span class="text-red-500">*</span>
							</label>
							<input
								type="email"
								id="email"
								name="email"
								required
								placeholder="you@example.com"
								class="w-full border-2 border-surface-950 bg-transparent px-3 py-2 text-sm outline-none focus:outline-none dark:border-surface-50"
							/>
							<p class="text-xs opacity-60">
								Already have an account? <a
									href={resolve('/login')}
									class="font-bold underline">Sign in here</a
								> to sync with your member profile.
							</p>
						</div>
					{/if}
				</div>

				<!-- Order Summary Breakdown -->
				<TicketOrderSummary
					{quantity}
					{basePrice}
					{totalPrice}
					{savings}
					{isSubscribed}
				/>

				<button
					type="submit"
					disabled={isSubmitting || isSoldOut}
					class="flex w-full items-center justify-center gap-2 border-2 border-surface-950 bg-surface-950 py-3.5 text-sm font-bold tracking-widest text-surface-50 uppercase transition-opacity hover:opacity-90 disabled:opacity-50 dark:border-surface-50 dark:bg-surface-50 dark:text-surface-950 cursor-pointer"
				>
					{#if isSubmitting}
						<span class="icon-[boxicons--loader-lines] animate-spin text-base"></span>
						<span>Redirecting to Stripe Checkout...</span>
					{:else}
						<span class="icon-[boxicons--credit-card] text-base"></span>
						<span>Pay with Stripe (£{totalPrice})</span>
					{/if}
				</button>

				<div
					class="flex items-center justify-center gap-2 text-[11px] tracking-wider uppercase opacity-60"
				>
					<span class="icon-[boxicons--lock]"></span>
					<span>Secured by Stripe Payments & SSL Encryption</span>
				</div>
			</form>
		{/if}
	</div>
</div>
