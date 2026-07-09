'use client';

import { useParams } from 'next/navigation';
import { toDateInputValue } from '@/lib/format';
import { useExpense, useUpdateExpense } from '@/lib/hooks/use-expenses';
import { SimpleExpenseForm } from '../../_components/simple-expense-form';
import { InstallmentExpenseForm } from '../../_components/installment-expense-form';
import {
  RecurringExpenseEditForm,
} from '../../_components/recurring-expense-edit-form';
import { InstallmentSchedule } from '../../_components/installment-schedule';

export default function EditExpensePage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { data: expense, isLoading, isError } = useExpense(id);
  const updateExpense = useUpdateExpense();

  if (isLoading) {
    return <p className="p-6 text-sm text-zinc-500">Loading expense…</p>;
  }
  if (isError || !expense) {
    return (
      <p role="alert" className="p-6 text-sm text-red-600">
        Could not load this expense.
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-semibold text-zinc-900">Edit expense</h1>
      <p className="mt-2 text-zinc-500 capitalize">{expense.type} expense</p>

      <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        {expense.type === 'simple' && (
          <SimpleExpenseForm
            submitLabel="Save changes"
            initial={{
              categoryId: expense.categoryId,
              amount: expense.amount,
              date: toDateInputValue(expense.date),
              notes: expense.notes,
            }}
            onSubmit={(values) =>
              updateExpense.mutateAsync({ id, input: values })
            }
          />
        )}

        {expense.type === 'recurring' && (
          <RecurringExpenseEditForm
            initial={{
              description: expense.description,
              amount: expense.amount,
              frequency: expense.frequency,
              endDate: expense.endDate
                ? toDateInputValue(expense.endDate)
                : undefined,
              isActive: expense.isActive,
            }}
            onSubmit={(values) =>
              updateExpense.mutateAsync({ id, input: values })
            }
          />
        )}

        {expense.type === 'installment' && (
          <InstallmentExpenseForm
            mode="edit"
            initial={{
              categoryId: expense.categoryId,
              description: expense.description,
              totalAmount: expense.totalAmount,
              numInstallments: expense.numInstallments,
              interestRate: expense.interestRate,
              interestType: expense.interestType,
              startDate: toDateInputValue(expense.startDate),
            }}
            onSubmit={(values) =>
              updateExpense.mutateAsync({ id, input: values })
            }
          />
        )}
      </div>

      {expense.type === 'installment' && (
        <InstallmentSchedule
          expenseId={id}
          schedule={expense.paymentSchedule}
          currency={expense.currency}
        />
      )}
    </div>
  );
}
