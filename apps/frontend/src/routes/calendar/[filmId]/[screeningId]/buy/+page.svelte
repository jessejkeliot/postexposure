<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import type { ActionData, PageProps } from './$types';
	import { formatScreeningDate, formatScreeningTime } from '$lib/funcs/dates';
	import { getFilmCoverUrl, getRemainingTickets, isScreeningSoldOut } from '$lib/pocketbase/db';
	import GrainOverlay from '$lib/components/image-effects/GrainOverlay.svelte';

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
		class="inline-flex items-center gap-1  text-xs uppercase tracking-widest hover:opacity-75 mb-6"
	>
		<span class="icon-[boxicons--chevron-left] btn-icon-sm"></span>
		<span>Back to Screening Details</span>
	</a>

	<div class="border-2 border-surface-950 dark:border-surface-50 p-6 md:p-8 bg-surface-50 dark:bg-surface-950">
		<div class="border-b-2 border-surface-950 dark:border-surface-50 pb-6 mb-6">
			<div class="flex items-center justify-between text-xs  uppercase tracking-widest opacity-60 mb-2">
				<span>Screening Reservation</span>
				<span>Standard Admission</span>
			</div>
			<h1 class="text-3xl md:text-5xl font-bold  tracking-tight uppercase">
				{data.film.title}
			</h1>
			<p class="text-sm  mt-1 opacity-80">
				Directed by {data.film.director || 'Unknown'} {data.film.release_date ? `(${new Date(data.film.release_date).getFullYear()})` : ''}
			</p>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
			{#if coverUrl}
				<div class="md:col-span-1">
					<GrainOverlay intensity="medium" class="aspect-[3/4] w-full overflow-hidden border border-surface-950 dark:border-surface-50">
						<img src={coverUrl} alt={data.film.title} class="h-full w-full object-cover" />
					</GrainOverlay>
				</div>
			{/if}

			<div class={coverUrl ? 'md:col-span-2 space-y-4  text-sm' : 'md:col-span-3 space-y-4  text-sm'}>
				<div class="grid grid-cols-2 gap-4 border border-surface-950 dark:border-surface-50 p-4">
					<div>
						<div class="text-xs uppercase opacity-60">Date</div>
						<div class="font-bold text-base mt-1">
							{data.screening.showing_date ? formatScreeningDate(data.screening.showing_date) : 'TBA'}
						</div>
					</div>
					<div>
						<div class="text-xs uppercase opacity-60">Time</div>
						<div class="font-bold text-base mt-1">
							{data.screening.showing_time ? formatScreeningTime(data.screening.showing_time) : 'TBA'}
						</div>
					</div>
				</div>

				<div class="border border-surface-950 dark:border-surface-50 p-4">
					<div class="flex items-center justify-between mb-1">
						<div class="text-xs uppercase opacity-60">Pricing & Availability</div>
						<span
							class="text-xs font-bold uppercase tracking-wider px-2 py-0.5 border {isSoldOut
								? 'border-red-500 text-red-500'
								: remainingTickets <= 10
									? 'border-amber-500 text-amber-500'
									: 'border-emerald-500 text-emerald-500'}"
						>
							{#if isSoldOut}
								Sold Out
							{:else if remainingTickets <= 10}
								Only {remainingTickets} {remainingTickets === 1 ? 'ticket' : 'tickets'} left
							{:else}
								{remainingTickets} tickets left
							{/if}
						</span>
					</div>
					{#if isSubscribed}
						<div class="flex items-center gap-2 text-emerald-500 font-bold">
							<span class="icon-[boxicons--check-shield] btn-icon-base"></span>
							<span>20% Member Discount Applied (£{unitPrice.toFixed(2)}/ticket)</span>
						</div>
					{:else}
						<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
							<span>Standard Rate: £{basePrice.toFixed(2)}/ticket</span>
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
			<div class="mb-6 p-4 border-2 border-red-500 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300  text-xs">
				<span class="font-bold uppercase">[Error]:</span> {form.error}
			</div>
		{/if}

		{#if isSoldOut}
			<div class="p-6 border-2 border-red-500 bg-red-50 dark:bg-red-950/40 text-center space-y-3">
				<div class="text-xl font-bold uppercase text-red-600 dark:text-red-400">
					Screening is Sold Out
				</div>
				<p class="text-xs opacity-80">
					All seats for this session have been reserved. Please check other dates or screenings in the calendar.
				</p>
				<a
					href={resolve('/calendar')}
					class="inline-block border-2 border-surface-950 dark:border-surface-50 px-4 py-2 text-xs uppercase font-bold hover:bg-surface-950 hover:text-surface-50 dark:hover:bg-surface-50 dark:hover:text-surface-950 transition-colors"
				>
					Browse Calendar
				</a>
			</div>
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
						<label for="quantity" class="block  text-xs uppercase tracking-wider font-bold">
							Number of Tickets
						</label>
						<div class="flex items-center gap-4">
							<select
								id="quantity"
								name="quantity"
								bind:value={quantity}
								class="w-32 border-2 border-surface-950 dark:border-surface-50 bg-transparent px-3 py-2  text-sm font-bold focus:outline-none"
							>
								{#each allowedQuantities as count (count)}
									<option value={count} class="dark:bg-surface-900">{count} {count === 1 ? 'ticket' : 'tickets'}</option>
								{/each}
							</select>
							<span class=" text-xs opacity-70">
								(Max {maxSelectable} {maxSelectable === 1 ? 'ticket' : 'tickets'} per reservation)
							</span>
						</div>
					</div>

					{#if !data.user}
						<div class="space-y-1 pt-2">
							<label for="email" class="block  text-xs uppercase tracking-wider font-bold">
								Reservation Email <span class="text-red-500">*</span>
							</label>
							<input
								type="email"
								id="email"
								name="email"
								required
								placeholder="you@example.com"
								class="w-full border-2 border-surface-950 dark:border-surface-50 bg-transparent px-3 py-2  text-sm focus:outline-none"
							/>
							<p class=" text-xs opacity-60">
								Already have an account? <a href={resolve('/login')} class="underline font-bold">Sign in here</a> to sync with your member profile.
							</p>
						</div>
					{/if}
				</div>

				<!-- Order Summary Breakdown -->
				<div class="border-t-2 border-surface-950 dark:border-surface-50 pt-4 space-y-2  text-sm">
					<div class="flex justify-between">
						<span>{quantity}x Admission Ticket(s)</span>
						<span>£{(basePrice * quantity).toFixed(2)}</span>
					</div>
					{#if isSubscribed}
						<div class="flex justify-between text-emerald-500">
							<span>Member Discount (20%)</span>
							<span>-£{savings}</span>
						</div>
					{/if}
					<div class="flex justify-between font-bold text-lg border-t border-surface-950 dark:border-surface-50 pt-2">
						<span>Total Amount</span>
						<span>£{totalPrice}</span>
					</div>
				</div>

				<button
					type="submit"
					disabled={isSubmitting || isSoldOut}
					class="w-full flex items-center justify-center gap-2 border-2 border-surface-950 dark:border-surface-50 bg-surface-950 dark:bg-surface-50 text-surface-50 dark:text-surface-950 py-3.5  text-sm uppercase tracking-widest font-bold hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
				>
					{#if isSubmitting}
						<span class="icon-[boxicons--loader-lines] animate-spin text-base"></span>
						<span>Redirecting to Stripe Checkout...</span>
					{:else}
						<span class="icon-[boxicons--credit-card] text-base"></span>
						<span>Pay with Stripe (£{totalPrice})</span>
					{/if}
				</button>

				<div class="flex items-center justify-center gap-2 text-[11px] uppercase tracking-wider opacity-60">
					<span class="icon-[boxicons--lock]"></span>
					<span>Secured by Stripe Payments & SSL Encryption</span>
				</div>
			</form>
		{/if}
	</div>
</div>
