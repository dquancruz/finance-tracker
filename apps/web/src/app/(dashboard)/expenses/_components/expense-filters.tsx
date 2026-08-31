'use client';

import type { ExpenseType } from '@finance-tracker/shared';
import type { ExpenseFilters } from '@/lib/expense-query';
import { CategorySelect } from './category-select';

interface ExpenseFiltersBarProps {
  filters: ExpenseFilters;
  onChange: (filters: ExpenseFilters) => void;
}

const TYPE_OPTIONS: Array<{ value: ExpenseType | ''; label: string }> = [
  { value: '', label: 'All types' },
  { value: 'simple', label: 'Simple' },
  { value: 'recurring', label: 'Recurring' },
  { value: 'installment', label: 'Installment' },
];

export function ExpenseFiltersBar({
  filters,
  onChange,
}: ExpenseFiltersBarProps) {
  function update(partial: Partial<ExpenseFilters>) {
    onChange({ ...filters, ...partial, page: 1 });
  }

  return (
    <div
      className="flex flex-wrap items-end gap-3 rounded-xl border border-zinc-200 bg-surface p-4 shadow-sm dark:border-zinc-800"
      aria-label="Filter expenses"
    >
      <div>
        <label htmlFor="filter-type" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
          Type
        </label>
        <select
          id="filter-type"
          value={filters.type ?? ''}
          onChange={(e) =>
            update({ type: e.target.value as ExpenseType | '' })
          }
          className="mt-1 rounded-lg border border-zinc-300 px-2 py-1.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-zinc-700"
        >
          {TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="filter-category"
          className="block text-xs font-medium text-zinc-700 dark:text-zinc-300"
        >
          Category
        </label>
        <CategorySelect
          id="filter-category"
          value={filters.categoryId ?? ''}
          onChange={(categoryId) =>
            update({ categoryId: categoryId || undefined })
          }
          allowEmpty
          emptyLabel="All categories"
          className="min-w-44"
        />
      </div>

      <div>
        <label htmlFor="filter-from" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
          From
        </label>
        <input
          id="filter-from"
          type="date"
          value={filters.dateFrom ?? ''}
          onChange={(e) => update({ dateFrom: e.target.value || undefined })}
          className="mt-1 rounded-lg border border-zinc-300 px-2 py-1.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-zinc-700"
        />
      </div>

      <div>
        <label htmlFor="filter-to" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
          To
        </label>
        <input
          id="filter-to"
          type="date"
          value={filters.dateTo ?? ''}
          onChange={(e) => update({ dateTo: e.target.value || undefined })}
          className="mt-1 rounded-lg border border-zinc-300 px-2 py-1.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-zinc-700"
        />
      </div>

      <div>
        <label htmlFor="filter-sort" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
          Sort by
        </label>
        <select
          id="filter-sort"
          value={filters.sortBy ?? 'date'}
          onChange={(e) =>
            update({ sortBy: e.target.value as ExpenseFilters['sortBy'] })
          }
          className="mt-1 rounded-lg border border-zinc-300 px-2 py-1.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-zinc-700"
        >
          <option value="date">Date</option>
          <option value="amount">Amount</option>
          <option value="createdAt">Created</option>
        </select>
      </div>

      <div>
        <label htmlFor="filter-order" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
          Order
        </label>
        <select
          id="filter-order"
          value={filters.sortOrder ?? 'desc'}
          onChange={(e) =>
            update({ sortOrder: e.target.value as ExpenseFilters['sortOrder'] })
          }
          className="mt-1 rounded-lg border border-zinc-300 px-2 py-1.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-zinc-700"
        >
          <option value="desc">Newest first</option>
          <option value="asc">Oldest first</option>
        </select>
      </div>

      <button
        type="button"
        onClick={() => onChange({ page: 1, limit: filters.limit })}
        className="rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:text-zinc-400 dark:hover:bg-zinc-800"
      >
        Clear filters
      </button>
    </div>
  );
}
