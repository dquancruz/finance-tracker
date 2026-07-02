import type { IDashboardSummary } from '@finance-tracker/shared';
import { formatCurrency } from '@/lib/format';
import { formatPercentageChange } from '@/lib/analytics-format';

interface SummaryCardsProps {
  summary: IDashboardSummary;
}

function SummaryCard({
  title,
  description,
  value,
  valueClassName = 'text-zinc-900',
}: {
  title: string;
  description: string;
  value: React.ReactNode;
  valueClassName?: string;
}) {
  return (
    <article
      aria-label={title}
      className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm"
    >
      <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">
        {title}
      </p>
      <p className={`mt-3 text-2xl font-semibold ${valueClassName}`}>
        {value}
      </p>
      <p className="mt-2 text-xs text-zinc-400">{description}</p>
    </article>
  );
}

export function SummaryCards({ summary }: SummaryCardsProps) {
  const overBudgetCount = summary.budgetStatus.filter(
    (b) => b.percentage >= 100,
  ).length;
  const changeIsIncrease = summary.monthOverMonthChange > 0;

  return (
    <section aria-label="Financial summary">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          title="Total This Month"
          description="All expenses in the current calendar month"
          value={formatCurrency(summary.totalThisMonth)}
        />
        <SummaryCard
          title="Last Month"
          description={`${formatPercentageChange(summary.monthOverMonthChange)} vs. last month`}
          value={formatCurrency(summary.totalLastMonth)}
          valueClassName={
            changeIsIncrease ? 'text-red-600' : 'text-emerald-600'
          }
        />
        <SummaryCard
          title="Upcoming Payments"
          description="Recurring and installment payments due in 30 days"
          value={summary.upcomingPayments.length}
        />
        <SummaryCard
          title="Budget Status"
          description={
            summary.budgetStatus.length === 0
              ? 'No budgets configured yet'
              : overBudgetCount > 0
                ? `${overBudgetCount} categor${overBudgetCount === 1 ? 'y' : 'ies'} over budget`
                : 'All budgeted categories on track'
          }
          value={
            summary.budgetStatus.length === 0
              ? '—'
              : `${summary.budgetStatus.length - overBudgetCount}/${summary.budgetStatus.length}`
          }
          valueClassName={
            overBudgetCount > 0 ? 'text-amber-600' : 'text-zinc-900'
          }
        />
      </div>
    </section>
  );
}
