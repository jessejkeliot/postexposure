<script lang="ts">
	import BuyTicketLink from './BuyTicketLink.svelte';

	import type { PageProps } from './$types';
	import { getFilmCoverUrl } from '$lib/pocketbase/db';
	import ScreeningThumbnail from '$lib/components/ScreeningThumbnail.svelte';
	import { resolve } from '$app/paths';
	import GrainOverlay from '$lib/components/image-effects/GrainOverlay.svelte';
	import { slide } from '$lib/assets/transitions/transitions';
	import { fly } from 'svelte/transition';

	let { data }: PageProps = $props();

	let showMoreDates = $state(false);

	const coverUrl = $derived(getFilmCoverUrl(data.film, { thumb: '1200x800' }));

	const formattedFilmDate = $derived(
		data.film.release_date
			? new Intl.DateTimeFormat('en-UK', {
					year: 'numeric'
				}).format(new Date(data.film.release_date))
			: null
	);
	const directorName = $derived(data.film.director);
	const seasonName = $derived(data.screening.expand?.season?.title);
</script>

<svelte:head>
	<title>{data.film.title} | Post Exposure</title>
</svelte:head>

<div class="mx-auto flex max-w-4xl flex-col space-y-4 sm:py-4">
	<!-- Cover Image -->
	{#if coverUrl}
		<GrainOverlay intensity="medium" class="my-4">
			<img
				src={coverUrl}
				alt={data.film.title}
				class="h-full w-full object-cover transition delay-0 duration-220 lg:brightness-100 lg:group-hover:brightness-106 lg:group-hover:saturate-120"
				fetchpriority="high"
				data-sveltekit-preload-code="viewport"
			/>
		</GrainOverlay>
	{/if}
	<!-- film Header -->
	<header class="mb-4">
		<h1 class="text-xl font-bold tracking-tight sm:text-2xl md:text-3xl">
			{data.film.title}
		</h1>

		{#if directorName}
			<div class="flex items-center">
				<p class="text-sm font-medium">Directed by {directorName}</p>
			</div>
		{/if}
		{#if seasonName}
			<div class="flex items-center">
				<p class="text-sm font-medium">{seasonName}</p>
			</div>
		{/if}
		{#if formattedFilmDate}
			<div class="flex items-center">
				<p class="text-sm font-medium">{formattedFilmDate}</p>
			</div>
		{/if}
	</header>

	<!-- Film Body -->
	<div
		class="prose prose-lg max-w-none leading-relaxed prose-neutral first-letter:text-2xl first-letter:font-bold dark:prose-invert"
	>
		{#if data.film.description}
			{data.film.description}
		{/if}
	</div>
	<!-- Buy tickets to screening section -->
	<BuyTicketLink screening={data.screening} film={data.film}></BuyTicketLink>
	<!-- Buy tickets to other days section -->
	{#if showMoreDates}
		<div class="flex flex-col space-y-2">
			<button
				type="button"
				class="btn flex w-1/4 min-w-fit items-center justify-between preset-tonal"
				onclick={() => (showMoreDates = !showMoreDates)}
			>
				<span>More Dates</span>
				<span
					class={`icon-[boxicons--chevron-right] ${showMoreDates ? 'rotate-90' : 'rotate-0'} duration-300`}
				></span>
			</button>

			{#if data.upcomingFilmScreenings && data.upcomingFilmScreenings.length > 0}
				<div class="flex flex-col space-y-2 pt-1">
					{#each data.upcomingFilmScreenings as otherScreening (otherScreening.id)}
						<BuyTicketLink screening={otherScreening} film={otherScreening.expand?.film}
						></BuyTicketLink>
					{/each}
				</div>
			{:else}
				<p class="py-2 text-sm italic opacity-70">
					No other upcoming dates scheduled for this film.
				</p>
			{/if}
		</div>
	{/if}
	<!-- More films Section -->
	{#if data.moreScreenings.length > 0}
		<section class="mt-16 border-t border-surface-200-800 pt-12">
			<h2 class="mb-8 text-2xl font-bold tracking-tight">More films from this season</h2>
			<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
				{#each data.moreScreenings as screening (screening.id)}
					<ScreeningThumbnail {screening} variant="standard" showDate={true} />
					<!-- get screenings of film -->
				{/each}
			</div>
		</section>
	{/if}
</div>
