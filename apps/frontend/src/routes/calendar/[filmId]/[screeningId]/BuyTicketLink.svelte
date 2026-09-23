<script lang="ts">
	import { resolve } from '$app/paths';
	import type { Film, Screening } from '$lib';
	import { formatScreeningDate, formatScreeningTime } from '$lib/funcs/dates';

	interface Props {
		film: Film | undefined;
		screening: Screening;
	}
	let { film, screening }: Props = $props();
	const formattedScreeningDate = $derived(
		screening.showing_date ? formatScreeningDate(screening.showing_date) : null
	);
	const formattedScreeningTime = $derived(
		screening.showing_date ? formatScreeningTime(screening.showing_date) : null
	);
</script>

{#if film}
	<a
		class="btn cursor-grab preset-outlined font-bold text-wrap uppercase hover:preset-filled duration-150"
		href={resolve(`/calendar/${film.id}/${screening.id}/buy`)}
	>
		Order Tickets - {formattedScreeningDate}, {formattedScreeningTime}
	</a>
{/if}
