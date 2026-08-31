'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { CurrencySelect } from '@/components/currency-select';
import { toDateInputValue } from '@/lib/format';
import { usePreferredCurrency } from '@/lib/hooks/use-preferred-currency';
import { CategorySelect } from './category-select';

export interface SimpleExpenseFormValues {
  categoryId: string;
  amount: number;
  date: string;
  currency?: string;
  notes?: string;
}

interface SimpleExpenseFormProps {
  initial?: Partial<SimpleExpenseFormValues>;
  onSubmit: (values: SimpleExpenseFormValues) => Promise<unknown>;
  submitLabel: string;
}

export function SimpleExpenseForm({
  initial,
  onSubmit,
  submitLabel,
}: SimpleExpenseFormProps) {
  const router = useRouter();
  const { currency: preferredCurrency } = usePreferredCurrency();
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? '');
  const [currency, setCurrency] = useState(initial?.currency ?? preferredCurrency);
  const [amount, setAmount] = useState(initial?.amount?.toString() ?? '');
  const [date, setDate] = useState(
    initial?.date ? toDateInputValue(initial.date) : toDateInputValue(new Date()),
  );
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const numericAmount = Number(amount);
    if (!categoryId) {
      setError('Please select a category.');
      return;
    }
    if (!numericAmount || numericAmount <= 0) {
      setError('Amount must be a positive number.');
      return;
    }

    setPending(true);
    try {
      await onSubmit({ categoryId, amount: numericAmount, date, currency, notes });
      router.push('/expenses');
      router.refresh();
    } catch {
      setError('Could not save the expense. Please try again.');
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
        <label htmlFor="simple-category" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Category
        </label>
        <CategorySelect id="simple-category" value={categoryId} onChange={setCategoryId} required />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="simple-amount" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Amount
          </label>
          <input
            id="simple-amount"
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
          <label htmlFor="simple-currency" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Currency
          </label>
          <CurrencySelect id="simple-currency" value={currency} onChange={setCurrency} compact />
        </div>
        <div>
          <label htmlFor="simple-date" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Date
          </label>
          <input
            id="simple-date"
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-zinc-700"
          />
        </div>
      </div>

      <div>
        <label htmlFor="simple-notes" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Notes (optional)
        </label>
        <input
          id="simple-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-zinc-700"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:focus-visible:ring-offset-zinc-900"
      >
        {pending ? 'Saving…' : submitLabel}
      </button>
    </form>
  );
}
