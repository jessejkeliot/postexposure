<script lang="ts">
	import type { PageProps } from './$types';
	import TicketCard from '$lib/components/TicketCard.svelte';
	import { resolve } from '$app/paths';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>Payment Successful - Tickets Confirmed | Post Exposure</title>
</svelte:head>

<div class="mx-auto max-w-4xl py-8 space-y-8">
	<!-- Success Confirmation Header -->
	<div class="border-2 border-surface-950 dark:border-surface-50 p-6 sm:p-8 bg-surface-50 dark:bg-surface-950">
		<div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b-2 border-surface-950 dark:border-surface-50 pb-6 mb-6">
			<div class="space-y-1">
				<div class="inline-flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-widest">
					<span class="icon-[boxicons--check-circle] text-lg"></span>
					<span>Payment Confirmed via Stripe</span>
				</div>
				<h1 class="text-3xl sm:text-4xl font-bold uppercase tracking-tight">
					Your Tickets Are Ready
				</h1>
				<p class="text-xs sm:text-sm opacity-70">
					Reference Session: <code class="font-mono">{data.sessionId}</code>
				</p>
			</div>

			<div class="flex flex-wrap gap-2">
				<a
					href={resolve('/tickets')}
					class="btn bg-surface-950 text-surface-50 dark:bg-surface-50 dark:text-surface-950 text-xs uppercase font-bold tracking-widest px-4 py-2 hover:opacity-90"
				>
					<span class="icon-[boxicons--qr]"></span>
					<span>View in My Tickets</span>
				</a>
				<a
					href={resolve('/calendar')}
					class="btn preset-outlined text-xs uppercase font-bold tracking-widest px-4 py-2 hover:opacity-80"
				>
					Browse Calendar
				</a>
			</div>
		</div>

		{#if data.purchase}
			<div class="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 border border-surface-950 dark:border-surface-50 bg-surface-100/50 dark:bg-surface-900/50 text-xs uppercase tracking-wider mb-6">
				<div>
					<span class="opacity-60 block">Order</span>
					<span class="font-bold font-mono">{data.purchase.item_name}</span>
				</div>
				<div>
					<span class="opacity-60 block">Amount Paid</span>
					<span class="font-bold">£{data.purchase.amount.toFixed(2)}</span>
				</div>
				<div>
					<span class="opacity-60 block">Tickets Issued</span>
					<span class="font-bold">{data.tickets.length} pass(es)</span>
				</div>
				<div>
					<span class="opacity-60 block">Payment Method</span>
					<span class="font-bold text-primary-500">Stripe Checkout</span>
				</div>
			</div>
		{/if}

		<div class="space-y-2 text-xs opacity-75">
			<p>
				Show the QR code below on your mobile device at the cinema entrance. Each QR code is uniquely tied to your reservation and will be scanned by cinema staff for admission.
			</p>
		</div>
	</div>

	<!-- Rendered Ticket Cards -->
	<div class="space-y-6">
		<div class="flex items-center justify-between border-b border-surface-950 dark:border-surface-50 pb-2">
			<h2 class="text-sm font-bold uppercase tracking-widest opacity-80">
				Admission Passes ({data.tickets.length})
			</h2>
			<span class="text-xs uppercase tracking-wider opacity-60">Digital Ticket Stub</span>
		</div>

		{#if data.tickets.length === 0}
			<div class="p-8 text-center border border-dashed border-surface-300 dark:border-surface-700">
				<p class="text-sm opacity-70">No tickets found for this session.</p>
			</div>
		{:else}
			<div class="grid grid-cols-1 gap-6">
				{#each data.tickets as ticket (ticket.id)}
					<TicketCard {ticket} />
				{/each}
			</div>
		{/if}
	</div>

	<!-- Bottom Navigation Actions -->
	<div class="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-surface-950 dark:border-surface-50">
		<a
			href={resolve('/tickets')}
			class="text-xs uppercase tracking-wider underline hover:opacity-75 font-bold"
		>
			← Go to All Tickets & Passes
		</a>
		<button
			type="button"
			onclick={() => window.print()}
			class="btn preset-outlined text-xs uppercase font-bold tracking-wider"
		>
			<span class="icon-[boxicons--printer]"></span>
			<span>Print Passes</span>
		</button>
	</div>
</div>
