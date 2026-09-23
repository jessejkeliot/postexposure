<script lang="ts">
	import { resolve } from '$app/paths';
	import type { Ticket, Screening, Film, User } from '$lib/types/database';

	interface Props {
		status: 'UNAUTHORIZED' | 'NOT_FOUND' | 'ALREADY_SCANNED' | 'ACCEPTED' | string;
		message?: string;
		ticketId?: string;
		scannedAt?: string;
		loginRedirect?: string;
		ticket?: Ticket | null;
		screening?: Screening | null;
		film?: Film | null;
		user?: User | null;
		formattedDate?: string;
		formattedTime?: string;
	}

	let {
		status,
		message,
		ticketId,
		scannedAt,
		loginRedirect,
		ticket = null,
		screening = null,
		film = null,
		user = null,
		formattedDate = 'TBD',
		formattedTime = 'TBD'
	}: Props = $props();

	function formatTimestamp(iso?: string) {
		if (!iso) return 'Earlier session';
		return new Intl.DateTimeFormat('en-UK', {
			dateStyle: 'medium',
			timeStyle: 'medium'
		}).format(new Date(iso));
	}
</script>

{#if status === 'UNAUTHORIZED'}
	<div
		class="space-y-6 border-2 border-surface-950 bg-surface-50 p-8 text-center dark:border-surface-50 dark:bg-surface-900"
	>
		<div
			class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-surface-200 text-3xl dark:bg-surface-800"
		>
			<span class="icon-[boxicons--x-shield] text-error-500"></span>
		</div>
		<div>
			<h1 class="text-3xl font-bold tracking-tight uppercase">Admin Login Required</h1>
			<p class="mx-auto mt-2 max-w-sm text-sm text-surface-600 dark:text-surface-400">
				{message}
			</p>
		</div>
		<div class="flex flex-col justify-center gap-3 pt-2 sm:flex-row">
			<a
				href={loginRedirect || '/login'}
				class="btn preset-filled px-6 py-3 text-xs font-bold tracking-widest uppercase"
			>
				Sign In as Admin
			</a>
			<a
				href={resolve('/')}
				class="btn preset-outlined px-6 py-3 text-xs font-bold tracking-wider uppercase"
			>
				Return Home
			</a>
		</div>
	</div>
{:else if status === 'NOT_FOUND'}
	<div class="space-y-6 border-4 border-error-500 bg-surface-50 p-6 sm:p-8 dark:bg-surface-900">
		<div class="flex items-center gap-3 border-b border-error-500/30 pb-4">
			<span class="icon-[boxicons--x-circle] text-4xl text-error-500"></span>
			<div>
				<h1
					class="text-2xl font-bold leading-none text-error-600 uppercase sm:text-3xl dark:text-error-400"
				>
					Admission Rejected
				</h1>
				<p class="mt-1 text-xs tracking-wider text-surface-500 uppercase">
					Ticket Record Not Found
				</p>
			</div>
		</div>

		<div
			class="space-y-1 border border-error-500/30 bg-error-500/10 p-4 text-xs text-error-600 sm:text-sm dark:text-error-400"
		>
			<p class="font-bold">Invalid Barcode / QR Code</p>
			<p class="break-all text-xs">ID: {ticketId}</p>
			<p class="mt-2 text-xs">{message}</p>
		</div>

		<div class="flex items-center justify-between pt-2">
			<a
				href={resolve('/tickets')}
				class="btn preset-outlined text-xs font-bold tracking-wider uppercase"
			>
				Back to Scanner
			</a>
		</div>
	</div>
{:else if status === 'ALREADY_SCANNED'}
	<div class="space-y-6 border-4 border-amber-500 bg-surface-50 p-6 sm:p-8 dark:bg-surface-900">
		<!-- Header Rejection Banner -->
		<div class="flex items-center gap-3 border-b border-amber-500/40 pb-4">
			<span class="icon-[boxicons--alert-triangle] text-4xl text-amber-500"></span>
			<div>
				<h1
					class="text-2xl font-bold leading-none text-amber-600 uppercase sm:text-3xl dark:text-amber-400"
				>
					Admission Denied
				</h1>
				<p class="mt-1 text-xs tracking-wider text-surface-500 uppercase">
					Ticket Already Scanned
				</p>
			</div>
		</div>

		<div
			class="space-y-2 border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-700 sm:text-sm dark:text-amber-300"
		>
			<p class="font-bold">WARNING: DUPLICATE ENTRY ATTEMPT</p>
			<p class="text-xs">
				This pass was previously admitted on <span class="font-bold underline"
					>{formatTimestamp(scannedAt)}</span
				>.
			</p>
		</div>

		<!-- Ticket Information -->
		{#if ticket}
			<div
				class="space-y-3 border border-surface-300 bg-surface-100/50 p-4 dark:border-surface-700 dark:bg-surface-800/50"
			>
				<div class="flex items-start justify-between">
					<div>
						<span class="text-[10px] text-surface-500 uppercase">Film Title</span>
						<h3 class="text-lg font-bold uppercase">{film?.title || 'Screening'}</h3>
						{#if film?.director}
							<p class="text-xs text-surface-500">Directed by {film.director}</p>
						{/if}
					</div>
					<span
						class="border border-amber-500/40 bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-600 uppercase"
					>
						USED
					</span>
				</div>

				<div
					class="grid grid-cols-2 gap-2 border-t border-surface-200 pt-2 text-xs dark:border-surface-700"
				>
					<div>
						<span class="text-[10px] font-bold text-surface-500 uppercase">Screening</span>
						<p>{formattedDate} @ {formattedTime}</p>
					</div>
					<div>
						<span class="text-[10px] font-bold text-surface-500 uppercase">Ticket Holder</span>
						<p>{user?.name || user?.email || 'Registered User'}</p>
					</div>
				</div>
			</div>
		{/if}

		<div class="flex items-center justify-between pt-2">
			<a
				href={resolve('/tickets')}
				class="btn preset-outlined text-xs font-bold tracking-wider uppercase"
			>
				Scan Another Ticket
			</a>
		</div>
	</div>
{/if}
