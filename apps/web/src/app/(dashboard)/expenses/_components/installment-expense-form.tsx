'use client';

import type { InterestType } from '@finance-tracker/shared';
import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { CurrencySelect } from '@/components/currency-select';
import { toDateInputValue } from '@/lib/format';
import { usePreferredCurrency } from '@/lib/hooks/use-preferred-currency';
import { CategorySelect } from './category-select';

const INTEREST_TYPES: InterestType[] = ['none', 'simple', 'compound'];

export interface InstallmentCreateValues {
  categoryId: string;
  description: string;
  totalAmount: number;
  numInstallments: number;
  currency?: string;
  interestRate?: number;
  interestType: InterestType;
  startDate: string;
}

export interface InstallmentEditValues {
  description: string;
  interestRate?: number;
  interestType: InterestType;
}

interface CreateProps {
  mode: 'create';
  onSubmit: (values: InstallmentCreateValues) => Promise<unknown>;
}

interface EditProps {
  mode: 'edit';
  initial: InstallmentCreateValues;
  onSubmit: (values: InstallmentEditValues) => Promise<unknown>;
}

type InstallmentExpenseFormProps = CreateProps | EditProps;

export function InstallmentExpenseForm(props: InstallmentExpenseFormProps) {
  const router = useRouter();
  const { currency: preferredCurrency } = usePreferredCurrency();
  const initial = props.mode === 'edit' ? props.initial : undefined;

  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? '');
  const [currency, setCurrency] = useState(initial?.currency ?? preferredCurrency);
  const [description, setDescription] = useState(initial?.description ?? '');
  const [totalAmount, setTotalAmount] = useState(
    initial?.totalAmount?.toString() ?? '',
  );
  const [numInstallments, setNumInstallments] = useState(
    initial?.numInstallments?.toString() ?? '12',
  );
  const [interestRate, setInterestRate] = useState(
    initial?.interestRate?.toString() ?? '',
  );
  const [interestType, setInterestType] = useState<InterestType>(
    initial?.interestType ?? 'none',
  );
  const [startDate, setStartDate] = useState(
    initial?.startDate ? toDateInputValue(initial.startDate) : toDateInputValue(new Date()),
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (props.mode === 'create') {
      const total = Number(totalAmount);
      const installments = Number(numInstallments);
      if (!categoryId) return setError('Please select a category.');
      if (!description.trim()) return setError('Description is required.');
      if (!total || total <= 0) return setError('Total amount must be positive.');
      if (!installments || installments < 1) {
        return setError('Number of installments must be at least 1.');
      }

      setPending(true);
      try {
        await props.onSubmit({
          categoryId,
          description: description.trim(),
          totalAmount: total,
          numInstallments: installments,
          currency,
          interestRate: interestRate ? Number(interestRate) : undefined,
          interestType,
          startDate,
        });
        router.push('/expenses');
        router.refresh();
      } catch {
        setError('Could not save the expense. Please try again.');
      } finally {
        setPending(false);
      }
      return;
    }

    if (!description.trim()) return setError('Description is required.');

    setPending(true);
    try {
      await props.onSubmit({
        description: description.trim(),
        interestRate: interestRate ? Number(interestRate) : undefined,
        interestType,
      });
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

      {props.mode === 'create' && (
        <div>
          <label htmlFor="inst-category" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Category
          </label>
          <CategorySelect id="inst-category" value={categoryId} onChange={setCategoryId} required />
        </div>
      )}

      <div>
        <label htmlFor="inst-description" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Description
        </label>
        <input
          id="inst-description"
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="New laptop"
          className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-zinc-700"
        />
      </div>

      {props.mode === 'create' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="inst-total" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Total amount
            </label>
            <input
              id="inst-total"
              type="number"
              min={0}
              step="0.01"
              required
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-zinc-700"
            />
          </div>
          <div>
            <label htmlFor="inst-currency" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Currency
            </label>
            <CurrencySelect id="inst-currency" value={currency} onChange={setCurrency} compact />
          </div>
          <div>
            <label htmlFor="inst-count" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Number of installments
            </label>
            <input
              id="inst-count"
              type="number"
              min={1}
              required
              value={numInstallments}
              onChange={(e) => setNumInstallments(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-zinc-700"
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="inst-interest-type" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Interest type
          </label>
          <select
            id="inst-interest-type"
            value={interestType}
            onChange={(e) => setInterestType(e.target.value as InterestType)}
            className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-zinc-700"
          >
            {INTEREST_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="inst-interest-rate" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Annual interest rate
          </label>
          <input
            id="inst-interest-rate"
            type="number"
            min={0}
            step="0.0001"
            disabled={interestType === 'none'}
            value={interestRate}
            onChange={(e) => setInterestRate(e.target.value)}
            placeholder="e.g. 0.15 for 15%"
            className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm disabled:opacity-50 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-zinc-700"
          />
        </div>
      </div>

      {props.mode === 'create' && (
        <div>
          <label htmlFor="inst-start-date" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Start date
          </label>
          <input
            id="inst-start-date"
            type="date"
            required
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-zinc-700"
          />
        </div>
      )}

      {props.mode === 'edit' && (
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Changing the interest type/rate rebuilds the schedule for
          installments that haven&apos;t been paid yet.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:focus-visible:ring-offset-zinc-900"
      >
        {pending ? 'Saving…' : props.mode === 'create' ? 'Create expense' : 'Save changes'}
      </button>
    </form>
  );
}
