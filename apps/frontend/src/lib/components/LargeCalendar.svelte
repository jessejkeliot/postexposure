<script lang="ts">
  import NoScreeningsBox from './NoScreeningsBox.svelte';

  import ScreeningsIndicatorDot from './ScreeningsIndicatorDot.svelte';

	import { SvelteMap } from 'svelte/reactivity';
	import { SegmentedControl } from '@skeletonlabs/skeleton-svelte';
	import { Temporal } from '@js-temporal/polyfill';
	import type { Screening } from '$lib/types/database';
	import { monthStrings } from '$lib/funcs/dates';
	import ScreeningThumbnail from '$lib/components/ScreeningThumbnail.svelte';

	interface Props {
		screenings: Screening[];
	}

	let { screenings }: Props = $props();

	const tz = Temporal.Now.timeZoneId();
	const today = Temporal.Now.plainDateISO(tz);

	let currentYear = $state(today.year);
	let currentMonth = $state(today.month);

	function getScreeningPlainDate(screening: Screening): Temporal.PlainDate {
		return Temporal.Instant.from(screening.showing_date).toZonedDateTimeISO(tz).toPlainDate();
	}

	// Group screenings by ISO date string (YYYY-MM-DD)
	const screeningsByDate = $derived.by(() => {
		const map = new SvelteMap<string, Screening[]>();
		for (const screening of screenings) {
			const dateStr = getScreeningPlainDate(screening).toString();
			if (!map.has(dateStr)) {
				map.set(dateStr, []);
			}
			map.get(dateStr)!.push(screening);
		}
		return map;
	});

	// Find the earliest screening date or default to today
	const initialSelectedDate = $derived.by(() => {
		for (const screening of screenings) {
			const date = getScreeningPlainDate(screening);
			if (Temporal.PlainDate.compare(date, today) >= 0) {
				return date.toString();
			}
		}
		return today.toString();
	});

	let selectedDateStr = $state<string>(today.toString());

	// Calendar grid calculation for currentYear and currentMonth
	const monthFirstDay = $derived(
		Temporal.PlainDate.from({ year: currentYear, month: currentMonth, day: 1 })
	);
	const daysInMonth = $derived(monthFirstDay.daysInMonth);
	// ISO: Monday is 1, Sunday is 7
	const startDayOfWeek = $derived(monthFirstDay.dayOfWeek);

	// Leading padding days from previous month
	const paddingDays = $derived.by(() => {
		const days: { day: number; dateStr: string; isCurrentMonth: boolean }[] = [];
		const prevMonthLastDay = monthFirstDay.subtract({ days: 1 });
		const count = startDayOfWeek - 1;
		for (let i = count - 1; i >= 0; i--) {
			const d = prevMonthLastDay.subtract({ days: i });
			days.push({
				day: d.day,
				dateStr: d.toString(),
				isCurrentMonth: false
			});
		}
		return days;
	});

	// Days of current month
	const currentMonthDays = $derived.by(() => {
		const days: { day: number; dateStr: string; isCurrentMonth: boolean }[] = [];
		for (let d = 1; d <= daysInMonth; d++) {
			const date = Temporal.PlainDate.from({
				year: currentYear,
				month: currentMonth,
				day: d
			});
			days.push({
				day: d,
				dateStr: date.toString(),
				isCurrentMonth: true
			});
		}
		return days;
	});

	// Next 4 months for quick Skeleton SegmentedControl switching
	const monthOptions = $derived.by(() => {
		const options: { value: string; label: string }[] = [];
		let d = today.with({ day: 1 });
		for (let i = 0; i < 4; i++) {
			options.push({
				value: `${d.year}-${d.month}`,
				label: `${monthStrings[d.month - 1].slice(0, 3)} ${d.year}`
			});
			d = d.add({ months: 1 });
		}
		return options;
	});

	const activeMonthKey = $derived(`${currentYear}-${currentMonth}`);

	function handleMonthSelect(key: string | null) {
		if (!key) return;
		const [y, m] = key.split('-').map(Number);
		currentYear = y;
		currentMonth = m;
	}

	function prevMonth() {
		const prev = monthFirstDay.subtract({ months: 1 });
		currentYear = prev.year;
		currentMonth = prev.month;
	}

	function nextMonth() {
		const next = monthFirstDay.add({ months: 1 });
		currentYear = next.year;
		currentMonth = next.month;
	}

	function goToToday() {
		currentYear = today.year;
		currentMonth = today.month;
		selectedDateStr = today.toString();
	}

	const selectedDayScreenings = $derived(screeningsByDate.get(selectedDateStr) ?? []);

	const selectedDateFormatted = $derived.by(() => {
		try {
			const plain = Temporal.PlainDate.from(selectedDateStr);
			return new Intl.DateTimeFormat('en-US', {
				weekday: 'long',
				month: 'long',
				day: 'numeric',
				year: 'numeric'
			}).format(new Date(plain.year, plain.month - 1, plain.day));
		} catch {
			return selectedDateStr;
		}
	});
</script>

