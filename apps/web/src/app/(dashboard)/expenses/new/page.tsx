'use client';

import type { ExpenseType } from '@finance-tracker/shared';
import { useState } from 'react';
import { useCreateExpense } from '@/lib/hooks/use-expenses';
import { SimpleExpenseForm } from '../_components/simple-expense-form';
import { InstallmentExpenseForm } from '../_components/installment-expense-form';
import { RecurringExpenseWizard } from '../_components/recurring-expense-wizard';

const TYPE_TABS: Array<{ value: ExpenseType; label: string }> = [
  { value: 'simple', label: 'Simple' },
  { value: 'recurring', label: 'Recurring' },
  { value: 'installment', label: 'Installment' },
];

export default function NewExpensePage() {
  const [type, setType] = useState<ExpenseType>('simple');
  const createExpense = useCreateExpense();

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-semibold text-zinc-900">Add expense</h1>
      <p className="mt-2 text-zinc-500">
        Choose an expense type to get started.
      </p>

      <div
        role="tablist"
        aria-label="Expense type"
        className="mt-6 inline-flex rounded-lg border border-zinc-200 bg-white p-1"
      >
        {TYPE_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={type === tab.value}
            onClick={() => setType(tab.value)}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
              type === tab.value
                ? 'bg-indigo-600 text-white'
                : 'text-zinc-600 hover:bg-zinc-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        {type === 'simple' && (
          <SimpleExpenseForm
            submitLabel="Create expense"
            onSubmit={(values) =>
              createExpense.mutateAsync({ type: 'simple', ...values })
            }
          />
        )}

        {type === 'installment' && (
          <InstallmentExpenseForm
            mode="create"
            onSubmit={(values) =>
              createExpense.mutateAsync({ type: 'installment', ...values })
            }
          />
        )}

        {type === 'recurring' && (
          <RecurringExpenseWizard
            onSubmit={(values) =>
              createExpense.mutateAsync({ type: 'recurring', ...values })
            }
          />
        )}
      </div>
    </div>
  );
}
