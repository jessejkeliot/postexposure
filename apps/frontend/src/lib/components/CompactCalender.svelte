<script lang="ts">
	import { SegmentedControl } from '@skeletonlabs/skeleton-svelte';
	import { Listbox } from '@skeletonlabs/skeleton-svelte';
	import { Temporal } from '@js-temporal/polyfill';
	import { getArrayOfDates, getWeekDateRange, monthStrings } from '$lib/funcs/dates';
	import type { Screening } from '$lib/types/database';
	import { onMount } from 'svelte';

	interface Props {
		screenings: Screening[];
	}
	let { screenings }: Props = $props();
	const tz = Temporal.Now.timeZoneId();
	const today = Temporal.Now.plainDateISO(tz);
	// dayOfWeek: 1 (Monday) to 7 (Sunday) in ISO calendar
	const { start, end } = getWeekDateRange(today);
	const dates = getArrayOfDates(start, end);
	let selectedDate = $state<string | null>(); 
	// let selectedDateTemporal: Temporal.PlainDate = $derived(Temporal.PlainDate.from()); 
    // let selectedDateTemporal = $derived();
	selectedDate = dates // makes an array of dates which have screenings
		.filter((date) => {
			for (let index = 0; index < screenings.length; index++) {
				const screening = screenings[index];
				const screeningDate = Temporal.Instant.from(screening.showing_date)
					.toZonedDateTimeISO(tz)
					.toPlainDate();

				if (Temporal.PlainDate.compare(screeningDate, date) === 0) {
					return true;
				}
			}
		})[0]
		?.day.toString();

	onMount(() => {
		screenings.forEach((s) => console.log(s));
	});

	function anyScreeningOnThisDate(screenings: Screening[], date: Temporal.PlainDate): boolean {
		return screenings.some((screening) => {
			const screeningDate = Temporal.Instant.from(screening.showing_date)
				.toZonedDateTimeISO(tz)
				.toPlainDate();

			return Temporal.PlainDate.compare(screeningDate, date) === 0;
		});
	}

    let selectedDayScreenings: Screening[] = $derived(screenings.filter((screening) => {
			const screeningDate = Temporal.Instant.from(screening.showing_date)
				.toZonedDateTimeISO(tz)
				.toPlainDate();

			return Temporal.PlainDate.compare(screeningDate, ) === 0; //wrong
		}));
</script>

<!-- Indicate: today, which days have screenings -->

<div class="flex flex-col items-center justify-between gap-4 p-0 outline-2">
	<SegmentedControl
		value={selectedDate}
		onValueChange={(details) => (selectedDate = details.value)}
		class="align-left mb-10 flex w-full max-w-3xl flex-col gap-2"
	>
		<SegmentedControl.Label class="font-normal"
			><h2 class="text-3xl italic">On This Week...</h2>
		</SegmentedControl.Label>
		<btn class="btn w-fit preset-filled-surface-500">{monthStrings[dates[0].month - 1]}</btn>
		<SegmentedControl.Control class="mb-10 flex w-full flex-row justify-between border p-1">
			<SegmentedControl.Indicator class="text-primary-contrast-500 transition-all duration-0" />
			{#each dates as date, i (i)}
				<SegmentedControl.Item
					value={date.day.toString()}
					class="{anyScreeningOnThisDate(screenings, date)
						? 'opacity-100'
						: 'font-light opacity-35 dark:opacity-65'}
                        data-[state=checked]:font-normal data-[state=checked]:text-primary-contrast-500
                        {Temporal.PlainDate.compare(date, today) == 0 ? 'underline' : ''}
                        "
				>
					<SegmentedControl.ItemText>{date.day.toString()}</SegmentedControl.ItemText>
					<SegmentedControl.ItemHiddenInput />
				</SegmentedControl.Item>
			{/each}
		</SegmentedControl.Control>
	</SegmentedControl>

	<div class="w-full max-w-md">
        <!-- {#each } -->
    </div>
</div>
