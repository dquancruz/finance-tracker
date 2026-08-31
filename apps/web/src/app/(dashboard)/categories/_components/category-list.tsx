'use client';

import type { ICategory } from '@finance-tracker/shared';
import { useState } from 'react';
import { useDeleteCategory, useUpdateCategory } from '@/lib/hooks/use-categories';
import { formatCurrency } from '@/lib/format';
import { usePreferredCurrency } from '@/lib/hooks/use-preferred-currency';

interface CategoryListProps {
  categories: ICategory[];
}

export function CategoryList({ categories }: CategoryListProps) {
  const { currency } = usePreferredCurrency();
  const systemCategories = categories.filter((c) => c.isSystem);
  const customCategories = categories.filter((c) => !c.isSystem);

  return (
    <div className="mt-8 space-y-8">
      <section aria-label="Custom categories">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">My categories</h2>
        {customCategories.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            You haven&apos;t created any custom categories yet.
          </p>
        ) : (
          <ul role="list" className="mt-3 space-y-2">
            {customCategories.map((category) => (
              <CategoryRow key={category._id} category={category} currency={currency} editable />
            ))}
          </ul>
        )}
      </section>

      <section aria-label="System categories">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          System categories
        </h2>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Built-in categories available to everyone — the name, icon, and
          color can&apos;t be changed, but you can set your own budget on
          them.
        </p>
        <ul role="list" className="mt-3 space-y-2">
          {systemCategories.map((category) => (
            <CategoryRow key={category._id} category={category} currency={currency} editable={false} />
          ))}
        </ul>
      </section>
    </div>
  );
}

function CategoryRow({
  category,
  currency,
  editable,
}: {
  category: ICategory;
  currency: string;
  /** Whether name/icon/color/delete are allowed — false for system categories. */
  editable: boolean;
}) {
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  const [editing, setEditing] = useState(false);
  const [budgetLimit, setBudgetLimit] = useState(
    category.budgetLimit?.toString() ?? '',
  );
  const [budgetPeriod, setBudgetPeriod] = useState<'monthly' | 'yearly'>(
    category.budgetPeriod ?? 'monthly',
  );

  async function handleSaveBudget() {
    await updateCategory.mutateAsync({
      id: category._id,
      input: {
        budgetLimit: budgetLimit ? Number(budgetLimit) : undefined,
        budgetPeriod: budgetLimit ? budgetPeriod : undefined,
        budgetCurrency: budgetLimit ? currency : undefined,
      },
    });
    setEditing(false);
  }

  return (
    <li className="flex flex-wrap items-center gap-4 rounded-lg border border-zinc-200 bg-surface px-4 py-3 dark:border-zinc-800">
      <span
        aria-hidden="true"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-base"
        style={{ backgroundColor: `${category.color}1A` }}
      >
        {category.icon}
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">
          {category.name}
        </p>
        {editing ? (
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <input
              type="number"
              min={0}
              step="0.01"
              value={budgetLimit}
              onChange={(e) => setBudgetLimit(e.target.value)}
              placeholder="No limit"
              aria-label={`Budget limit for ${category.name}`}
              className="w-28 rounded-md border border-zinc-300 px-2 py-1 text-xs tabular-nums focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-zinc-700"
            />
            <select
              value={budgetPeriod}
              disabled={!budgetLimit}
              onChange={(e) =>
                setBudgetPeriod(e.target.value as 'monthly' | 'yearly')
              }
              aria-label={`Budget period for ${category.name}`}
              className="rounded-md border border-zinc-300 px-2 py-1 text-xs focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 disabled:opacity-50 dark:border-zinc-700"
            >
              <option value="monthly">monthly</option>
              <option value="yearly">yearly</option>
            </select>
            <button
              type="button"
              onClick={() => void handleSaveBudget()}
              disabled={updateCategory.isPending}
              className="rounded-md bg-teal-600 px-2 py-1 text-xs font-medium text-white transition-colors hover:bg-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 disabled:opacity-60 dark:focus-visible:ring-offset-zinc-900"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-md px-2 py-1 text-xs text-zinc-500 transition-colors hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
          </div>
        ) : (
          <p className="mt-0.5 text-xs tabular-nums text-zinc-500 dark:text-zinc-400">
            {category.budgetLimit
              ? `Budget: ${formatCurrency(category.budgetLimit, category.budgetCurrency ?? currency)} / ${category.budgetPeriod}`
              : 'No budget set'}
          </p>
        )}
      </div>

      {!editing && (
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="rounded-md px-2 py-1 text-xs font-medium text-teal-600 transition-colors hover:bg-teal-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:text-teal-400 dark:hover:bg-teal-500/10"
          >
            Edit budget
          </button>
          {editable && (
            <button
              type="button"
              onClick={() => void deleteCategory.mutateAsync(category._id)}
              disabled={deleteCategory.isPending}
              className="rounded-md px-2 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 disabled:opacity-60 dark:text-red-400 dark:hover:bg-red-500/10"
            >
              Delete
            </button>
          )}
        </div>
      )}
    </li>
  );
}
