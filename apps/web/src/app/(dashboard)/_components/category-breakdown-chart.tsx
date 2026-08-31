'use client';

import type { ICategorySpend } from '@finance-tracker/shared';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { formatCurrency } from '@/lib/format';

interface CategoryBreakdownChartProps {
  breakdown: ICategorySpend[];
  currency: string;
}

export function CategoryBreakdownChart({
  breakdown,
  currency,
}: CategoryBreakdownChartProps) {
  return (
    <article
      aria-label="Spending by category"
      className="rounded-xl border border-zinc-200 bg-surface p-6 shadow-sm dark:border-zinc-800"
    >
      <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Category breakdown</p>
      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">This month&apos;s spending by category</p>

      {breakdown.length === 0 ? (
        <p className="mt-8 text-sm text-zinc-500 dark:text-zinc-400">
          No expenses recorded this month yet.
        </p>
      ) : (
        <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="h-56 w-full sm:w-56 sm:shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={breakdown}
                  dataKey="amount"
                  nameKey="categoryName"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                >
                  {breakdown.map((entry) => (
                    <Cell key={entry.categoryId} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => formatCurrency(value, currency)}
                  contentStyle={{
                    background: 'var(--surface)',
                    borderColor: 'var(--border)',
                    borderRadius: 8,
                    fontSize: 13,
                  }}
                  labelStyle={{ color: 'var(--foreground)' }}
                  itemStyle={{ color: 'var(--foreground)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <ul role="list" className="min-w-0 flex-1 space-y-2">
            {breakdown.map((category) => (
              <li
                key={category.categoryId}
                className="flex items-center justify-between gap-2 text-sm"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="truncate text-zinc-700 dark:text-zinc-300">
                    {category.categoryName}
                  </span>
                </span>
                <span className="shrink-0 tabular-nums text-zinc-500 dark:text-zinc-400">
                  {formatCurrency(category.amount, currency)} ({category.percentage.toFixed(0)}%)
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}