<div class="flex flex-col lg:flex-row gap-4 mb-0">
	<div class="flex-1">
		<!-- Top Controls: Month Selector with Skeleton SegmentedControl and Prev/Next -->
		<div
			class="flex flex-col items-center justify-between gap-4 border-b border-surface-200-800 pb-4 sm:flex-row"
		>
			<!-- Month Title & Nav Buttons -->
			<div class="flex items-center gap-3">
				<button
					type="button"
					onclick={prevMonth}
					class="btn btn-icon border border-surface-300-700 p-1 hover:bg-surface-200-800"
					aria-label="Previous Month"
					title="Previous Month"
				>
					<span class="icon-[boxicons--chevron-left] text-lg"></span>
				</button>

				<h2 class="min-w-24 text-center text-2xl font-bold tracking-wide uppercase sm:text-left">
					{monthStrings[currentMonth - 1]}
					{currentYear}
				</h2>

				<button
					type="button"
					onclick={nextMonth}
					class="btn btn-icon border border-surface-300-700 p-1 hover:bg-surface-200-800"
					aria-label="Next Month"
					title="Next Month"
				>
					<span class="icon-[boxicons--chevron-right] text-lg"></span>
				</button>

				<button
					type="button"
					onclick={goToToday}
					class="btn border border-surface-300-700 px-2 py-1 text-xs font-semibold tracking-wider uppercase hover:bg-surface-200-800"
				>
					Today
				</button>
			</div>

			<!-- Skeleton SegmentedControl for Quick Month Jumping -->
			<div class="w-full sm:w-auto">
				<SegmentedControl
					value={activeMonthKey}
					onValueChange={(details) => handleMonthSelect(details.value)}
					class="w-full sm:w-auto"
				>
					<SegmentedControl.Control class="flex flex-row border p-0.5">
						<SegmentedControl.Indicator class="bg-surface-950-50 text-surface-contrast-100" />
						{#each monthOptions as opt (opt.value)}
							<SegmentedControl.Item value={opt.value} class="px-2 py-1 text-xs">
								<SegmentedControl.ItemText class="text-xs">{opt.label}</SegmentedControl.ItemText>
								<SegmentedControl.ItemHiddenInput />
							</SegmentedControl.Item>
						{/each}
					</SegmentedControl.Control>
				</SegmentedControl>
			</div>
		</div>

		<!-- Main Calendar Grid -->
		<div
			class="overflow-hidden border border-surface-200-800 bg-surface-50 dark:bg-surface-950"
		>
			<!-- Day of Week Header -->
			<div
				class="grid grid-cols-7 border-b border-surface-200-800 bg-surface-100 py-2 text-center text-xs font-bold tracking-wider uppercase dark:bg-surface-900"
			>
				<div>Mon</div>
				<div>Tue</div>
				<div>Wed</div>
				<div>Thu</div>
				<div>Fri</div>
				<div>Sat</div>
				<div>Sun</div>
			</div>

			<!-- Days Grid -->
			<div class="grid grid-cols-7 divide-x divide-y divide-surface-200-800">
				<!-- Padding Days from Previous Month -->
				{#each paddingDays as pad (pad.dateStr)}
					<div
						class="min-h-20 bg-surface-100/50 p-1.5 opacity-30 sm:min-h-24 dark:bg-surface-900/30"
					>
						<span class="text-xs">{pad.day}</span>
					</div>
				{/each}

				<!-- Current Month Days -->
				{#each currentMonthDays as cell (cell.dateStr)}
					{@const hasScreenings = screeningsByDate.has(cell.dateStr)}
					{@const dayScreenings = screeningsByDate.get(cell.dateStr) ?? []}
					{@const isSelected = selectedDateStr === cell.dateStr}
					{@const isToday = today.toString() === cell.dateStr}

					<button
						type="button"
						onclick={() => (selectedDateStr = cell.dateStr)}
						class="relative flex min-h-20 cursor-pointer flex-col justify-between p-1.5 text-left transition-colors sm:min-h-24
						{isSelected
							? 'z-10 bg-primary-500/15 ring-2 ring-primary-500'
							: hasScreenings
								? 'hover:bg-surface-200-800'
								: 'hover:bg-surface-100 dark:hover:bg-surface-900'}
					"
					>
						<div class="flex w-full items-center justify-between">
							<span
								class="flex h-5 w-5 items-center justify-center text-xs font-bold
								{isToday
									? 'underline'
									: isSelected
										? 'text-primary-600 dark:text-primary-400'
										: ''}
							"
							>
								{cell.day}
							</span>

							<ScreeningsIndicatorDot {hasScreenings} {isSelected} size={2}/>
						</div>

						{#if hasScreenings}
							<div class="mt-1 space-y-0.5">
								{#each dayScreenings.slice(0, 2) as s (s.id)}
									<div
										class="truncate bg-surface-200 px-1 py-0.5 text-[10px] font-medium dark:bg-surface-800"
									>
										{s.expand?.film?.title ?? 'Film'}
									</div>
								{/each}
								{#if dayScreenings.length > 2}
									<div class="pl-1 text-[9px] font-semibold opacity-60">
										+{dayScreenings.length - 2} more
									</div>
								{/if}
							</div>
						{/if}
					</button>
				{/each}
			</div>
		</div>
	</div>

	<!-- Screenings List for Selected Date -->
	<section class="space-y-4 border-t border-surface-200-800 pt-4 flex-1">
		<div class="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
			<h3 class="text-xl font-bold tracking-tight">
				Screenings
			</h3>
		</div>

		{#if selectedDayScreenings.length > 0}
			<div class="grid grid-cols-1 gap-6 xl:grid-cols-2">
				{#each selectedDayScreenings as screening (screening.id)}
					<ScreeningThumbnail {screening} showDate={false}/>
				{/each}
			</div>
		{:else}
			<NoScreeningsBox></NoScreeningsBox>
		{/if}
	</section>
</div>
