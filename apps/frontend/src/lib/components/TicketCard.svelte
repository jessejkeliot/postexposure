<script lang="ts">
	import { onMount } from 'svelte';
	import QRCode from 'qrcode';
	import type { Ticket } from '$lib/types/database';
	import { formatScreeningDate, formatScreeningTime } from '$lib/funcs/dates';
	import { getFilmCoverUrl } from '$lib/pocketbase/db';

	interface Props {
		ticket: Ticket;
		baseUrl?: string;
	}

	let { ticket, baseUrl = '' }: Props = $props();

	let qrDataUrl = $state<string>('');
	let copied = $state(false);

	const film = $derived(ticket.expand?.screening?.expand?.film);
	const screening = $derived(ticket.expand?.screening);
	const season = $derived(ticket.expand?.screening?.expand?.season);
	const filmCover = $derived(film ? getFilmCoverUrl(film, { thumb: '400x300' }) : null);

	const isUsed = $derived(Boolean(ticket.scanned_at || ticket.status === 'used'));
	const formattedDate = $derived(
		screening?.showing_date ? formatScreeningDate(screening.showing_date) : 'TBD'
	);
	const formattedTime = $derived(
		screening?.showing_time ? formatScreeningTime(screening.showing_time) : 'TBD'
	);

	onMount(async () => {
		const targetUrl = typeof window !== 'undefined'
			? `${window.location.origin}/tickets/verify/${ticket.id}`
			: `${baseUrl}/tickets/verify/${ticket.id}`;

		try {
			qrDataUrl = await QRCode.toDataURL(targetUrl, {
				width: 220,
				margin: 1,
				color: {
					dark: '#0a0a0a',
					light: '#ffffff'
				}
			});
		} catch (err) {
			console.error('Failed to generate QR Code:', err);
		}
	});

	async function copyLink() {
		if (typeof window === 'undefined') return;
		const fullUrl = `${window.location.origin}/tickets/verify/${ticket.id}`;
		await navigator.clipboard.writeText(fullUrl);
		copied = true;
		setTimeout(() => {
			copied = false;
		}, 2000);
	}
</script>

<div
	class="relative flex flex-col md:flex-row border border-surface-300 dark:border-surface-700 bg-surface-50 dark:bg-surface-900 transition-all shadow-sm hover:shadow-md overflow-hidden"
>
	<!-- Left / Top Film Cover Thumbnail (if available) -->
	{#if filmCover}
		<div class="hidden sm:block sm:w-36 md:w-44 bg-surface-950 shrink-0 relative overflow-hidden">
			<img
				src={filmCover}
				alt={film?.title || 'Screening'}
				class="w-full h-full object-cover grayscale opacity-90 hover:grayscale-0 transition-all duration-300"
			/>
		</div>
	{/if}

	<!-- Main Ticket Details -->
	<div class="flex-1 p-4 sm:p-6 flex flex-col justify-between space-y-4">
		<!-- Header / Film Title -->
		<div>
			<div class="flex items-center justify-between gap-2 mb-1">
				<span class="text-[10px] sm:text-xs  tracking-widest uppercase text-surface-500">
					Ticket #{ticket.id.substring(0, 8)}
				</span>
				{#if isUsed}
					<span class="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-surface-300 dark:bg-surface-700 text-surface-700 dark:text-surface-300">
						<span class="icon-[boxicons--check] text-xs"></span>
						Admitted
					</span>
				{:else}
					<span class="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40">
						<span class="icon-[boxicons--check-circle] text-xs"></span>
						Valid & Active
					</span>
				{/if}
			</div>

			<h3 class="text-xl sm:text-2xl font-bold uppercase tracking-tight leading-tight">
				{film?.title || 'Film Screening'}
			</h3>

			{#if film?.director}
				<p class="text-xs text-surface-600 dark:text-surface-400">
					Directed by <span class="font-medium">{film.director}</span>
				</p>
			{/if}

			{#if season?.title}
				<p class="text-[11px]  uppercase text-surface-500 mt-1">
					Season: {season.title}
				</p>
			{/if}
		</div>

		<!-- Date / Time Grid -->
		<div class="grid grid-cols-2 gap-3 pt-3 border-t border-surface-200 dark:border-surface-800 text-xs">
			<div>
				<span class="block text-[10px] uppercase font-bold text-surface-500 tracking-wider">Date</span>
				<span class="font-semibold text-sm">{formattedDate}</span>
			</div>
			<div>
				<span class="block text-[10px] uppercase font-bold text-surface-500 tracking-wider">Time</span>
				<span class="font-semibold text-sm">{formattedTime}</span>
			</div>
		</div>

		<!-- Footer actions -->
		<div class="flex items-center justify-between pt-2 border-t border-surface-200 dark:border-surface-800 text-xs">
			<div class="text-[11px] text-surface-500">
				{#if ticket.scanned_at}
					Scanned on {new Intl.DateTimeFormat('en-UK', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(ticket.scanned_at))}
				{:else}
					Present QR code at door for scanning
				{/if}
			</div>
			<div class="flex items-center gap-2">
				<button
					type="button"
					onclick={copyLink}
					class="text-[11px]  underline uppercase hover:text-primary-500 transition-colors"
					title="Copy admin verification link"
				>
					{copied ? 'Copied link!' : 'Copy Link'}
				</button>
			</div>
		</div>
	</div>

	<!-- Perforated Stub Divider -->
	<div class="relative flex items-center md:flex-col justify-between py-0 md:py-2 px-4 md:px-0">
		<div class="w-full md:w-0 md:h-full border-b md:border-b-0 md:border-r border-dashed border-surface-300 dark:border-surface-700"></div>
	</div>

	<!-- QR Code Section -->
	<div class="p-4 sm:p-6 bg-surface-100/50 dark:bg-surface-950 flex flex-col items-center justify-center shrink-0 min-w-44 text-center">
		{#if qrDataUrl}
			<div class="bg-white p-2 rounded-sm shadow-inner border border-surface-300">
				<img src={qrDataUrl} alt="Ticket QR Code" class="w-28 h-28 sm:w-32 sm:h-32 block" />
			</div>
		{:else}
			<div class="w-28 h-28 sm:w-32 sm:h-32 border border-dashed flex items-center justify-center">
				<span class="icon-[boxicons--loader-lines] animate-spin text-2xl"></span>
			</div>
		{/if}

		<span class="mt-2 text-[10px]  tracking-widest uppercase text-surface-500">
			SCAN TO ADMIT
		</span>

		<a
			href="/tickets/verify/{ticket.id}"
			class="mt-1 text-[10px]  text-surface-600 hover:text-surface-950 dark:hover:text-surface-50 underline"
			target="_blank"
			rel="noreferrer"
		>
			Verify View ↗
		</a>
	</div>
</div>
