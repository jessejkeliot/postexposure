<script lang="ts">
	import { tick } from 'svelte';
	import { resolve } from '$app/paths';
	import { Temporal } from '@js-temporal/polyfill';
	import { dayCodeStrings, getYearOfWeeks } from '$lib/funcs/dates';
	import type { Screening } from '$lib/types/database';
	import { isScreeningSoldOut, getRemainingTickets } from '$lib/pocketbase/db';
	import ScreeningThumbnail from './ScreeningThumbnail.svelte';
	import ScreeningsIndicatorDot from './ScreeningsIndicatorDot.svelte';
	import NoScreeningsBox from './NoScreeningsBox.svelte';

	interface Props {
		screenings: Screening[];
	}

	let { screenings }: Props = $props();
	const tz = Temporal.Now.timeZoneId();
	const today = Temporal.Now.plainDateISO(tz);

	// Generate 52 weeks (1 full year) starting from the current week
	const weeks = getYearOfWeeks(today, tz);

	function getScreeningPlainDate(screening: Screening): Temporal.PlainDate {
		return Temporal.Instant.from(screening.showing_date)
			.toZonedDateTimeISO(tz)
			.toPlainDate();
	}

	function anyScreeningOnThisDate(targetDate: Temporal.PlainDate): boolean {
		return screenings.some((screening) => {
			const sDate = getScreeningPlainDate(screening);
			return Temporal.PlainDate.compare(sDate, targetDate) === 0;
		});
	}

	// Current visible week index (0 to 51)
	let activeWeekIndex = $state(0);
	const activeWeek = $derived(weeks[activeWeekIndex] ?? weeks[0]);
	const headerLabel = $derived(activeWeek.label);

	// Find first date with a screening in the current week, or fallback to today
	const initialDate =
		weeks[0].dates.find((date) => anyScreeningOnThisDate(date)) ??
		(weeks[0].dates.some((d) => Temporal.PlainDate.compare(d, today) === 0) ? today : weeks[0].dates[0]);

	let selectedDateStr = $state<string | null>(initialDate ? initialDate.toString() : null);

	// Containers
	let scrollContainer = $state<HTMLElement | null>(null);
	let screeningsContainer = $state<HTMLElement | null>(null);

	// Derived Temporal.PlainDate from the selected value
	let selectedDateTemporal = $derived<Temporal.PlainDate | null>(
		selectedDateStr ? Temporal.PlainDate.from(selectedDateStr) : null
	);

	// Screenings happening on the selected day
	let selectedDayScreenings: Screening[] = $derived(
		selectedDateTemporal
			? screenings.filter((screening) => {
					const sDate = getScreeningPlainDate(screening);
					return Temporal.PlainDate.compare(sDate, selectedDateTemporal!) === 0;
				})
			: []
	);

	let isProgrammaticScroll = false;

	function handleScroll() {
		if (isProgrammaticScroll || !scrollContainer) return;
		const width = scrollContainer.clientWidth;
		if (width <= 0) return;
		const index = Math.round(scrollContainer.scrollLeft / width);
		activeWeekIndex = Math.max(0, Math.min(index, weeks.length - 1));
	}

	function handleWheel(event: WheelEvent) {
		if (!scrollContainer) return;
		// If vertical scroll dominates, map to horizontal scroll for seamless computer wheel experience
		if (Math.abs(event.deltaY) > Math.abs(event.deltaX) && Math.abs(event.deltaY) > 5) {
			event.preventDefault();
			scrollContainer.scrollBy({ left: event.deltaY * 1.5, behavior: 'smooth' });
		}
	}

	function scrollToWeek(index: number) {
		if (!scrollContainer) return;
		const targetIndex = Math.max(0, Math.min(index, weeks.length - 1));
		activeWeekIndex = targetIndex;
		isProgrammaticScroll = true;
		scrollContainer.scrollTo({
			left: targetIndex * scrollContainer.clientWidth,
			behavior: 'smooth'
		});
		setTimeout(() => {
			isProgrammaticScroll = false;
		}, 300);
	}

	function prevWeek() {
		scrollToWeek(activeWeekIndex - 1);
	}

	function nextWeek() {
		scrollToWeek(activeWeekIndex + 1);
	}

	async function handleDateSelect(date: Temporal.PlainDate) {
		selectedDateStr = date.toString();
		await tick();
		if (screeningsContainer) {
			const firstItem = screeningsContainer.querySelector('[data-screening-item]') as HTMLElement | null;
			if (firstItem) {
				firstItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
			}
		}
	}
