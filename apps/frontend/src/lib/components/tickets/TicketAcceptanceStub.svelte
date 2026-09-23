<script lang="ts">
	import { resolve } from '$app/paths';
	import type { Ticket, Screening, Film, User } from '$lib/types/database';

	interface Props {
		ticket: Ticket;
		screening?: Screening | null;
		film?: Film | null;
		user?: User | null;
		filmCover?: string | null;
		formattedDate: string;
		formattedTime: string;
		scannedAt?: string;
	}

	let {
		ticket,
		screening = null,
		film = null,
		user = null,
		filmCover = null,
		formattedDate,
		formattedTime,
		scannedAt
	}: Props = $props();

	function formatTimestamp(iso?: string) {
		if (!iso) return 'Just now';
		return new Intl.DateTimeFormat('en-UK', {
			dateStyle: 'medium',
			timeStyle: 'medium'
		}).format(new Date(iso));
	}
</script>

<div
	class="space-y-6 border-4 border-emerald-500 bg-surface-50 p-6 shadow-xl sm:p-8 dark:bg-surface-900"
>
	<!-- Header Acceptance Banner -->
	<div class="flex items-center gap-4 border-b border-emerald-500/40 pb-5">
		<div
			class="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-surface-50 shadow-lg"
		>
			<span class="icon-[boxicons--check] text-4xl stroke-2"></span>
		</div>
		<div>
			<span
				class="mb-1 inline-block border border-emerald-500/30 bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase"
			>
				VALIDATED PASS
			</span>
			<h1
				class="text-2xl font-bold leading-none text-emerald-600 uppercase sm:text-4xl dark:text-emerald-400"
			>
				Admission Accepted
			</h1>
			<p class="mt-1 text-xs tracking-wider text-surface-500 uppercase">
				Door check verified at {formatTimestamp(scannedAt)}
			</p>
		</div>
	</div>

	<!-- Film & Screening Details -->
	<div
		class="space-y-4 border border-surface-300 bg-surface-100/50 p-5 dark:border-surface-700 dark:bg-surface-800/40"
	>
		{#if filmCover}
			<div class="mb-3 h-32 w-full overflow-hidden bg-surface-950">
				<img
					src={filmCover}
					alt={film?.title}
					class="h-full w-full object-cover grayscale opacity-80"
				/>
			</div>
		{/if}

		<div>
			<span class="text-[10px] tracking-wider text-surface-500 uppercase">Screening Film</span>
			<h2 class="text-2xl font-bold tracking-tight leading-tight uppercase">
				{film?.title || 'Screening'}
			</h2>
			{#if film?.director}
				<p class="text-xs text-surface-600 dark:text-surface-400">By {film.director}</p>
			{/if}
		</div>

		<div
			class="grid grid-cols-2 gap-4 border-t border-surface-200 pt-3 text-xs dark:border-surface-700"
		>
			<div>
				<span class="block text-[10px] font-bold text-surface-500 uppercase">Date & Time</span>
				<p class="text-sm font-semibold">{formattedDate}</p>
				<p class="text-surface-600 dark:text-surface-400">{formattedTime}</p>
			</div>
			<div>
				<span class="block text-[10px] font-bold text-surface-500 uppercase">Ticket Holder</span>
				<p class="text-sm font-semibold">{user?.name || 'Registered Patron'}</p>
				<p class="truncate text-surface-600 dark:text-surface-400">{user?.email || 'N/A'}</p>
			</div>
		</div>

		<div
			class="flex items-center justify-between border-t border-surface-200 pt-3 text-[11px] text-surface-500 dark:border-surface-700"
		>
			<span>Ticket ID: {ticket.id}</span>
			<span class="font-bold text-emerald-600 dark:text-emerald-400">● Admitted Just Now</span>
		</div>
	</div>

	<!-- Admin Next Actions -->
	<div class="flex flex-col justify-between gap-3 pt-2 sm:flex-row">
		<a
			href={resolve('/tickets')}
			class="btn bg-surface-950 px-6 py-3 text-center text-xs font-bold tracking-widest text-surface-50 uppercase dark:bg-surface-50 dark:text-surface-950"
		>
			Scan Next Ticket
		</a>
		<a
			href={resolve('/screenings')}
			class="btn preset-outlined px-6 py-3 text-center text-xs font-bold tracking-wider uppercase"
		>
			View Season Schedule
		</a>
	</div>
</div>
