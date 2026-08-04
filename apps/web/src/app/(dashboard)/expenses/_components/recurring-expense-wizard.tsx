'use client';

import type { RecurringFrequency } from '@finance-tracker/shared';
import { computeNextDueDate } from '@finance-tracker/finance-utils';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatCurrency, formatDate, toDateInputValue } from '@/lib/format';
import { useCategories } from '@/lib/hooks/use-categories';
import { CategorySelect } from './category-select';

export interface RecurringExpenseValues {
  categoryId: string;
  description: string;
  amount: number;
  frequency: RecurringFrequency;
  startDate: string;
  endDate?: string;
}

interface RecurringExpenseWizardProps {
  onSubmit: (values: RecurringExpenseValues) => Promise<unknown>;
}

const FREQUENCIES: RecurringFrequency[] = ['daily', 'weekly', 'monthly', 'yearly'];
const STEPS = ['Details', 'Schedule', 'Review'] as const;

function nextOccurrences(
  startDate: string,
  frequency: RecurringFrequency,
  count: number,
): Date[] {
  const occurrences: Date[] = [];
  let current = new Date(startDate);
  for (let i = 0; i < count; i++) {
    occurrences.push(current);
    current = computeNextDueDate(current, frequency);
  }
  return occurrences;
}

export function RecurringExpenseWizard({ onSubmit }: RecurringExpenseWizardProps) {
  const router = useRouter();
  const { data: categories } = useCategories();
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState<RecurringFrequency>('monthly');
  const [startDate, setStartDate] = useState(toDateInputValue(new Date()));
  const [endDate, setEndDate] = useState('');

  const preview = useMemo(
    () => (startDate ? nextOccurrences(startDate, frequency, 3) : []),
    [startDate, frequency],
  );

  const selectedCategory = categories?.find((c) => c._id === categoryId);

  function validateStep(currentStep: number): string | null {
    if (currentStep === 0) {
      if (!categoryId) return 'Please select a category.';
      if (!description.trim()) return 'Description is required.';
      if (!Number(amount) || Number(amount) <= 0) {
        return 'Amount must be a positive number.';
      }
    }
    if (currentStep === 1 && !startDate) {
      return 'Start date is required.';
    }
    return null;
  }

  function goNext() {
    const validationError = validateStep(step);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function goBack() {
    setError(null);
    setStep((s) => Math.max(s - 1, 0));
  }

  async function handleConfirm() {
    setError(null);
    setPending(true);
    try {
      await onSubmit({
        categoryId,
        description: description.trim(),
        amount: Number(amount),
        frequency,
        startDate,
        endDate: endDate || undefined,
      });
      router.push('/expenses');
      router.refresh();
    } catch {
      setError('Could not create the recurring expense. Please try again.');
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <ol className="mb-6 flex items-center gap-4" aria-label="Wizard steps">
        {STEPS.map((label, index) => (
          <li key={label} className="flex items-center gap-2">
            <span
              aria-current={step === index ? 'step' : undefined}
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                index <= step
                  ? 'bg-indigo-600 text-white'
                  : 'bg-zinc-100 text-zinc-500'
              }`}
            >
              {index + 1}
            </span>
            <span
              className={`text-sm ${index === step ? 'font-medium text-zinc-900' : 'text-zinc-500'}`}
            >
              {label}
            </span>
          </li>
        ))}
      </ol>

      {error && (
        <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {step === 0 && (
        <div className="space-y-4">
          <div>
            <label htmlFor="rec-category" className="block text-sm font-medium text-zinc-700">
              Category
            </label>
            <CategorySelect id="rec-category" value={categoryId} onChange={setCategoryId} required />
          </div>
          <div>
            <label htmlFor="rec-description" className="block text-sm font-medium text-zinc-700">
              Description
            </label>
            <input
              id="rec-description"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Netflix subscription"
              className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          <div>
            <label htmlFor="rec-amount" className="block text-sm font-medium text-zinc-700">
              Amount per occurrence
            </label>
            <input
              id="rec-amount"
              type="number"
              min={0}
              step="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <div>
            <label htmlFor="rec-frequency" className="block text-sm font-medium text-zinc-700">
              Frequency
            </label>
            <select
              id="rec-frequency"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as RecurringFrequency)}
              className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              {FREQUENCIES.map((freq) => (
                <option key={freq} value={freq}>
                  {freq}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="rec-start" className="block text-sm font-medium text-zinc-700">
                Start date
              </label>
              <input
                id="rec-start"
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div>
              <label htmlFor="rec-end" className="block text-sm font-medium text-zinc-700">
                End date (optional)
              </label>
              <input
                id="rec-end"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          {preview.length > 0 && (
            <div className="rounded-lg bg-zinc-50 p-3">
              <p className="text-xs font-medium text-zinc-500">
                Next occurrences preview
              </p>
              <ul className="mt-1 space-y-0.5 text-sm text-zinc-700">
                {preview.map((date, i) => (
                  <li key={i}>{formatDate(date)}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {step === 2 && (
        <div className="space-y-2 rounded-lg border border-zinc-200 p-4 text-sm">
          <p>
            <span className="font-medium text-zinc-700">Category:</span>{' '}
            {selectedCategory ? `${selectedCategory.icon} ${selectedCategory.name}` : '—'}
          </p>
          <p>
            <span className="font-medium text-zinc-700">Description:</span> {description}
          </p>
          <p>
            <span className="font-medium text-zinc-700">Amount:</span>{' '}
            {amount ? formatCurrency(Number(amount)) : '—'} / {frequency}
          </p>
          <p>
            <span className="font-medium text-zinc-700">Starts:</span> {formatDate(startDate)}
          </p>
          {endDate && (
            <p>
              <span className="font-medium text-zinc-700">Ends:</span> {formatDate(endDate)}
            </p>
          )}
        </div>
      )}

      <div className="mt-6 flex justify-between">
        <button
          type="button"
          onClick={goBack}
          disabled={step === 0}
          className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Back
        </button>

        {step < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={goNext}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Next
          </button>
        ) : (
          <button
            type="button"
            onClick={() => void handleConfirm()}
            disabled={pending}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? 'Creating…' : 'Create recurring expense'}
          </button>
        )}
      </div>
    </div>
  );
}
