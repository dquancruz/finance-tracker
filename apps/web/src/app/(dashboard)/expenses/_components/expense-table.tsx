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
      return 'bg-zinc-100 text-zinc-700';
    case 'recurring':
      return 'bg-indigo-100 text-indigo-700';
    case 'installment':
      return 'bg-amber-100 text-amber-700';
  }
}

export function ExpenseTable({ expenses, categories }: ExpenseTableProps) {
  const deleteExpense = useDeleteExpense();
  const payRecurring = usePayRecurringOccurrence();

  if (expenses.length === 0) {
    return (
      <p className="mt-6 text-sm text-zinc-500">
        No expenses match the current filters.
      </p>
    );
  }

  return (
    <div className="mt-6 overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-zinc-200 text-sm">
        <thead>
          <tr className="text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
            <th scope="col" className="px-4 py-3">Description</th>
            <th scope="col" className="px-4 py-3">Category</th>
            <th scope="col" className="px-4 py-3">Type</th>
            <th scope="col" className="px-4 py-3">Date</th>
            <th scope="col" className="px-4 py-3 text-right">Amount</th>
            <th scope="col" className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
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
                <td className="px-4 py-3 text-zinc-900">{description}</td>
                <td className="px-4 py-3 text-zinc-500">
                  {categoryLabel(categories, expense.categoryId)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${typeBadgeClasses(expense.type)}`}
                  >
                    {expense.type}
                  </span>
                </td>
                <td className="px-4 py-3 text-zinc-500">{formatDate(date)}</td>
                <td className="px-4 py-3 text-right font-medium text-zinc-900">
                  {formatCurrency(amount, expense.currency)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    {expense.type === 'recurring' && expense.isActive && (
                      <button
                        type="button"
                        onClick={() => void payRecurring.mutateAsync(expense._id)}
                        disabled={payRecurring.isPending}
                        className="rounded-md px-2 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-50"
                      >
                        Mark paid
                      </button>
                    )}
                    <Link
                      href={`/expenses/${expense._id}/edit`}
                      className="rounded-md px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50"
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => void deleteExpense.mutateAsync(expense._id)}
                      disabled={deleteExpense.isPending}
                      className="rounded-md px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
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
