import { Temporal } from '@js-temporal/polyfill';

// Maybe internationalise later
export const monthStrings = [
	'January',
	'February',
	'March',
	'April',
	'May',
	'June',
	'July',
	'August',
	'September',
	'October',
	'November',
	'December'
];

export const monthCodeStrings = [
	'Jan',
	'Feb',
	'Mar',
	'Apr',
	'May',
	'June',
	'July',
	'Aug',
	'Sept',
	'Oct',
	'Nov',
	'Dec'
];

/**
 * Returns monday and sunday of the week for a given date as Temporal.PlainDate.
 */
export function getWeekDateRange(
	date?: Temporal.PlainDate,
	timeZone = Temporal.Now.timeZoneId()
): {
	start: Temporal.PlainDate;
	end: Temporal.PlainDate;
} {
	const baseDate = date ?? Temporal.Now.plainDateISO(timeZone);
	const monday = baseDate.subtract({ days: baseDate.dayOfWeek - 1 });
	const sunday = monday.add({ days: 6 });

	return {
		start: monday,
		end: sunday
	};
}

export function getArrayOfDates(
	start: Temporal.PlainDate,
	end: Temporal.PlainDate
): Temporal.PlainDate[] {
	const dates: Temporal.PlainDate[] = [];

	for (
		let date = start;
		Temporal.PlainDate.compare(date, end) <= 0;
		date = date.add({ days: 1 })
	) {
		dates.push(date);
	}

	return dates;
}

export interface WeekInfo {
	index: number;
	start: Temporal.PlainDate;
	end: Temporal.PlainDate;
	dates: Temporal.PlainDate[];
	label: string;
}

/**
 * Calculates human-readable dynamic header label based on week offset and month difference:
 * - Week 0: "On This Week..."
 * - Week 1: "On Next Week..."
 * - Week 2: "On in 2 Weeks..."
 * - Next month: "On Next Month..."
 * - 2 months ahead: "On in 2 Months..."
 * - Up to 1 year: "On in 1 Year..."
 */
export function getCalendarHeaderLabel(
	targetWeekStart: Temporal.PlainDate,
	currentWeekStart: Temporal.PlainDate
): string {
	const daysDiff = targetWeekStart.since(currentWeekStart, { largestUnit: 'days' }).days;
	const weekOffset = Math.round(daysDiff / 7);

	if (weekOffset <= 0) return 'On This Week...';
	if (weekOffset === 1) return 'On Next Week...';
	if (weekOffset === 2) return 'On in 2 Weeks...';

	const monthDiff =
		(targetWeekStart.year - currentWeekStart.year) * 12 +
		(targetWeekStart.month - currentWeekStart.month);

	if (monthDiff <= 0) {
		return `On in ${weekOffset} Weeks...`;
	} else if (monthDiff === 1) {
		return 'On Next Month...';
	} else if (monthDiff < 12) {
		return `On in ${monthDiff} Months...`;
	} else {
		return 'On in 1 Year...';
	}
}

/**
 * Generates 52 weeks (1 year) starting from the current week.
 */
export function getYearOfWeeks(
	startDate?: Temporal.PlainDate,
	timeZone = Temporal.Now.timeZoneId()
): WeekInfo[] {
	const today = startDate ?? Temporal.Now.plainDateISO(timeZone);
	const currentWeek = getWeekDateRange(today, timeZone);
	const weeks: WeekInfo[] = [];

	let currentMonday = currentWeek.start;
	for (let i = 0; i < 52; i++) {
		const sunday = currentMonday.add({ days: 6 });
		const dates = getArrayOfDates(currentMonday, sunday);
		const label = getCalendarHeaderLabel(currentMonday, currentWeek.start);
		weeks.push({
			index: i,
			start: currentMonday,
			end: sunday,
			dates,
			label
		});
		currentMonday = currentMonday.add({ days: 7 });
	}

	return weeks;
}
