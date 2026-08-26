import { Temporal } from '@js-temporal/polyfill';


/**
 * Returns monday and sunday of this week as Temporal.plainDate
 */
export function getWeekDateRange(
	date: Temporal.PlainDate,
	timeZone = Temporal.Now.timeZoneId()
): {
	start: Temporal.PlainDate;
	end: Temporal.PlainDate;
} {
	const today = Temporal.Now.plainDateISO(timeZone);
	const monday = today.subtract({ days: today.dayOfWeek - 1 });
	const sunday = monday.add({ days: 6 });

	return {
		start: monday,
		end: sunday
	};
}

export function getArrayOfDates(start: Temporal.PlainDate, end: Temporal.PlainDate): Temporal.PlainDate[] {
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
