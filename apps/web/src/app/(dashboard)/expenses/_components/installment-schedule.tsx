'use client';

import type { IInstallmentPayment } from '@finance-tracker/shared';
import { formatCurrency, formatDate } from '@/lib/format';
import { usePayInstallment } from '@/lib/hooks/use-expenses';

interface InstallmentScheduleProps {
  expenseId: string;
  schedule: IInstallmentPayment[];
  currency: string;
}

export function InstallmentSchedule({
  expenseId,
  schedule,
  currency,
}: InstallmentScheduleProps) {
  const payInstallment = usePayInstallment();

  return (
    <div className="mt-6">
      <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Payment schedule</h2>
      <div className="mt-3 overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
        <table className="min-w-full divide-y divide-zinc-200 text-sm dark:divide-zinc-800">
          <thead>
            <tr className="text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              <th scope="col" className="px-4 py-2">#</th>
              <th scope="col" className="px-4 py-2">Due date</th>
              <th scope="col" className="px-4 py-2 text-right">Principal</th>
              <th scope="col" className="px-4 py-2 text-right">Interest</th>
              <th scope="col" className="px-4 py-2 text-right">Total due</th>
              <th scope="col" className="px-4 py-2">Status</th>
              <th scope="col" className="px-4 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {schedule.map((row) => (
              <tr key={row.installmentNumber}>
                <td className="px-4 py-2 tabular-nums text-zinc-500 dark:text-zinc-400">{row.installmentNumber}</td>
                <td className="px-4 py-2 text-zinc-500 dark:text-zinc-400">{formatDate(row.dueDate)}</td>
                <td className="px-4 py-2 text-right tabular-nums text-zinc-700 dark:text-zinc-300">{formatCurrency(row.principal, currency)}</td>
                <td className="px-4 py-2 text-right tabular-nums text-zinc-700 dark:text-zinc-300">{formatCurrency(row.interest, currency)}</td>
                <td className="px-4 py-2 text-right font-medium tabular-nums text-zinc-900 dark:text-zinc-50">
                  {formatCurrency(row.totalDue, currency)}
                </td>
                <td className="px-4 py-2">
                  {row.paidAt ? (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
                      Paid {formatDate(row.paidAt)}
                    </span>
                  ) : (
                    <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                      Pending
                    </span>
                  )}
                </td>
                <td className="px-4 py-2 text-right">
                  {!row.paidAt && (
                    <button
                      type="button"
                      onClick={() =>
                        void payInstallment.mutateAsync({
                          id: expenseId,
                          installmentNumber: row.installmentNumber,
                        })
                      }
                      disabled={payInstallment.isPending}
                      className="rounded-md px-2 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 disabled:opacity-50 dark:text-emerald-400 dark:hover:bg-emerald-500/10"
                    >
                      Mark paid
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
