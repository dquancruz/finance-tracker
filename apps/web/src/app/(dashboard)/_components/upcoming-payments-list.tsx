import type { IUpcomingItem } from '@finance-tracker/shared';
import { formatCurrency, formatDate } from '@/lib/format';

interface UpcomingPaymentsListProps {
  payments: IUpcomingItem[];
  currency: string;
}

function dueLabel(daysUntilDue: number): string {
  if (daysUntilDue < 0) return 'Overdue';
  if (daysUntilDue === 0) return 'Due today';
  if (daysUntilDue === 1) return 'Due tomorrow';
  return `Due in ${daysUntilDue} days`;
}

function dueBadgeClasses(daysUntilDue: number): string {
  if (daysUntilDue < 0) return 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400';
  if (daysUntilDue <= 3) return 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400';
  return 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400';
}

function typeBadgeClasses(type: IUpcomingItem['type']): string {
  return type === 'recurring'
    ? 'bg-teal-100 text-teal-700 dark:bg-teal-500/15 dark:text-teal-300'
    : 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400';
}

export function UpcomingPaymentsList({
  payments,
  currency,
}: UpcomingPaymentsListProps) {
  return (
    <article
      aria-label="Upcoming payments"
      className="rounded-xl border border-zinc-200 bg-surface p-6 shadow-sm dark:border-zinc-800"
    >
      <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Upcoming payments</p>
      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
        Recurring and installment payments due in the next 30 days
      </p>

      {payments.length === 0 ? (
        <p className="mt-8 text-sm text-zinc-500 dark:text-zinc-400">
          Nothing due in the next 30 days.
        </p>
      ) : (
        <ul role="list" className="mt-4 space-y-3">
          {payments.map((payment, index) => (
            <li
              key={`${payment.expenseId}-${index}`}
              className="flex flex-wrap items-center gap-x-4 gap-y-1"
            >
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${typeBadgeClasses(payment.type)}`}
              >
                {payment.type}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  {payment.description}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {formatDate(payment.dueDate)}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${dueBadgeClasses(payment.daysUntilDue)}`}
              >
                {dueLabel(payment.daysUntilDue)}
              </span>
              <span className="w-20 shrink-0 text-right text-sm font-medium tabular-nums text-zinc-900 dark:text-zinc-50">
                {formatCurrency(payment.amount, currency)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
