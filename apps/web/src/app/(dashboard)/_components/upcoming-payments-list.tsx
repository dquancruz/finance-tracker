import type { IUpcomingItem } from '@finance-tracker/shared';
import { formatCurrency, formatDate } from '@/lib/format';

interface UpcomingPaymentsListProps {
  payments: IUpcomingItem[];
}

function dueLabel(daysUntilDue: number): string {
  if (daysUntilDue < 0) return 'Overdue';
  if (daysUntilDue === 0) return 'Due today';
  if (daysUntilDue === 1) return 'Due tomorrow';
  return `Due in ${daysUntilDue} days`;
}

function dueBadgeClasses(daysUntilDue: number): string {
  if (daysUntilDue < 0) return 'bg-red-100 text-red-700';
  if (daysUntilDue <= 3) return 'bg-amber-100 text-amber-700';
  return 'bg-zinc-100 text-zinc-600';
}

function typeBadgeClasses(type: IUpcomingItem['type']): string {
  return type === 'recurring'
    ? 'bg-indigo-100 text-indigo-700'
    : 'bg-amber-100 text-amber-700';
}

export function UpcomingPaymentsList({ payments }: UpcomingPaymentsListProps) {
  return (
    <article
      aria-label="Upcoming payments"
      className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm"
    >
      <p className="text-sm font-medium text-zinc-700">Upcoming payments</p>
      <p className="mt-1 text-xs text-zinc-400">
        Recurring and installment payments due in the next 30 days
      </p>

      {payments.length === 0 ? (
        <p className="mt-8 text-sm text-zinc-400">
          Nothing due in the next 30 days.
        </p>
      ) : (
        <ul role="list" className="mt-4 space-y-3">
          {payments.map((payment, index) => (
            <li
              key={`${payment.expenseId}-${index}`}
              className="flex items-center gap-4"
            >
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${typeBadgeClasses(payment.type)}`}
              >
                {payment.type}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-zinc-900">
                  {payment.description}
                </p>
                <p className="text-xs text-zinc-400">
                  {formatDate(payment.dueDate)}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${dueBadgeClasses(payment.daysUntilDue)}`}
              >
                {dueLabel(payment.daysUntilDue)}
              </span>
              <span className="w-20 shrink-0 text-right text-sm font-medium text-zinc-900">
                {formatCurrency(payment.amount)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
