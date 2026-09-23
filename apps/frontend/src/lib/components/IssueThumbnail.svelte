<script lang="ts">
	import type { Issue } from '$lib/types/database';
	import { getIssuePdfUrl } from '$lib/pocketbase/db';
	import IssueCoverFlip from './IssueCoverFlip.svelte';

	interface Props {
		issue: Issue;
		variant?: 'standard' | 'compact';
	}

	let { issue, variant = 'standard' }: Props = $props();

	const formattedDate = $derived(
		issue.publish_date
			? new Intl.DateTimeFormat('en-UK', {
					month: 'short',
					year: 'numeric'
				}).format(new Date(issue.publish_date))
			: null
	);

	const pdfUrl = $derived(getIssuePdfUrl(issue));
	const formattedPrice = $derived(`£${issue.price.toFixed(2)}`);

	let purchased = $state(false);

	function handleBuy() {
		purchased = true;
		setTimeout(() => {
			purchased = false;
		}, 3000);
	}
</script>

<article
	class="group flex flex-col justify-between border-b border-surface-200-800 pb-8 xl:border-b-0"
>
	<div class="space-y-4">
		<!-- 3D Flipping Magazine Cover -->
		<div class="w-full">
			<IssueCoverFlip {issue} variant="standard" />
		</div>

		<!-- Meta info: Date & Format -->
		<div
			class="flex flex-wrap items-center justify-between text-xs tracking-wider uppercase opacity-80"
		>
			<span class="font-medium text-primary-600 dark:text-primary-400">[Print Edition]</span>
			{#if formattedDate}
				<time datetime={issue.publish_date} class="font-mono text-[11px]">
					{formattedDate}
				</time>
			{/if}
		</div>

		<!-- Title -->
		<h2 class="text-lg leading-snug font-bold tracking-tight group-hover:underline sm:text-xl">
			{issue.title}
		</h2>

		<!-- Description -->
		{#if issue.description && variant !== 'compact'}
			<p class="line-clamp-3 text-xs leading-relaxed opacity-75 sm:text-sm">
				{issue.description}
			</p>
		{/if}
	</div>

	<!-- Price and Action Buttons -->
	<div class="mt-6 pt-4 border-t border-surface-200-800 space-y-3">
		<div class="flex items-baseline justify-between">
			<span class="text-xs uppercase tracking-wider opacity-60">Price</span>
			<span class="font-mono text-xl font-bold tracking-tight">{formattedPrice}</span>
		</div>

		<div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
			<!-- Buy Button -->
			<button
				type="button"
				onclick={handleBuy}
				class="btn w-full font-bold uppercase transition-all duration-200 {purchased
					? 'preset-filled-success-500'
					: 'preset-filled-primary-500 hover:brightness-110'}"
			>
				{#if purchased}
					<span class="icon-[boxicons--check] text-base"></span>
					Added!
				{:else}
					<span class="icon-[boxicons--cart] text-base"></span>
					Buy Issue
				{/if}
			</button>

			<!-- Digital PDF Link if available -->
			{#if pdfUrl}
				<a
					href={pdfUrl}
					target="_blank"
					rel="noopener noreferrer"
					class="btn preset-outlined w-full font-bold uppercase hover:preset-filled transition-all duration-200 flex items-center justify-center gap-1 text-xs"
					title="Read or Download Digital PDF"
				>
					<span class="icon-[boxicons--file-pdf] text-base"></span>
					PDF
				</a>
			{:else}
				<button
					type="button"
					disabled
					class="btn preset-outlined w-full font-bold uppercase opacity-40 text-xs cursor-not-allowed"
				>
					Print Only
				</button>
			{/if}
		</div>
	</div>
</article>
