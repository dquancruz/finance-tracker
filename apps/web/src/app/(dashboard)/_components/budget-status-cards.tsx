import type { IBudgetStatus } from '@finance-tracker/shared';
import { formatCurrency } from '@/lib/format';
import {
  budgetStatusTone,
  budgetToneBarClass,
  budgetToneTextClass,
} from '@/lib/analytics-format';

interface BudgetStatusCardsProps {
  budgetStatus: IBudgetStatus[];
}

export function BudgetStatusCards({ budgetStatus }: BudgetStatusCardsProps) {
  return (
    <article
      aria-label="Budget status"
      className="rounded-xl border border-zinc-200 bg-surface p-6 shadow-sm dark:border-zinc-800"
    >
      <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Budget status</p>
      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
        How you are tracking against your budget limits
      </p>

      {budgetStatus.length === 0 ? (
        <p className="mt-8 text-sm text-zinc-500 dark:text-zinc-400">
          No categories have a budget limit set yet. Configure one from the
          Categories page.
        </p>
      ) : (
        <ul role="list" className="mt-4 space-y-4">
          {budgetStatus.map((budget) => {
            const tone = budgetStatusTone(budget.percentage);
            const barWidth = Math.min(100, budget.percentage);
            return (
              <li key={budget.categoryId}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-zinc-900 dark:text-zinc-50">
                    {budget.categoryName}
                  </span>
                  <span className={`tabular-nums ${budgetToneTextClass(tone)}`}>
                    {formatCurrency(budget.spent)} /{' '}
                    {formatCurrency(budget.budgetLimit)}
                  </span>
                </div>
                <div
                  role="progressbar"
                  aria-label={`${budget.categoryName} budget usage`}
                  aria-valuenow={Math.round(budget.percentage)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800"
                >
                  <div
                    className={`h-full rounded-full ${budgetToneBarClass(tone)}`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
                <p className="mt-1 text-xs tabular-nums text-zinc-500 dark:text-zinc-400">
                  {budget.percentage.toFixed(0)}% used
                  {budget.remaining >= 0
                    ? ` — ${formatCurrency(budget.remaining)} remaining`
                    : ` — ${formatCurrency(Math.abs(budget.remaining))} over budget`}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </article>
  );
}
