'use client';

import type { ICategory, IExpense } from '@finance-tracker/shared';
import Link from 'next/link';
import { formatCurrency, formatDate } from '@/lib/format';
import { useDeleteExpense, usePayRecurringOccurrence } from '@/lib/hooks/use-expenses';

interface ExpenseTableProps {
  expenses: IExpense[];
  categories: ICategory[];
}

function categoryLabel(categories: ICategory[], categoryId: string): string {
  const category = categories.find((c) => c._id === categoryId);
  return category ? `${category.icon} ${category.name}` : 'Uncategorized';
}

function typeBadgeClasses(type: IExpense['type']): string {
  switch (type) {
    case 'simple':
      return 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300';
    case 'recurring':
      return 'bg-teal-100 text-teal-700 dark:bg-teal-500/15 dark:text-teal-300';
    case 'installment':
      return 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400';
  }
}

export function ExpenseTable({ expenses, categories }: ExpenseTableProps) {
  const deleteExpense = useDeleteExpense();
  const payRecurring = usePayRecurringOccurrence();

  if (expenses.length === 0) {
    return (
      <p className="mt-6 text-sm text-zinc-500 dark:text-zinc-400">
        No expenses match the current filters.
      </p>
    );
  }

  return (
    <div className="mt-6 overflow-x-auto rounded-xl border border-zinc-200 bg-surface shadow-sm dark:border-zinc-800">
      <table className="min-w-full divide-y divide-zinc-200 text-sm dark:divide-zinc-800">
        <thead>
          <tr className="text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            <th scope="col" className="px-4 py-3">Description</th>
            <th scope="col" className="px-4 py-3">Category</th>
            <th scope="col" className="px-4 py-3">Type</th>
            <th scope="col" className="px-4 py-3">Date</th>
            <th scope="col" className="px-4 py-3 text-right">Amount</th>
            <th scope="col" className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {expenses.map((expense) => {
            const description =
              expense.type === 'simple'
                ? (expense.notes ?? 'Expense')
                : expense.description;
            const date =
              expense.type === 'recurring'
                ? expense.nextDueDate
                : expense.type === 'installment'
                  ? expense.startDate
                  : expense.date;
            const amount =
              expense.type === 'installment'
                ? expense.totalAmount
                : expense.amount;

            return (
              <tr key={expense._id}>
                <td className="px-4 py-3 text-zinc-900 dark:text-zinc-50">{description}</td>
                <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">
                  {categoryLabel(categories, expense.categoryId)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${typeBadgeClasses(expense.type)}`}
                  >
                    {expense.type}
                  </span>
                </td>
                <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">{formatDate(date)}</td>
                <td className="px-4 py-3 text-right font-medium tabular-nums text-zinc-900 dark:text-zinc-50">
                  {formatCurrency(amount, expense.currency)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    {expense.type === 'recurring' && expense.isActive && (
                      <button
                        type="button"
                        onClick={() => void payRecurring.mutateAsync(expense._id)}
                        disabled={payRecurring.isPending}
                        className="rounded-md px-2 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 disabled:opacity-50 dark:text-emerald-400 dark:hover:bg-emerald-500/10"
                      >
                        Mark paid
                      </button>
                    )}
                    <Link
                      href={`/expenses/${expense._id}/edit`}
                      className="rounded-md px-2 py-1 text-xs font-medium text-teal-600 hover:bg-teal-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:text-teal-400 dark:hover:bg-teal-500/10"
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => void deleteExpense.mutateAsync(expense._id)}
                      disabled={deleteExpense.isPending}
                      className="rounded-md px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-500/10"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
