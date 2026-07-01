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
      <h2 className="text-sm font-semibold text-zinc-900">Payment schedule</h2>
      <div className="mt-3 overflow-x-auto rounded-xl border border-zinc-200">
        <table className="min-w-full divide-y divide-zinc-200 text-sm">
          <thead>
            <tr className="text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
              <th scope="col" className="px-4 py-2">#</th>
              <th scope="col" className="px-4 py-2">Due date</th>
              <th scope="col" className="px-4 py-2 text-right">Principal</th>
              <th scope="col" className="px-4 py-2 text-right">Interest</th>
              <th scope="col" className="px-4 py-2 text-right">Total due</th>
              <th scope="col" className="px-4 py-2">Status</th>
              <th scope="col" className="px-4 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {schedule.map((row) => (
              <tr key={row.installmentNumber}>
                <td className="px-4 py-2 text-zinc-500">{row.installmentNumber}</td>
                <td className="px-4 py-2 text-zinc-500">{formatDate(row.dueDate)}</td>
                <td className="px-4 py-2 text-right">{formatCurrency(row.principal, currency)}</td>
                <td className="px-4 py-2 text-right">{formatCurrency(row.interest, currency)}</td>
                <td className="px-4 py-2 text-right font-medium text-zinc-900">
                  {formatCurrency(row.totalDue, currency)}
                </td>
                <td className="px-4 py-2">
                  {row.paidAt ? (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                      Paid {formatDate(row.paidAt)}
                    </span>
                  ) : (
                    <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600">
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
                      className="rounded-md px-2 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-50"
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
