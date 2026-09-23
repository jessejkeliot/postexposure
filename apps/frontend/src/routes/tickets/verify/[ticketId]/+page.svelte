<script lang="ts">
	import type { PageProps } from './$types';
	import { formatScreeningDate, formatScreeningTime } from '$lib/funcs/dates';
	import { getFilmCoverUrl } from '$lib/pocketbase/db';
	import { resolve } from '$app/paths';

	let { data }: PageProps = $props();

	const res = $derived(data.result);
	const ticket = $derived('ticket' in res ? res.ticket : null);
	const film = $derived(ticket?.expand?.screening?.expand?.film);
	const screening = $derived(ticket?.expand?.screening);
	const user = $derived(ticket?.expand?.user);
	const filmCover = $derived(film ? getFilmCoverUrl(film, { thumb: '600x400' }) : null);

	const formattedDate = $derived(
		screening?.showing_date ? formatScreeningDate(screening.showing_date) : 'TBD'
	);
	const formattedTime = $derived(
		screening?.showing_time ? formatScreeningTime(screening.showing_time) : 'TBD'
	);

	function formatTimestamp(iso?: string) {
		if (!iso) return 'Just now';
		return new Intl.DateTimeFormat('en-UK', {
			dateStyle: 'medium',
			timeStyle: 'medium'
		}).format(new Date(iso));
	}
</script>

<svelte:head>
	<title>
		{res.status === 'ACCEPTED'
			? '✓ Ticket Accepted | Post Exposure'
			: res.status === 'ALREADY_SCANNED'
				? '⚠ Ticket Already Scanned | Post Exposure'
				: 'Ticket Verification | Post Exposure'}
	</title>
</svelte:head>

