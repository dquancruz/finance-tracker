'use client';

import type { RecurringFrequency } from '@finance-tracker/shared';
import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { toDateInputValue } from '@/lib/format';

const FREQUENCIES: RecurringFrequency[] = ['daily', 'weekly', 'monthly', 'yearly'];

export interface RecurringEditValues {
  description: string;
  amount: number;
  frequency: RecurringFrequency;
  endDate?: string;
  isActive: boolean;
}

interface RecurringExpenseEditFormProps {
  initial: RecurringEditValues;
  onSubmit: (values: RecurringEditValues) => Promise<unknown>;
}

export function RecurringExpenseEditForm({
  initial,
  onSubmit,
}: RecurringExpenseEditFormProps) {
  const router = useRouter();
  const [description, setDescription] = useState(initial.description);
  const [amount, setAmount] = useState(initial.amount.toString());
  const [frequency, setFrequency] = useState(initial.frequency);
  const [endDate, setEndDate] = useState(
    initial.endDate ? toDateInputValue(initial.endDate) : '',
  );
  const [isActive, setIsActive] = useState(initial.isActive);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!description.trim()) return setError('Description is required.');
    if (!Number(amount) || Number(amount) <= 0) {
      return setError('Amount must be a positive number.');
    }

    setPending(true);
    try {
      await onSubmit({
        description: description.trim(),
        amount: Number(amount),
        frequency,
        endDate: endDate || undefined,
        isActive,
      });
      router.push('/expenses');
      router.refresh();
    } catch {
      setError('Could not save changes. Please try again.');
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {error && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="rec-edit-description" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Description
        </label>
        <input
          id="rec-edit-description"
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-zinc-700"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="rec-edit-amount" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Amount
          </label>
          <input
            id="rec-edit-amount"
            type="number"
            min={0}
            step="0.01"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm tabular-nums focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-zinc-700"
          />
        </div>
        <div>
          <label htmlFor="rec-edit-frequency" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Frequency
          </label>
          <select
            id="rec-edit-frequency"
            value={frequency}
            onChange={(e) => setFrequency(e.target.value as RecurringFrequency)}
            className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-zinc-700"
          >
            {FREQUENCIES.map((freq) => (
              <option key={freq} value={freq}>
                {freq}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="rec-edit-end" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          End date (optional)
        </label>
        <input
          id="rec-edit-end"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-zinc-700"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="h-4 w-4 rounded border-zinc-300 text-teal-600 focus:ring-teal-500 dark:border-zinc-700"
        />
        Active
      </label>

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:focus-visible:ring-offset-zinc-900"
      >
        {pending ? 'Saving…' : 'Save changes'}
      </button>
    </form>
  );
}
