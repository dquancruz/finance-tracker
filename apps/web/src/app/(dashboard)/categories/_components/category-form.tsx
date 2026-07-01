'use client';

import { useState, type FormEvent } from 'react';
import { useCreateCategory } from '@/lib/hooks/use-categories';

const BUDGET_PERIODS = ['monthly', 'yearly'] as const;

export function CategoryForm() {
  const createCategory = useCreateCategory();
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('🏷️');
  const [color, setColor] = useState('#6366F1');
  const [budgetLimit, setBudgetLimit] = useState('');
  const [budgetPeriod, setBudgetPeriod] =
    useState<(typeof BUDGET_PERIODS)[number]>('monthly');
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Name is required.');
      return;
    }
    if (!/^#[0-9A-Fa-f]{6}$/.test(color)) {
      setError('Color must be a hex value, e.g. #6366F1.');
      return;
    }

    try {
      await createCategory.mutateAsync({
        name: name.trim(),
        icon,
        color,
        budgetLimit: budgetLimit ? Number(budgetLimit) : undefined,
        budgetPeriod: budgetLimit ? budgetPeriod : undefined,
      });
      setName('');
      setIcon('🏷️');
      setColor('#6366F1');
      setBudgetLimit('');
    } catch {
      setError('Could not create the category. Please try again.');
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm"
      aria-label="Create category"
    >
      <h2 className="text-sm font-semibold text-zinc-900">New category</h2>

      {error && (
        <div
          role="alert"
          className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700"
        >
          {error}
        </div>
      )}

      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="col-span-2 sm:col-span-2">
          <label htmlFor="cat-name" className="block text-xs font-medium text-zinc-700">
            Name
          </label>
          <input
            id="cat-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            placeholder="Subscriptions"
          />
        </div>

        <div>
          <label htmlFor="cat-icon" className="block text-xs font-medium text-zinc-700">
            Icon
          </label>
          <input
            id="cat-icon"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            maxLength={2}
            className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-center text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <div>
          <label htmlFor="cat-color" className="block text-xs font-medium text-zinc-700">
            Color
          </label>
          <div className="mt-1 flex items-center gap-2">
            <input
              id="cat-color"
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="h-9 w-9 shrink-0 rounded-lg border border-zinc-300"
            />
            <input
              aria-label="Color hex value"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="block w-full rounded-lg border border-zinc-300 px-2 py-2 text-xs uppercase focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="cat-budget-limit"
            className="block text-xs font-medium text-zinc-700"
          >
            Budget limit
          </label>
          <input
            id="cat-budget-limit"
            type="number"
            min={0}
            step="0.01"
            value={budgetLimit}
            onChange={(e) => setBudgetLimit(e.target.value)}
            placeholder="Optional"
            className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <div>
          <label
            htmlFor="cat-budget-period"
            className="block text-xs font-medium text-zinc-700"
          >
            Budget period
          </label>
          <select
            id="cat-budget-period"
            value={budgetPeriod}
            disabled={!budgetLimit}
            onChange={(e) =>
              setBudgetPeriod(e.target.value as (typeof BUDGET_PERIODS)[number])
            }
            className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            {BUDGET_PERIODS.map((period) => (
              <option key={period} value={period}>
                {period}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={createCategory.isPending}
        className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {createCategory.isPending ? 'Creating…' : 'Add category'}
      </button>
    </form>
  );
}
