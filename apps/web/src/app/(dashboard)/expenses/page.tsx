'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useCategories } from '@/lib/hooks/use-categories';
import { useExpenses } from '@/lib/hooks/use-expenses';
import type { ExpenseFilters } from '@/lib/expense-query';
import { ExpenseFiltersBar } from './_components/expense-filters';
import { ExpenseTable } from './_components/expense-table';

const DEFAULT_FILTERS: ExpenseFilters = {
  sortBy: 'date',
  sortOrder: 'desc',
  page: 1,
  limit: 20,
};

export default function ExpensesPage() {
  const [filters, setFilters] = useState<ExpenseFilters>(DEFAULT_FILTERS);
  const { data: categories } = useCategories();
  const { data, isLoading, isError } = useExpenses(filters);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">Expenses</h1>
          <p className="mt-2 text-zinc-500">
            Track simple, recurring, and installment expenses.
          </p>
        </div>
        <Link
          href="/expenses/new"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Add expense
        </Link>
      </div>

      <div className="mt-6">
        <ExpenseFiltersBar
          filters={filters}
          categories={categories ?? []}
          onChange={setFilters}
        />
      </div>

      {isLoading && (
        <p className="mt-8 text-sm text-zinc-400">Loading expenses…</p>
      )}
      {isError && (
        <p role="alert" className="mt-8 text-sm text-red-600">
          Could not load expenses. Please try again.
        </p>
      )}

      {data && (
        <>
          <ExpenseTable expenses={data.data} categories={categories ?? []} />

          <div className="mt-4 flex items-center justify-between text-sm text-zinc-500">
            <p>
              Page {data.page} of {data.totalPages} — {data.total} total
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() =>
                  setFilters((f) => ({ ...f, page: Math.max(1, (f.page ?? 1) - 1) }))
                }
                disabled={data.page <= 1}
                className="rounded-lg border border-zinc-300 px-3 py-1.5 font-medium disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() =>
                  setFilters((f) => ({
                    ...f,
                    page: Math.min(data.totalPages, (f.page ?? 1) + 1),
                  }))
                }
                disabled={data.page >= data.totalPages}
                className="rounded-lg border border-zinc-300 px-3 py-1.5 font-medium disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
