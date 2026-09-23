<script lang="ts">
	import type { PageProps } from './$types';
	import TicketCard from '$lib/components/TicketCard.svelte';
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';

	let { data }: PageProps = $props();

	let filter = $state<'all' | 'active' | 'used'>('all');
	let manualTicketId = $state('');

	const filteredTickets = $derived(
		data.tickets.filter((ticket) => {
			if (filter === 'active') return !ticket.scanned_at && ticket.status !== 'used';
			if (filter === 'used') return ticket.scanned_at || ticket.status === 'used';
			return true;
		})
	);

	function handleAdminVerifySubmit(e: SubmitEvent) {
		e.preventDefault();
		if (!manualTicketId.trim()) return;
		let cleanId = manualTicketId.trim();
		if (cleanId.includes('/tickets/verify/')) {
			cleanId = cleanId.split('/tickets/verify/')[1]?.split('?')[0] || cleanId;
		}
		goto(`/tickets/verify/${cleanId}`);
	}
</script>

<svelte:head>
	<title>My Screening Tickets | Post Exposure</title>
</svelte:head>

<div class="mx-auto max-w-5xl py-6 space-y-8">
	<!-- Page Header -->
	<header class="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b pb-4 gap-4">
		<div>
			<h1 class="text-3xl sm:text-5xl font-bold tracking-tight uppercase">My Tickets</h1>
			{#if data.user}
				<p class="text-xs sm:text-sm text-surface-600 dark:text-surface-400 mt-1">
					Tickets issued to <span class="font-bold">{data.user.name}</span> ({data.user.email})
				</p>
			{/if}
		</div>

		<div class="flex items-center gap-2">
			<a
				href={resolve('/screenings')}
				class="btn preset-outlined text-xs uppercase font-bold tracking-wider"
			>
				<span class="icon-[boxicons--film]"></span>
				Browse Screenings
			</a>
			{#if data.user?.role === 'admin'}
				<span class="px-2 py-1 text-[11px]  uppercase bg-primary-500/10 text-primary-600 dark:text-primary-400 border border-primary-500/30">
					Admin Scanner Mode Active
				</span>
			{/if}
		</div>
	</header>

	<!-- Not Logged In State -->
	{#if !data.user}
		<div class="border border-surface-300 dark:border-surface-700 p-8 sm:p-12 text-center bg-surface-50 dark:bg-surface-900 space-y-4">
			<span class="icon-[boxicons--lock] text-5xl opacity-40 mx-auto block"></span>
			<p class="text-sm max-w-md mx-auto text-surface-600 dark:text-surface-400">
				Please sign in to view your purchased passes and display ticket QR codes for admission.
			</p>
			<div class="pt-2">
				<a
					href={resolve('/login?redirect=/tickets')}
					class="btn preset-filled font-bold uppercase tracking-widest text-xs px-8 py-3"
				>
					Sign In to Access Tickets
				</a>
			</div>
		</div>
	{:else}
		<!-- Admin Quick Scan Bar (if user is admin) -->
		{#if data.user.role === 'admin'}
			<div class="border border-primary-500/40 bg-primary-500/5 p-4 sm:p-5">
				<div class="flex items-center gap-2 mb-2">
					<span class="icon-[boxicons--qr-scan] text-lg text-primary-500"></span>
					<h3 class="text-xs font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400">
						Admin Ticket Verification Portal
					</h3>
				</div>
				<form onsubmit={handleAdminVerifySubmit} class="flex flex-col sm:flex-row gap-2">
					<input
						type="text"
						bind:value={manualTicketId}
						placeholder="Scan or enter Ticket ID / Verification URL..."
						class="flex-1 border bg-surface-50 dark:bg-surface-900 px-3 py-2 text-xs outline-none focus:border-primary-500"
					/>
					<button
						type="submit"
						class="btn preset-filled-primary-500 font-bold uppercase tracking-wider text-xs px-4 py-2"
					>
						Verify Ticket
					</button>
				</form>
			</div>
		{/if}

		<!-- Filters -->
		<div class="flex flex-wrap items-center justify-between gap-4 border-b pb-3">
			<div class="flex items-center gap-1 border p-1 bg-surface-100 dark:bg-surface-800 text-xs">
				<button
					type="button"
					onclick={() => (filter = 'all')}
					class="btn {filter === 'all' ? 'preset-filled' : 'preset-outlined'} text-xs font-bold uppercase tracking-wider px-3 py-1"
				>
					All ({data.tickets.length})
				</button>
				<button
					type="button"
					onclick={() => (filter = 'active')}
					class="btn {filter === 'active' ? 'preset-filled' : 'preset-outlined'} text-xs font-bold uppercase tracking-wider px-3 py-1"
				>
					Active ({data.tickets.filter((t) => !t.scanned_at && t.status !== 'used').length})
				</button>
				<button
					type="button"
					onclick={() => (filter = 'used')}
					class="btn {filter === 'used' ? 'preset-filled' : 'preset-outlined'} text-xs font-bold uppercase tracking-wider px-3 py-1"
				>
					Admitted ({data.tickets.filter((t) => t.scanned_at || t.status === 'used').length})
				</button>
			</div>

			<span class="text-xs  uppercase text-surface-500">
				Showing {filteredTickets.length} {filteredTickets.length === 1 ? 'ticket' : 'tickets'}
			</span>
		</div>

		<!-- Tickets List -->
		{#if filteredTickets.length > 0}
			<div class="space-y-6">
				{#each filteredTickets as ticket (ticket.id)}
					<TicketCard {ticket} />
				{/each}
			</div>
		{:else}
			<div class="border border-dashed border-surface-300 dark:border-surface-700 p-12 text-center space-y-3">
				<span class="icon-[boxicons--film] text-4xl opacity-30 mx-auto block"></span>
				<h3 class="text-lg font-bold uppercase tracking-tight">No Tickets Found</h3>
				<p class="text-xs text-surface-600 dark:text-surface-400 max-w-sm mx-auto">
					{filter === 'all'
						? "You haven't reserved any screening tickets yet. Browse our current season to book admission."
						: `No tickets matching filter "${filter}".`}
				</p>
				<div class="pt-2">
					<a
						href={resolve('/screenings')}
						class="btn preset-outlined text-xs uppercase font-bold tracking-wider"
					>
						Explore Screenings
					</a>
				</div>
			</div>
		{/if}
	{/if}
</div>
