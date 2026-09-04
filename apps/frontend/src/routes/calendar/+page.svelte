<script lang="ts">
	import type { PageProps } from './$types';
	import LargeCalendar from '$lib/components/LargeCalendar.svelte';
	import { resolve } from '$app/paths';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>Calendar | Post Exposure</title>
</svelte:head>

<div class="space-y-6 py-4">
	<!-- Header -->
	<header class="flex flex-col sm:flex-row sm:items-end justify-between border-b pb-4 gap-4">
		<div>
			<h1 class="text-3xl sm:text-5xl font-bold tracking-tight uppercase">Calendar</h1>
			<p class="text-sm opacity-70 mt-1">Browse scheduled cinema screenings by month and day.</p>
		</div>
		<div>
			<a
				href={resolve('/screenings')}
				class="btn text-xs font-semibold uppercase tracking-wider border border-surface-300-700 hover:bg-surface-200-800 px-3 py-1.5 rounded inline-flex items-center gap-1.5"
			>
				<span class="icon-[boxicons--list-ul]"></span>
				List View
			</a>
		</div>
	</header>

	<LargeCalendar screenings={data.screenings} />
</div>
