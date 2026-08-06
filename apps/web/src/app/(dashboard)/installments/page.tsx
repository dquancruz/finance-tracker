'use client';

import { useMemo } from 'react';
import type { IInstallmentExpense } from '@finance-tracker/shared';
import { useCategories } from '@/lib/hooks/use-categories';
import { useExpenses } from '@/lib/hooks/use-expenses';
import { formatCurrency } from '@/lib/format';
import { summarizeInstallment } from '@/lib/installment-summary';
import { InstallmentPlanCard } from './_components/installment-plan-card';

const INSTALLMENT_FILTERS = {
  type: 'installment' as const,
  sortBy: 'date' as const,
  sortOrder: 'desc' as const,
  page: 1,
  limit: 100,
};

export default function InstallmentsPage() {
  const { data: categories } = useCategories();
  const { data, isLoading, isError } = useExpenses(INSTALLMENT_FILTERS);

  const plans = useMemo(
    () => (data?.data ?? []) as IInstallmentExpense[],
    [data],
  );

  const { active, completed, totalRemaining } = useMemo(() => {
    const withSummary = plans.map((expense) => ({
      expense,
      summary: summarizeInstallment(expense),
    }));
    return {
      active: withSummary.filter((p) => !p.summary.isComplete),
      completed: withSummary.filter((p) => p.summary.isComplete),
      totalRemaining: withSummary.reduce(
        (sum, p) => sum + p.summary.remainingBalance,
        0,
      ),
    };
  }, [plans]);

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        Installments
      </h1>
      <p className="mt-2 text-zinc-500 dark:text-zinc-400">
        A consolidated view of every installment plan&apos;s payment schedule
        and remaining balance.
      </p>

      {isLoading && (
        <p className="mt-8 text-sm text-zinc-500 dark:text-zinc-400">
          Loading installment plans…
        </p>
      )}
      {isError && (
        <p role="alert" className="mt-8 text-sm text-red-600 dark:text-red-400">
          Could not load installment plans. Please try again.
        </p>
      )}

      {data && plans.length === 0 && (
        <div className="mt-6 rounded-xl border border-dashed border-zinc-300 bg-surface p-10 text-center shadow-sm dark:border-zinc-700">
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
            No installment plans yet
          </p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-zinc-500 dark:text-zinc-400">
            Add an installment expense from the Expenses page to see its
            payment schedule and payoff progress here.
          </p>
        </div>
      )}

      {data && plans.length > 0 && (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-zinc-200 bg-surface p-6 shadow-sm dark:border-zinc-800">
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Active plans
              </p>
              <p className="mt-3 text-2xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
                {active.length}
              </p>
              <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                {completed.length} paid off
              </p>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-surface p-6 shadow-sm dark:border-zinc-800">
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Remaining balance
              </p>
              <p className="mt-3 text-2xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
                {formatCurrency(totalRemaining)}
              </p>
              <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                Across all installment plans
              </p>
            </div>
          </div>

          {active.length > 0 && (
            <section aria-label="Active installment plans" className="mt-8">
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                Active
              </h2>
              <ul role="list" className="mt-3 space-y-3">
                {active.map(({ expense }) => (
                  <InstallmentPlanCard
                    key={expense._id}
                    expense={expense}
                    category={categories?.find(
                      (c) => c._id === expense.categoryId,
                    )}
                  />
                ))}
              </ul>
            </section>
          )}

          {completed.length > 0 && (
            <section aria-label="Paid off installment plans" className="mt-8">
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                Paid off
              </h2>
              <ul role="list" className="mt-3 space-y-3">
                {completed.map(({ expense }) => (
                  <InstallmentPlanCard
                    key={expense._id}
                    expense={expense}
                    category={categories?.find(
                      (c) => c._id === expense.categoryId,
                    )}
                  />
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}
