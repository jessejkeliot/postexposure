<script lang="ts">
	import { resolve } from '$app/paths';
	import type { Film, Screening } from '$lib/types/database';
	import GrainOverlay from '$lib/components/image-effects/GrainOverlay.svelte';
	import { formatScreeningDate, formatScreeningTime } from '$lib/funcs/dates';

	interface Props {
		film: Film;
		screening: Screening;
		coverUrl?: string | null;
		basePrice: number;
		unitPrice: number;
		isSubscribed: boolean;
		remainingTickets: number;
		isSoldOut: boolean;
	}

	let {
		film,
		screening,
		coverUrl,
		basePrice,
		unitPrice,
		isSubscribed,
		remainingTickets,
		isSoldOut
	}: Props = $props();
</script>

<div class="border-b-2 border-surface-950 pb-6 mb-6 dark:border-surface-50">
	<div class="flex items-center justify-between text-xs tracking-widest uppercase opacity-60 mb-2">
		<span>Screening Reservation</span>
		<span>Standard Admission</span>
	</div>
	<h1 class="text-3xl font-bold tracking-tight uppercase md:text-5xl">
		{film.title}
	</h1>
	<p class="mt-1 text-sm opacity-80">
		Directed by {film.director || 'Unknown'}
		{film.release_date ? `(${new Date(film.release_date).getFullYear()})` : ''}
	</p>
</div>

<div class="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
	{#if coverUrl}
		<div class="md:col-span-1">
			<GrainOverlay
				intensity="medium"
				class="aspect-[3/4] w-full overflow-hidden border border-surface-950 dark:border-surface-50"
			>
				<img src={coverUrl} alt={film.title} class="h-full w-full object-cover" />
			</GrainOverlay>
		</div>
	{/if}

	<div class={coverUrl ? 'space-y-4 text-sm md:col-span-2' : 'space-y-4 text-sm md:col-span-3'}>
		<div class="grid grid-cols-2 gap-4 border border-surface-950 p-4 dark:border-surface-50">
			<div>
				<div class="text-xs uppercase opacity-60">Date</div>
				<div class="mt-1 text-base font-bold">
					{screening.showing_date ? formatScreeningDate(screening.showing_date) : 'TBA'}
				</div>
			</div>
			<div>
				<div class="text-xs uppercase opacity-60">Time</div>
				<div class="mt-1 text-base font-bold">
					{screening.showing_time ? formatScreeningTime(screening.showing_time) : 'TBA'}
				</div>
			</div>
		</div>

		<div class="border border-surface-950 p-4 dark:border-surface-50">
			<div class="mb-1 flex items-center justify-between">
				<div class="text-xs uppercase opacity-60">Pricing & Availability</div>
				<span
					class="border px-2 py-0.5 text-xs font-bold tracking-wider uppercase {isSoldOut
						? 'border-red-500 text-red-500'
						: remainingTickets <= 10
							? 'border-amber-500 text-amber-500'
							: 'border-emerald-500 text-emerald-500'}"
				>
					{#if isSoldOut}
						Sold Out
					{:else if remainingTickets <= 10}
						Only {remainingTickets}
						{remainingTickets === 1 ? 'ticket' : 'tickets'} left
					{:else}
						{remainingTickets} tickets left
					{/if}
				</span>
			</div>
			{#if isSubscribed}
				<div class="flex items-center gap-2 font-bold text-emerald-500">
					<span class="btn-icon-base icon-[boxicons--check-shield]"></span>
					<span>20% Member Discount Applied (£{unitPrice.toFixed(2)}/ticket)</span>
				</div>
			{:else}
				<div class="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
					<span>Standard Rate: £{basePrice.toFixed(2)}/ticket</span>
					<a
						href={resolve('/subscribe')}
						class="text-xs font-bold text-primary-500 underline uppercase hover:opacity-80"
					>
						Subscribe for 20% off
					</a>
				</div>
			{/if}
		</div>
	</div>
</div>