<div class="mx-auto max-w-xl py-8 px-2 sm:py-12">
	<!-- Top Scanner Status Badge -->
	<div class="flex items-center justify-between border-b pb-3 mb-6 text-xs">
		<span class=" uppercase tracking-wider text-surface-500">
			POST EXPOSURE // DOOR SCANNER
		</span>
		{#if data.adminUser}
			<span class=" text-emerald-600 dark:text-emerald-400">
				Admin: {data.adminUser.name || data.adminUser.email}
			</span>
		{:else}
			<span class=" text-error-500">Not Authenticated</span>
		{/if}
	</div>

	<!-- UNAUTHORIZED STATE -->
	{#if res.status === 'UNAUTHORIZED'}
		<div class="border-2 border-surface-950 dark:border-surface-50 bg-surface-50 dark:bg-surface-900 p-8 text-center space-y-6">
			<div class="w-16 h-16 rounded-full bg-surface-200 dark:bg-surface-800 flex items-center justify-center mx-auto text-3xl">
				<span class="icon-[boxicons--x-shield] text-error-500"></span>
			</div>
			<div>
				<h1 class="text-3xl font-bold uppercase tracking-tight">Admin Login Required</h1>
				<p class="mt-2 text-sm text-surface-600 dark:text-surface-400 max-w-sm mx-auto">
					{res.message}
				</p>
			</div>
			<div class="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
				<a
					href={data.loginRedirect || '/login'}
					class="btn bg-surface-950 text-surface-50 dark:bg-surface-50 dark:text-surface-950 font-bold uppercase tracking-widest text-xs px-6 py-3"
				>
					Sign In as Admin
				</a>
				<a
					href={resolve('/')}
					class="btn preset-outlined text-xs uppercase font-bold tracking-wider px-6 py-3"
				>
					Return Home
				</a>
			</div>
		</div>

	<!-- INVALID / NOT FOUND STATE -->
	{:else if res.status === 'NOT_FOUND'}
		<div class="border-4 border-error-500 bg-surface-50 dark:bg-surface-900 p-6 sm:p-8 space-y-6">
			<div class="flex items-center gap-3 border-b border-error-500/30 pb-4">
				<span class="icon-[boxicons--x-circle] text-4xl text-error-500"></span>
				<div>
					<h1 class="text-2xl sm:text-3xl font-bold uppercase text-error-600 dark:text-error-400 leading-none">
						Admission Rejected
					</h1>
					<p class="text-xs uppercase  tracking-wider text-surface-500 mt-1">
						Ticket Record Not Found
					</p>
				</div>
			</div>

			<div class="p-4 bg-error-500/10 border border-error-500/30 text-xs sm:text-sm text-error-600 dark:text-error-400 space-y-1">
				<p class="font-bold">Invalid Barcode / QR Code</p>
				<p class=" text-xs break-all">ID: {res.ticketId}</p>
				<p class="text-xs mt-2">{res.message}</p>
			</div>

			<div class="flex justify-between items-center pt-2">
				<a
					href={resolve('/tickets')}
					class="btn preset-outlined text-xs uppercase font-bold tracking-wider"
				>
					Back to Scanner
				</a>
			</div>
		</div>

	<!-- ALREADY SCANNED STATE (REJECTION) -->
	{:else if res.status === 'ALREADY_SCANNED'}
		<div class="border-4 border-amber-500 bg-surface-50 dark:bg-surface-900 p-6 sm:p-8 space-y-6">
			<!-- Header Rejection Banner -->
			<div class="flex items-center gap-3 border-b border-amber-500/40 pb-4">
				<span class="icon-[boxicons--alert-triangle] text-4xl text-amber-500"></span>
				<div>
					<h1 class="text-2xl sm:text-3xl font-bold uppercase text-amber-600 dark:text-amber-400 leading-none">
						Admission Denied
					</h1>
					<p class="text-xs uppercase  tracking-wider text-surface-500 mt-1">
						Ticket Already Scanned
					</p>
				</div>
			</div>

			<div class="p-4 bg-amber-500/10 border border-amber-500/30 text-xs sm:text-sm text-amber-700 dark:text-amber-300 space-y-2">
				<p class="font-bold">WARNING: DUPLICATE ENTRY ATTEMPT</p>
				<p class="text-xs">
					This pass was previously admitted on <span class="font-bold underline">{formatTimestamp(res.scannedAt)}</span>.
				</p>
			</div>

			<!-- Ticket Information -->
			{#if ticket}
				<div class="border border-surface-300 dark:border-surface-700 p-4 space-y-3 bg-surface-100/50 dark:bg-surface-800/50">
					<div class="flex justify-between items-start">
						<div>
							<span class="text-[10px]  uppercase text-surface-500">Film Title</span>
							<h3 class="text-lg font-bold uppercase">{film?.title || 'Screening'}</h3>
							{#if film?.director}
								<p class="text-xs text-surface-500">Directed by {film.director}</p>
							{/if}
						</div>
						<span class="px-2 py-0.5 text-[10px]  uppercase bg-amber-500/20 text-amber-600 font-bold border border-amber-500/40">
							USED
						</span>
					</div>

					<div class="grid grid-cols-2 gap-2 text-xs border-t border-surface-200 dark:border-surface-700 pt-2">
						<div>
							<span class="text-[10px] uppercase font-bold text-surface-500">Screening</span>
							<p>{formattedDate} @ {formattedTime}</p>
						</div>
						<div>
							<span class="text-[10px] uppercase font-bold text-surface-500">Ticket Holder</span>
							<p>{user?.name || user?.email || 'Registered User'}</p>
						</div>
					</div>
				</div>
			{/if}

			<div class="flex justify-between items-center pt-2">
				<a
					href={resolve('/tickets')}
					class="btn preset-outlined text-xs uppercase font-bold tracking-wider"
				>
					Scan Another Ticket
				</a>
			</div>
		</div>

	<!-- ACCEPTANCE WEBPAGE STATE -->
	{:else if res.status === 'ACCEPTED'}
		<div class="border-4 border-emerald-500 bg-surface-50 dark:bg-surface-900 p-6 sm:p-8 space-y-6 shadow-xl">
			<!-- Header Acceptance Banner -->
			<div class="flex items-center gap-4 border-b border-emerald-500/40 pb-5">
				<div class="w-14 h-14 rounded-full bg-emerald-500 flex items-center justify-center text-surface-50 shrink-0 shadow-lg">
					<span class="icon-[boxicons--check] text-4xl stroke-2"></span>
				</div>
				<div>
					<span class="inline-block px-2 py-0.5 text-[10px]  uppercase font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 mb-1">
						VALIDATED PASS
					</span>
					<h1 class="text-2xl sm:text-4xl font-bold uppercase text-emerald-600 dark:text-emerald-400 leading-none">
						Admission Accepted
					</h1>
					<p class="text-xs  uppercase tracking-wider text-surface-500 mt-1">
						Door check verified at {formatTimestamp(res.scannedAt)}
					</p>
				</div>
			</div>

			<!-- Film & Screening Details -->
			<div class="border border-surface-300 dark:border-surface-700 p-5 space-y-4 bg-surface-100/50 dark:bg-surface-800/40">
				{#if filmCover}
					<div class="h-32 w-full overflow-hidden bg-surface-950 mb-3">
						<img src={filmCover} alt={film?.title} class="w-full h-full object-cover grayscale opacity-80" />
					</div>
				{/if}

				<div>
					<span class="text-[10px]  uppercase text-surface-500 tracking-wider">Screening Film</span>
					<h2 class="text-2xl font-bold uppercase tracking-tight leading-tight">{film?.title || 'Screening'}</h2>
					{#if film?.director}
						<p class="text-xs text-surface-600 dark:text-surface-400">By {film.director}</p>
					{/if}
				</div>

				<div class="grid grid-cols-2 gap-4 border-t border-surface-200 dark:border-surface-700 pt-3 text-xs">
					<div>
						<span class="block text-[10px] font-bold uppercase text-surface-500">Date & Time</span>
						<p class="font-semibold text-sm">{formattedDate}</p>
						<p class="text-surface-600 dark:text-surface-400">{formattedTime}</p>
					</div>
					<div>
						<span class="block text-[10px] font-bold uppercase text-surface-500">Ticket Holder</span>
						<p class="font-semibold text-sm">{user?.name || 'Registered Patron'}</p>
						<p class="text-surface-600 dark:text-surface-400 truncate">{user?.email || 'N/A'}</p>
					</div>
				</div>

				<div class="border-t border-surface-200 dark:border-surface-700 pt-3 flex justify-between items-center text-[11px]  text-surface-500">
					<span>Ticket ID: {ticket?.id}</span>
					<span class="text-emerald-600 dark:text-emerald-400 font-bold">● Admitted Just Now</span>
				</div>
			</div>

			<!-- Admin Next Actions -->
			<div class="flex flex-col sm:flex-row gap-3 justify-between pt-2">
				<a
					href={resolve('/tickets')}
					class="btn bg-surface-950 text-surface-50 dark:bg-surface-50 dark:text-surface-950 font-bold uppercase tracking-widest text-xs px-6 py-3 text-center"
				>
					Scan Next Ticket
				</a>
				<a
					href={resolve('/screenings')}
					class="btn preset-outlined text-xs uppercase font-bold tracking-wider px-6 py-3 text-center"
				>
					View Season Schedule
				</a>
			</div>
		</div>
	{/if}
</div>
