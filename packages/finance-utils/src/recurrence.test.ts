import { addMonths, computeNextDueDate, daysUntilDue } from './recurrence';

// Use Date constructor (year, month, day) to avoid UTC vs local-time parse ambiguity.
// new Date('YYYY-MM-DD') is interpreted as UTC midnight; Date(y, m, d) uses local time.

describe('addMonths', () => {
  it('adds months normally', () => {
    const result = addMonths(new Date(2026, 0, 15), 1);
    expect(result.getMonth()).toBe(1); // February
    expect(result.getDate()).toBe(15);
  });

  it('handles Jan 31 + 1 month = Feb 28 (2026)', () => {
    const result = addMonths(new Date(2026, 0, 31), 1);
    expect(result.getMonth()).toBe(1); // February
    expect(result.getDate()).toBe(28);
  });

  it('handles month-end edge case for multiple months', () => {
    const result = addMonths(new Date(2026, 0, 31), 3); // April 30
    expect(result.getMonth()).toBe(3); // April
    expect(result.getDate()).toBe(30);
  });
});

describe('computeNextDueDate', () => {
  it('daily adds one day', () => {
    const base = new Date(2026, 5, 15); // June 15
    const next = computeNextDueDate(base, 'daily');
    expect(next.getDate()).toBe(16);
  });

  it('weekly adds 7 days', () => {
    const base = new Date(2026, 5, 15); // June 15
    const next = computeNextDueDate(base, 'weekly');
    expect(next.getDate()).toBe(22);
  });

  it('monthly respects month-end', () => {
    const base = new Date(2026, 0, 31); // Jan 31
    const next = computeNextDueDate(base, 'monthly');
    expect(next.getMonth()).toBe(1);
    expect(next.getDate()).toBe(28);
  });

  it('yearly adds 12 months', () => {
    const base = new Date(2026, 5, 15); // June 15
    const next = computeNextDueDate(base, 'yearly');
    expect(next.getFullYear()).toBe(2027);
    expect(next.getMonth()).toBe(5);
  });
});

describe('daysUntilDue', () => {
  it('returns positive number for future dates', () => {
    const future = new Date();
    future.setDate(future.getDate() + 5);
    expect(daysUntilDue(future)).toBeGreaterThan(0);
  });
});
