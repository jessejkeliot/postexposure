<script lang="ts">
	import type { PageProps } from './$types';
	import ScreeningThumbnail from '$lib/components/ScreeningThumbnail.svelte';
	import { resolve } from '$app/paths';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>Screenings | Post Exposure</title>
</svelte:head>

<div class="space-y-8 py-4">
	<!-- Page Header -->
	<header class="flex flex-col sm:flex-row sm:items-end justify-between border-b pb-4 gap-4">
		<div>
			<h1 class="text-3xl sm:text-5xl font-bold tracking-tight uppercase">Screenings</h1>
		</div>
		<div>
			<a
				href={resolve('/calendar')}
				class="btn text-xs font-semibold uppercase tracking-wider border border-surface-300-700 hover:bg-surface-200-800 px-3 py-1.5 inline-flex items-center gap-1.5"
			>
				<span class="icon-[boxicons--calendar]"></span>
				Calendar View
			</a>
		</div>
	</header>

	<!-- Screenings Grid -->
	<section class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
		{#each data.screenings as screening (screening.id)}
			<ScreeningThumbnail {screening} showDate={true} />
		{:else}
			<div class="col-span-full py-16 text-center border border-dashed border-surface-200-800 p-8">
				<span class="icon-[boxicons--film] text-4xl opacity-40 mb-2 block mx-auto"></span>
				<p class="text-base font-medium">No upcoming screenings found</p>
				<p class="text-xs opacity-60 mt-1">Check back soon for upcoming seasons and schedule announcements.</p>
			</div>
		{/each}
	</section>
</div>
