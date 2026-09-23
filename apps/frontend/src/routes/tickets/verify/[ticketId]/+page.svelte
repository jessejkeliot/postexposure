<script lang="ts">
	import type { PageProps } from './$types';
	import { formatScreeningDate, formatScreeningTime } from '$lib/funcs/dates';
	import { getFilmCoverUrl } from '$lib/pocketbase/db';
	import TicketScannerStatusHeader from '$lib/components/tickets/TicketScannerStatusHeader.svelte';
	import TicketAcceptanceStub from '$lib/components/tickets/TicketAcceptanceStub.svelte';
	import TicketRejectionStub from '$lib/components/tickets/TicketRejectionStub.svelte';

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
		screening?.showing_date ? formatScreeningTime(screening.showing_date) : 'TBD'
	);
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

<div class="mx-auto max-w-xl px-2 py-8 sm:py-12">
	<!-- Top Scanner Status Badge -->
	<TicketScannerStatusHeader adminUser={data.adminUser} />

	{#if res.status === 'ACCEPTED' && ticket}
		<!-- ACCEPTANCE WEBPAGE STATE -->
		<TicketAcceptanceStub
			{ticket}
			{screening}
			{film}
			{user}
			{filmCover}
			{formattedDate}
			{formattedTime}
			scannedAt={res.scannedAt}
		/>
	{:else}
		<!-- REJECTION / UNAUTHORIZED / NOT_FOUND STATES -->
		<TicketRejectionStub
			status={res.status}
			message={res.message}
			ticketId={'ticketId' in res ? res.ticketId : undefined}
			scannedAt={'scannedAt' in res ? res.scannedAt : undefined}
			loginRedirect={data.loginRedirect}
			{ticket}
			{screening}
			{film}
			{user}
			{formattedDate}
			{formattedTime}
		/>
	{/if}
</div>
