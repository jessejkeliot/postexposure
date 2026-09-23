<script lang="ts">
	import { resolve } from '$app/paths';
	import type { PageProps } from './$types';
	import IssueCoverFlip from '$lib/components/IssueCoverFlip.svelte';

	let { data }: PageProps = $props();

	const issue = $derived(data.issue);
	const pdfUrl = $derived(data.pdfUrl);

	function formatDate(iso?: string) {
		if (!iso) return 'N/A';
		try {
			return new Intl.DateTimeFormat('en-UK', {
				year: 'numeric',
				month: 'long',
				day: 'numeric'
			}).format(new Date(iso));
		} catch {
			return iso;
		}
	}
</script>

<svelte:head>
	<title>Purchase Confirmed: {issue.title} | Post Exposure</title>
</svelte:head>

<div class="mx-auto max-w-2xl py-8 space-y-8">
	<!-- Success Confirmation Banner -->
	<div class="border-2 border-emerald-500 bg-emerald-500/10 p-6 md:p-8 space-y-4">
		<div class="flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
			<span class="icon-[boxicons--check-circle] text-3xl"></span>
			<div>
				<span class="text-xs uppercase tracking-widest font-bold block">Payment Confirmed</span>
				<h1 class="text-2xl md:text-3xl font-bold uppercase tracking-tight">
					Thank You for Your Order
				</h1>
			</div>
		</div>
		<p class="text-xs md:text-sm text-surface-700 dark:text-surface-300 leading-relaxed">
			Your purchase of <strong>{issue.title}</strong> has been completed. Your digital copy is unlocked and ready for immediate download below.
		</p>
	</div>

	<!-- Download & Issue Details Card -->
	<div class="border-2 border-surface-950 dark:border-surface-50 p-6 md:p-8 bg-surface-50 dark:bg-surface-950 space-y-6">
		<div class="flex flex-col sm:flex-row gap-6 items-center">
			<div class="w-36 shrink-0">
				<IssueCoverFlip {issue} variant="compact" />
			</div>
			<div class="space-y-2 text-center sm:text-left flex-1">
				<div class="text-[11px] uppercase tracking-widest opacity-60">Digital Magazine Edition</div>
				<h2 class="text-2xl font-bold uppercase tracking-tight">{issue.title}</h2>
				{#if issue.publish_date}
					<p class="text-xs opacity-75">Published {formatDate(issue.publish_date)}</p>
				{/if}
				{#if issue.description}
					<p class="text-xs opacity-80 line-clamp-2 mt-1">{issue.description}</p>
				{/if}
			</div>
		</div>

		<!-- Direct PDF Download Link / Button -->
		<div class="border-t-2 border-surface-950 dark:border-surface-50 pt-6 space-y-3">
			{#if pdfUrl}
				<a
					href={pdfUrl}
					target="_blank"
					rel="noopener noreferrer"
					download
					class="w-full flex items-center justify-center gap-2 border-2 border-emerald-500 bg-emerald-600 hover:bg-emerald-700 text-white py-4 px-6 text-sm uppercase tracking-widest font-bold shadow-lg transition-all"
				>
					<span class="icon-[boxicons--file] text-xl"></span>
					<span>Download Digital PDF Edition</span>
				</a>
				<div class="text-center text-[11px] uppercase tracking-wider opacity-60">
					PDF Format • High Resolution Print-Ready • DRM Free
				</div>
			{:else}
				<div class="p-4 border border-surface-300 dark:border-surface-700 text-center space-y-1">
					<span class="icon-[boxicons--file] text-2xl opacity-60 block mx-auto"></span>
					<div class="text-xs font-bold uppercase">Digital PDF in Preparation</div>
					<p class="text-[11px] opacity-70">
						The high-resolution digital file is being compiled. A direct download link will be emailed to your account.
					</p>
				</div>
			{/if}
		</div>

		<!-- Receipt & Purchase Metadata -->
		<div class="border-t border-surface-200 dark:border-surface-800 pt-4 space-y-2 text-xs">
			<div class="text-[10px] uppercase tracking-widest opacity-60 font-bold mb-2">Order Summary</div>
			<div class="flex justify-between">
				<span class="opacity-70">Item</span>
				<span class="font-medium">{issue.title}</span>
			</div>
			{#if data.purchase}
				<div class="flex justify-between">
					<span class="opacity-70">Amount Paid</span>
					<span class="font-bold">£{data.purchase.amount.toFixed(2)} GBP</span>
				</div>
				<div class="flex justify-between">
					<span class="opacity-70">Date</span>
					<span>{formatDate(data.purchase.created)}</span>
				</div>
				<div class="flex justify-between">
					<span class="opacity-70">Transaction ID</span>
					<span class="font-mono text-[10px]">{data.purchase.stripe_payment_id || data.purchase.id}</span>
				</div>
			{/if}
		</div>
	</div>

	<!-- Navigation Actions -->
	<div class="flex flex-col sm:flex-row gap-3">
		<a
			href={resolve('/account')}
			class="btn preset-outlined flex-1 text-xs font-bold uppercase tracking-wider text-center py-3"
		>
			<span class="icon-[boxicons--receipt]"></span>
			<span>View Purchase in Account</span>
		</a>
		<a
			href={resolve('/issues')}
			class="btn preset-tonal flex-1 text-xs font-bold uppercase tracking-wider text-center py-3"
		>
			<span class="icon-[boxicons--book-open]"></span>
			<span>Browse All Issues</span>
		</a>
	</div>
</div>
