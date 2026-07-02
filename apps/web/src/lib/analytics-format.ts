/** Formats a month-over-month (or any) percentage change with an explicit sign. */
export function formatPercentageChange(change: number): string {
  const sign = change > 0 ? '+' : '';
  return `${sign}${change.toFixed(1)}%`;
}

export type BudgetTone = 'ok' | 'warning' | 'over';

/** Categorizes a budget usage percentage into a display tone. */
export function budgetStatusTone(percentage: number): BudgetTone {
  if (percentage >= 100) return 'over';
  if (percentage >= 80) return 'warning';
  return 'ok';
}

const BUDGET_TONE_CLASSES: Record<BudgetTone, string> = {
  ok: 'bg-emerald-500',
  warning: 'bg-amber-500',
  over: 'bg-red-500',
};

/** Tailwind class for the progress-bar fill matching a budget tone. */
export function budgetToneBarClass(tone: BudgetTone): string {
  return BUDGET_TONE_CLASSES[tone];
}

const BUDGET_TONE_TEXT_CLASSES: Record<BudgetTone, string> = {
  ok: 'text-emerald-600',
  warning: 'text-amber-600',
  over: 'text-red-600',
};

/** Tailwind text-color class matching a budget tone. */
export function budgetToneTextClass(tone: BudgetTone): string {
  return BUDGET_TONE_TEXT_CLASSES[tone];
}
