<script lang="ts">
	import { tick } from 'svelte';
	import { SegmentedControl } from '@skeletonlabs/skeleton-svelte';
	import { Temporal } from '@js-temporal/polyfill';
	import { getArrayOfDates, getWeekDateRange, monthStrings } from '$lib/funcs/dates';
	import type { Screening } from '$lib/types/database';

	interface Props {
		screenings: Screening[];
	}

	let { screenings }: Props = $props();
	const tz = Temporal.Now.timeZoneId();
	const today = Temporal.Now.plainDateISO(tz);

	// Monday to Sunday of the current week
	const { start, end } = getWeekDateRange(today, tz);
	const dates = getArrayOfDates(start, end);

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

	// First date with a screening, or fallback to today
	const initialDate =
		dates.find((date) => anyScreeningOnThisDate(date)) ??
		(dates.some((d) => Temporal.PlainDate.compare(d, today) === 0) ? today : dates[0]);

	let dayHasChanged = $state(false);
    const initialDateStr = initialDate ? initialDate.toString() : null;
	// SegmentedControl binds to string values (ISO formatted: YYYY-MM-DD)
	let selectedDateStr = $state<string | null>(initialDateStr);

	// Container reference for scrolling
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

	async function handleValueChange(newValue: string | null) {
		selectedDateStr = newValue;

        dayHasChanged = true;
		// Only scroll into view if changed to a date other than initial date
		if (newValue && dayHasChanged) {
			await tick();
			if (screeningsContainer) {
				const items = screeningsContainer.querySelectorAll('[data-screening-item]');
				const target = items.length > 0 ? items[items.length - 1] : screeningsContainer;
				target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
			}
		}
	}
</script>

<!-- Indicate: today, which days have screenings -->
<div class="flex flex-col items-center justify-between gap-2 p-0">
	<SegmentedControl
		value={selectedDateStr}
		onValueChange={(details) => handleValueChange(details.value)}
		class="align-left flex w-full max-w-3xl flex-col space-4"
	>
		<SegmentedControl.Label class="font-normal">
			<h2 class="text-3xl italic">On This Week...</h2>
		</SegmentedControl.Label>

		{#if dates.length > 0}
			<button type="button" class="btn w-fit preset-filled-surface-500">
				{monthStrings[dates[0].month - 1]}
			</button>
		{/if}

		<SegmentedControl.Control class="flex w-full flex-row justify-between border p-1 transition-all duration-75">
			<SegmentedControl.Indicator class="bg-primary-500 text-primary-contrast-500" style="transition-duration: 250ms !important; transition-timing-function: cubic-bezier(0, 0, 0.2, 1) !important;"/>
			{#each dates as date (date.toString())}
				<SegmentedControl.Item
					value={date.toString()}
					class="{anyScreeningOnThisDate(date)
						? 'opacity-100'
						: 'font-light opacity-35 dark:opacity-65'}
						data-[state=checked]:font-normal data-[state=checked]:text-primary-contrast-500
						{Temporal.PlainDate.compare(date, today) === 0 ? 'underline' : ''}
                        px-0 mx-0
					"
				>
					<SegmentedControl.ItemText class="text-xs mx-0 px-0">{date.day.toString()}</SegmentedControl.ItemText>
					<SegmentedControl.ItemHiddenInput />
				</SegmentedControl.Item>
			{/each}
		</SegmentedControl.Control>
	</SegmentedControl>

	<!-- Screenings for the selected day -->
	<div bind:this={screeningsContainer} class="w-full max-w-3xl space-y-2">
		{#if selectedDayScreenings.length > 0}
			<div class="divide-y divide-surface-200-800 rounded border border-surface-200-800">
				{#each selectedDayScreenings as screening (screening.id)}
					<div data-screening-item class="flex flex-row items-center justify-between p-4">
						<div>
							<h3 class="text-lg font-bold">
								{screening.expand?.film?.title ?? 'Film Screening'}
							</h3>
							{#if screening.expand?.film?.director}
								<p class="text-sm opacity-70">
									Directed by {screening.expand?.film?.director}
								</p>
							{/if}
						</div>
						<div class="text-right">
							<span class="rounded bg-secondary-200-800 px-2 py-1 text-lg font-medium">
								{Temporal.Instant.from(screening.showing_time)
									.toZonedDateTimeISO(tz)
									.toPlainTime()
									.toString({ smallestUnit: 'minute' })}
							</span>
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<p class="text-center text-sm opacity-50 py-4">
				No screenings scheduled for {selectedDateTemporal ? selectedDateTemporal.toString() : 'this date'}.
			</p>
		{/if}
	</div>
</div>
