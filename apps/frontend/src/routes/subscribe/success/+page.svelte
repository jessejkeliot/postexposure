<script lang="ts">
	import type { PageProps } from './$types';
	import { resolve } from '$app/paths';

	let { data }: PageProps = $props();

	const tierName = $derived(
		data.tier === 'patron'
			? 'Curator Patron'
			: data.tier === 'reader'
				? 'Digital Reader'
				: 'Supporter Membership'
	);
</script>

<svelte:head>
	<title>Welcome to Post Exposure | Subscription Confirmed</title>
</svelte:head>

<div class="mx-auto max-w-xl py-12 px-4 text-center space-y-8">
	<div class="border-4 border-emerald-500 bg-surface-50 dark:bg-surface-900 p-8 sm:p-10 space-y-6 shadow-xl">
		<div class="w-16 h-16 rounded-full bg-emerald-500 text-surface-50 flex items-center justify-center mx-auto text-4xl shadow-lg">
			<span class="icon-[boxicons--check] stroke-2"></span>
		</div>

		<div>
			<span class="text-xs  uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-bold">
				Payment Successful
			</span>
			<h1 class="text-3xl sm:text-5xl font-bold uppercase tracking-tight mt-1">
				Welcome to the Society
			</h1>
			<p class="text-sm text-surface-600 dark:text-surface-400 mt-2">
				Your <span class="font-bold">{tierName}</span> ({data.billing}) is now active.
			</p>
		</div>

		<div class="border-t border-b border-surface-300 dark:border-surface-700 py-4 text-xs  text-left space-y-2 bg-surface-100/60 dark:bg-surface-800/60 p-4">
			<div class="flex justify-between">
				<span class="text-surface-500">Tier:</span>
				<span class="font-bold uppercase">{tierName}</span>
			</div>
			<div class="flex justify-between">
				<span class="text-surface-500">Billing Cycle:</span>
				<span class="capitalize">{data.billing}</span>
			</div>
			<div class="flex justify-between">
				<span class="text-surface-500">Status:</span>
				<span class="text-emerald-600 dark:text-emerald-400 font-bold">● Active</span>
			</div>
			{#if data.sessionId}
				<div class="flex justify-between text-[10px] text-surface-500 pt-1 border-t border-surface-200 dark:border-surface-700">
					<span>Transaction:</span>
					<span class="truncate max-w-44">{data.sessionId}</span>
				</div>
			{/if}
		</div>

		<div class="flex flex-col sm:flex-row gap-3 justify-center pt-2">
			<a
				href={resolve('/issues')}
				class="btn preset-filled font-bold uppercase tracking-widest text-xs px-6 py-3"
			>
				Read Magazine Issues
			</a>
			<a
				href={resolve('/account')}
				class="btn preset-outlined text-xs uppercase font-bold tracking-wider px-6 py-3"
			>
				Manage Account
			</a>
		</div>
	</div>
</div>
