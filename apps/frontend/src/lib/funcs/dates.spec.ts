import { describe, it, expect } from 'vitest';
import { Temporal } from '@js-temporal/polyfill';
import { getCalendarHeaderLabel, getYearOfWeeks, getWeekDateRange } from './dates';
import { getRemainingTickets, isScreeningSoldOut } from '$lib/pocketbase/db';
import type { Screening } from '$lib/types/database';

describe('Date & Calendar Functions', () => {
	it('calculates dynamic calendar header labels as weeks advance', () => {
		const currentWeekStart = Temporal.PlainDate.from('2026-09-07'); // Monday

		// Week 0: This week
		expect(getCalendarHeaderLabel(currentWeekStart, currentWeekStart)).toBe('On This Week...');

		// Week 1: Next week
		const week1 = currentWeekStart.add({ days: 7 });
		expect(getCalendarHeaderLabel(week1, currentWeekStart)).toBe('On Next Week...');

		// Week 2: In 2 weeks
		const week2 = currentWeekStart.add({ days: 14 });
		expect(getCalendarHeaderLabel(week2, currentWeekStart)).toBe('On in 2 Weeks...');

		// In next month (October 2026)
		const nextMonthWeek = Temporal.PlainDate.from('2026-10-05');
		expect(getCalendarHeaderLabel(nextMonthWeek, currentWeekStart)).toBe('On Next Month...');

		// In two months (November 2026)
		const twoMonthsWeek = Temporal.PlainDate.from('2026-11-02');
		expect(getCalendarHeaderLabel(twoMonthsWeek, currentWeekStart)).toBe('On in 2 Months...');

		// In 6 months (March 2027)
		const sixMonthsWeek = Temporal.PlainDate.from('2027-03-01');
		expect(getCalendarHeaderLabel(sixMonthsWeek, currentWeekStart)).toBe('On in 6 Months...');

		// At 1 year (September 2027)
		const oneYearWeek = Temporal.PlainDate.from('2027-09-06');
		expect(getCalendarHeaderLabel(oneYearWeek, currentWeekStart)).toBe('On in 1 Year...');
	});

	it('generates 52 weeks spanning a full year', () => {
		const baseDate = Temporal.PlainDate.from('2026-09-03');
		const weeks = getYearOfWeeks(baseDate);

		expect(weeks).toHaveLength(52);
		expect(weeks[0].label).toBe('On This Week...');
		expect(weeks[0].dates).toHaveLength(7);
		expect(weeks[1].label).toBe('On Next Week...');
		expect(weeks[weeks.length - 1].label).toBe('On in 1 Year...');
	});

	it('getWeekDateRange correctly returns Monday to Sunday for any date', () => {
		const wednesday = Temporal.PlainDate.from('2026-09-02');
		const { start, end } = getWeekDateRange(wednesday);

		expect(start.toString()).toBe('2026-08-31'); // Monday
		expect(end.toString()).toBe('2026-09-06'); // Sunday
	});
});

describe('Ticket Management Logic', () => {
	it('calculates remaining tickets correctly', () => {
		const screening: Screening = {
			id: 'test-1',
			created: '',
			updated: '',
			film: 'film-1',
			showing_date: '2026-09-10T19:00:00Z',
			showing_time: '2026-09-10T19:00:00Z',
			total_tickets: 50,
			tickets_sold: 20
		};

		expect(getRemainingTickets(screening)).toBe(30);
		expect(isScreeningSoldOut(screening)).toBe(false);
	});

	it('detects sold-out screenings', () => {
		const screening: Screening = {
			id: 'test-2',
			created: '',
			updated: '',
			film: 'film-1',
			showing_date: '2026-09-10T19:00:00Z',
			showing_time: '2026-09-10T19:00:00Z',
			total_tickets: 50,
			tickets_sold: 50
		};

		expect(getRemainingTickets(screening)).toBe(0);
		expect(isScreeningSoldOut(screening)).toBe(true);
	});

	it('respects tickets_available attribute when explicitly provided', () => {
		const screening: Screening = {
			id: 'test-3',
			created: '',
			updated: '',
			film: 'film-1',
			showing_date: '2026-09-10T19:00:00Z',
			showing_time: '2026-09-10T19:00:00Z',
			total_tickets: 100,
			tickets_sold: 95,
			tickets_available: 5
		};

		expect(getRemainingTickets(screening)).toBe(5);
		expect(isScreeningSoldOut(screening)).toBe(false);
	});
});
