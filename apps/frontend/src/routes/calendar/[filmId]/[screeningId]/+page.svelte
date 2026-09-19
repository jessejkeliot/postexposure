<script lang="ts">
	import type { PageProps } from './$types';
	import { getFilmCoverUrl } from '$lib/pocketbase/db';
	import ScreeningThumbnail from '$lib/components/ScreeningThumbnail.svelte';
	import { resolve } from '$app/paths';
	import GrainOverlay from '$lib/components/image-effects/GrainOverlay.svelte';

	let { data }: PageProps = $props();

	const coverUrl = $derived(getFilmCoverUrl(data.film, { thumb: '1200x800' }));

	const formattedFilmDate = $derived(
		data.film.release_date
			? new Intl.DateTimeFormat('en-UK', {
					year: 'numeric'
				}).format(new Date(data.film.release_date))
			: null
	);
	const formattedScreeningDate = $derived(
		data.screening.showing_date
			? new Intl.DateTimeFormat('en-UK', {
					weekday: 'short',
					day: 'numeric',
					month: 'short',
					year: 'numeric'
				}).format(new Date(data.screening.showing_date))
			: null
	);
	const formattedScreeningTime = $derived(
		data.screening.showing_date
			? new Intl.DateTimeFormat('en-UK', {
					hour: 'numeric',

					minute: 'numeric'
				}).format(new Date(data.screening.showing_time))
			: null
	);
	const directorName = $derived(data.film.director);
</script>

<svelte:head>
	<title>{data.film.title} | Post Exposure</title>
</svelte:head>

<div class="flex flex-col mx-auto max-w-4xl space-y-4 sm:py-4">
	<!-- Cover Image -->
	{#if coverUrl}
		<GrainOverlay intensity="medium" class="my-4">
			<img
				src={coverUrl}
				alt={data.film.title}
				class="h-full w-full object-cover transition delay-0 duration-220 lg:brightness-95 lg:group-hover:brightness-106 lg:group-hover:saturate-120"
				loading="lazy"
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
				<p class="text-sm font-medium">By {directorName}</p>
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
	<a
		class="btn cursor-grab preset-outlined font-bold text-wrap uppercase"
		href={resolve(`/calendar/${data.film.id}/${data.screening.id}/buy`)}
	>
		Order Tickets - {formattedScreeningDate}, {formattedScreeningTime}
	</a>
	<!-- Buy tickets to other days section -->
	<button class="btn preset-tonal"
		>See more dates<span class="icon-[boxicons--chevron-down]"></span></button
	>
	<!-- More films Section -->
	{#if data.moreScreenings.length > 0}
		<section class="mt-16 border-t border-surface-200-800 pt-12">
			<h2 class="mb-8 text-2xl font-bold tracking-tight">More films from this season</h2>
			<div class="grid grid-cols-1 gap-8 md:grid-cols-3">
				{#each data.moreScreenings as screening (screening.id)}
					<ScreeningThumbnail {screening} variant="standard" showDate={true} />
					<!-- get screenings of film -->
				{/each}
			</div>
		</section>
	{/if}
</div>
