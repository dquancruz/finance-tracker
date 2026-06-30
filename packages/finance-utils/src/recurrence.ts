import type { RecurringFrequency } from '@finance-tracker/shared';

export function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  const originalDay = d.getDate();
  d.setMonth(d.getMonth() + months);
  // Handle month-end overflow: Jan 31 + 1 month → Feb 28, not Mar 3
  if (d.getDate() !== originalDay) {
    d.setDate(0); // last day of the previous month
  }
  return d;
}

export function computeNextDueDate(current: Date, frequency: RecurringFrequency): Date {
  const d = new Date(current);
  switch (frequency) {
    case 'daily':
      d.setDate(d.getDate() + 1);
      return d;
    case 'weekly':
      d.setDate(d.getDate() + 7);
      return d;
    case 'monthly':
      return addMonths(d, 1);
    case 'yearly':
      return addMonths(d, 12);
  }
}

export function isDueSoon(nextDueDate: Date, withinDays = 3): boolean {
  const now = new Date();
  const diffMs = nextDueDate.getTime() - now.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays >= 0 && diffDays <= withinDays;
}

export function daysUntilDue(nextDueDate: Date): number {
  const now = new Date();
  const diffMs = nextDueDate.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}