</script>

<!-- Compact Calendar Widget -->
<div class="flex flex-col items-center justify-between gap-4 p-0 w-full max-w-3xl mx-auto">
	<!-- Header Bar: Dynamic Label, Prev/Next buttons, and Link to Full Calendar -->
	<div class="flex flex-row items-center justify-between w-full gap-4">
		<div class="flex flex-row justify-between items-center gap-2 flex-9 max-w-2xl">
			<h2 class="text-2xl sm:text-3xl italic font-normal tracking-wide">
				{headerLabel}
			</h2>
			<div class="flex items-center gap-1 ml-2 p-0">
				<button
					type="button"
					onclick={prevWeek}
					disabled={activeWeekIndex === 0}
					class="btn btn-icon-xl preset-outlined disabled:opacity-25"
					aria-label="Previous week"
					title="Previous week"
				>
					<span class="icon-[boxicons--chevron-left] text-base"></span>
				</button>
				<button
					type="button"
					onclick={nextWeek}
					disabled={activeWeekIndex >= weeks.length - 1}
					class="btn btn-icon-xl preset-outlined disabled:opacity-25"
					aria-label="Next week"
					title="Next week"
				>
					<span class="icon-[boxicons--chevron-right] text-base"></span>
				</button>
			</div>
		</div>

		<!-- Link to Larger Calendar -->
		 <div class="flex-1 flex flex-row justify-end items-center">
		<a
			href={resolve('/calendar')}
			title="Full Calendar"
			class="btn btn-icon-xl preset-outlined text-base flex items-center justify-end"
		>
			<span class="icon-[boxicons--calendar]"></span>
		</a>
		</div>
	</div>

	<!-- Horizontal Slideable/Scrollable Multi-Week Row -->
	<div
		{@attach (node: HTMLElement) => {
			scrollContainer = node;
		}}
		onscroll={handleScroll}
		onwheel={handleWheel}
		class="flex w-full overflow-x-auto snap-x snap-mandatory scroll-smooth border border-surface-200-800 p-0 bg-surface-50 dark:bg-surface-950"
		style="scrollbar-width: none; -ms-overflow-style: none;"
	>
		{#each weeks as week (week.start.toString())}
			<div class="w-full shrink-0 snap-start flex flex-row justify-between gap-1">
				{#each week.dates as date (date.toString())}
					{@const isSelected = selectedDateStr === date.toString()}
					{@const hasScreenings = anyScreeningOnThisDate(date)}
					{@const isToday = Temporal.PlainDate.compare(date, today) === 0}
					<button
						type="button"
						onclick={() => handleDateSelect(date)}
						class="flex-1 py-1 px-0.5 flex flex-col items-center justify-center transition-colors relative cursor-pointer
							{isSelected
								? 'bg-surface-950 text-surface-50 dark:bg-surface-50 dark:text-surface-950 font-normal shadow-xs'
								: hasScreenings
									? 'opacity-100 hover:bg-surface-200-800'
									: 'font-light opacity-35 dark:opacity-65 hover:opacity-75'}
						"
					>
						<span class="text-[9px] uppercase tracking-wider opacity-60">
							{dayCodeStrings[date.dayOfWeek - 1]}
						</span>
						<span class="text-xs font-semibold {isToday ? 'underline decoration-2 underline-offset-4' : ''}">
							{date.day}
						</span>
						{#if hasScreenings}
							<ScreeningsIndicatorDot {hasScreenings} {isSelected}/>
						{:else}
							<span class="w-1.5 h-1.5 mt-0.5"></span>
						{/if}
					</button>
				{/each}
			</div>
		{/each}
	</div>

	<!-- Screenings for the selected day -->
	<div
		{@attach (node: HTMLElement) => {
			screeningsContainer = node;
		}}
		class="w-full space-y-2"
	>
		{#if selectedDayScreenings.length > 0}
			<div class="divide-y divide-surface-200-800">
				{#each selectedDayScreenings as screening (screening.id)}
					<div data-screening-item>
						<ScreeningThumbnail {screening} variant="compact" />
					</div>
				{/each}
			</div>
		{:else}
			<NoScreeningsBox></NoScreeningsBox>
		{/if}
	</div>
</div>
