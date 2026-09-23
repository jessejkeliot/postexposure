<script lang="ts">
	import { resolve } from '$app/paths';
	import type { PageProps } from './$types';
	import IssueCoverFlip from '$lib/components/IssueCoverFlip.svelte';
	import IssueThumbnail from '$lib/components/IssueThumbnail.svelte';
	import { getIssuePdfUrl } from '$lib/pocketbase/db';

	let { data }: PageProps = $props();

	const latestIssue = $derived(data.latestIssue);
	const latestPdfUrl = $derived(latestIssue ? getIssuePdfUrl(latestIssue) : null);
	const formattedLatestDate = $derived(
		latestIssue?.publish_date
			? new Intl.DateTimeFormat('en-UK', {
					month: 'long',
					year: 'numeric'
				}).format(new Date(latestIssue.publish_date))
			: null
	);
</script>

<svelte:head>
	<title>Magazine Issues | Post Exposure</title>
	<meta
		name="description"
		content="Explore Post Exposure print and digital magazine issues. Available for purchase with physical shipping and immediate PDF downloads."
	/>
</svelte:head>

<div class="space-y-12 py-4">
	<!-- Page Header -->
	<header class="flex flex-col sm:flex-row justify-between sm:items-end border-b border-surface-200-800 pb-4 gap-4">
		<div>
			<h1 class="text-3xl sm:text-5xl font-bold tracking-tight uppercase">Issues</h1>
		</div>
		<!-- <div class="flex items-center gap-2 text-xs  opacity-80">
			<span class="inline-block h-2 w-2 rounded-full bg-primary-500 animate-pulse"></span>
			<span>{data.allIssues.length} {data.allIssues.length === 1 ? 'Edition' : 'Editions'} Available</span>
		</div> -->
	</header>

	{#if latestIssue}
		<!-- Latest Issue Feature Section -->
		<section
			aria-labelledby="latest-issue-heading"
			class="rounded-none border-2 border-surface-200-800 bg-surface-100-900/40 p-6 sm:p-8 lg:p-10"
		>
			<div class="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12 items-center">
				<!-- Left: 3D Flip Magazine Cover -->
				<div class="lg:col-span-5 flex justify-center">
					<div class="w-full max-w-sm">
						<IssueCoverFlip issue={latestIssue} variant="hero" />
					</div>
				</div>

				<!-- Right: Latest Issue Details & Purchase -->
				<div class="lg:col-span-7 space-y-6 flex flex-col justify-between">
					<div class="space-y-4">
						<!-- Badges -->
						<div class="flex flex-wrap items-center gap-2 text-xs font-bold tracking-wider uppercase">
							{#if formattedLatestDate}
								<span class=" text-xs opacity-75">{formattedLatestDate}</span>
							{/if}
						</div>

						<!-- Title -->
						<h2
							id="latest-issue-heading"
							class="text-2xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight leading-none"
						>
							{latestIssue.title}
						</h2>

						<!-- Editorial Synopsis / Description -->
						{#if latestIssue.description}
							<p class="text-sm sm:text-base leading-relaxed opacity-85 max-w-2xl">
								{latestIssue.description}
							</p>
						{/if}
					</div>

					<!-- Pricing and Purchase Call to Action -->
					<div class="space-y-4 pt-2">
						<div class="flex items-baseline gap-3">
							<span class="text-3xl sm:text-4xl font-extrabold  tracking-tight">
								£{latestIssue.price.toFixed(2)}
							</span>
						</div>

						<div class="flex flex-col sm:flex-row gap-3">
							<!-- Purchase Button -->
							<a
								href={resolve(`/issues/buy?issueId=${latestIssue.id}`)}
								class="btn btn-lg font-bold uppercase tracking-wider flex-1 transition-all duration-200 preset-filled-brand sm:preset-outlined text-wrap hover:brightness-105 flex items-center justify-center gap-2"
							>
								<span class="icon-[boxicons--cart] text-xl"></span>
								<span>Purchase PDF Edition</span>
							</a>
						</div>
					</div>
				</div>
			</div>
		</section>
	{:else}
		<!-- Fallback when no issues exist -->
		<div class="py-20 text-center border border-dashed border-surface-200-800 p-8 space-y-3">
			<span class="icon-[boxicons--book-open] text-5xl opacity-40 mx-auto block"></span>
			<h2 class="text-xl font-bold uppercase">No Issues Found</h2>
			<p class="text-sm opacity-70 max-w-md mx-auto">
				Magazine editions are currently being prepared. Check back shortly.
			</p>
		</div>
	{/if}

	<!-- Past Issues Section -->
	{#if data.pastIssues.length > 0}
		<section class="space-y-8 pt-4">
			<div class="flex flex-col sm:flex-row sm:items-baseline justify-between border-b border-surface-200-800 pb-3 gap-2">
				<h2 class="text-2xl sm:text-3xl font-bold uppercase tracking-tight">
					Previous Editions & Back Issues
				</h2>
			</div>

			<div class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
				{#each data.pastIssues as pastIssue (pastIssue.id)}
					<IssueThumbnail issue={pastIssue} />
				{/each}
			</div>
		</section>
	{/if}
</div>
