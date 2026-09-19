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
	<header class="flex flex-col xs:flex-row justify-between items-center border-b pb-4 gap-4">
		<div class="h-fit">
			<h1 class="text-3xl sm:text-5xl font-bold tracking-tight uppercase">Calendar</h1>
		</div>
		<div class="h-full flex flex-col justify-center">
			<a
				href={resolve('/screenings')}
				class="btn preset-outlined btn-icon-xs sm:btn-icon-md"
			>
				<span class="icon-[boxicons--list-ul]"></span>
				List View
			</a>
		</div>
	</header>

	<LargeCalendar screenings={data.screenings} />
</div>
