'use client';

import type { ICategory, IInstallmentExpense } from '@finance-tracker/shared';
import { useState } from 'react';
import { formatCurrency, formatDate } from '@/lib/format';
import { useExchangeRates } from '@/lib/hooks/use-exchange-rates';
import { usePreferredCurrency } from '@/lib/hooks/use-preferred-currency';
import { summarizeInstallment } from '@/lib/installment-summary';
import { InstallmentSchedule } from '../../expenses/_components/installment-schedule';

interface InstallmentPlanCardProps {
  expense: IInstallmentExpense;
  category?: ICategory;
}

export function InstallmentPlanCard({
  expense,
  category,
}: InstallmentPlanCardProps) {
  const [expanded, setExpanded] = useState(false);
  const { currency: displayCurrency } = usePreferredCurrency();
  const { convert } = useExchangeRates();
  const summary = summarizeInstallment(expense);
  const total = expense.paymentSchedule.length;
  const showConverted = expense.currency !== displayCurrency;

  return (
    <li className="rounded-xl border border-zinc-200 bg-surface p-4 shadow-sm dark:border-zinc-800">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span aria-hidden="true" className="text-base">
              {category?.icon ?? '📦'}
            </span>
            <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">
              {expense.description}
            </p>
            {summary.isComplete && (
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
                Paid off
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
            {category?.name ?? 'Uncategorized'} · Started{' '}
            {formatDate(expense.startDate)}
          </p>
        </div>

        <div className="text-right">
          <p className="text-sm font-medium tabular-nums text-zinc-900 dark:text-zinc-50">
            {formatCurrency(summary.remainingBalance, expense.currency)}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            remaining of {formatCurrency(expense.totalAmount, expense.currency)}
            {showConverted && (() => {
              const converted = convert(
                summary.remainingBalance,
                expense.currency,
                displayCurrency,
              );
              if (converted === null) return null;
              return (
                <>
                  {' '}
                  · {formatCurrency(converted, displayCurrency)} in {displayCurrency}
                </>
              );
            })()}
          </p>
        </div>
      </div>

      <div className="mt-3">
        <div
          role="progressbar"
          aria-valuenow={summary.progressPercentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${expense.description} payoff progress`}
          className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800"
        >
          <div
            className="h-full rounded-full bg-teal-600 transition-[width]"
            style={{ width: `${summary.progressPercentage}%` }}
          />
        </div>
        <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <span className="tabular-nums">
            {summary.paidCount} of {total} installments paid
          </span>
          {summary.nextDueDate && (
            <span className="tabular-nums">
              Next due {formatDate(summary.nextDueDate)}
            </span>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="mt-3 rounded-md px-2 py-1 text-xs font-medium text-teal-600 transition-colors hover:bg-teal-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:text-teal-400 dark:hover:bg-teal-500/10"
      >
        {expanded ? 'Hide schedule' : 'View schedule'}
      </button>

      {expanded && (
        <InstallmentSchedule
          expenseId={expense._id}
          schedule={expense.paymentSchedule}
          currency={expense.currency}
        />
      )}
    </li>
  );
}
