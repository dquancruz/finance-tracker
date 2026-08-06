import type { IInstallmentExpense } from '@finance-tracker/shared';

export interface InstallmentSummary {
  paidCount: number;
  remainingCount: number;
  remainingBalance: number;
  nextDueDate: Date | null;
  /** Share of installments paid, 0-100. */
  progressPercentage: number;
  isComplete: boolean;
}

/** Derives payoff progress for an installment expense from its payment schedule. */
export function summarizeInstallment(
  expense: Pick<IInstallmentExpense, 'paymentSchedule'>,
): InstallmentSummary {
  const schedule = expense.paymentSchedule ?? [];
  const unpaid = schedule.filter((row) => !row.paidAt);
  const paidCount = schedule.length - unpaid.length;

  const nextDue = unpaid.reduce<
    IInstallmentExpense['paymentSchedule'][number] | null
  >((soonest, row) => {
    if (!soonest) return row;
    return new Date(row.dueDate) < new Date(soonest.dueDate) ? row : soonest;
  }, null);

  return {
    paidCount,
    remainingCount: unpaid.length,
    remainingBalance:
      Math.round(unpaid.reduce((sum, row) => sum + row.totalDue, 0) * 100) /
      100,
    nextDueDate: nextDue ? nextDue.dueDate : null,
    progressPercentage:
      schedule.length > 0
        ? Math.round((paidCount / schedule.length) * 1000) / 10
        : 0,
    isComplete: schedule.length > 0 && unpaid.length === 0,
  };
}
