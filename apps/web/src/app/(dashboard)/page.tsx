'use client';

import dynamic from 'next/dynamic';
import { useDashboardSummary } from '@/lib/hooks/use-analytics';
import { BudgetStatusCards } from './_components/budget-status-cards';
import { SummaryCards } from './_components/summary-cards';
import { UpcomingPaymentsList } from './_components/upcoming-payments-list';

// recharts is one of the heaviest dependencies in the app (~100kb+ gzipped)
// and is only ever needed once the dashboard summary has actually loaded —
// code-split both charts out of the initial dashboard bundle so the
// skeleton/first paint doesn't have to wait on them.
function ChartSkeleton({ label }: { label: string }) {
  return (
    <div
      aria-hidden="true"
      className="h-72 animate-pulse rounded-xl border border-zinc-200 bg-surface p-6 shadow-sm motion-reduce:animate-none dark:border-zinc-800"
    >
      <div className="h-3 w-32 rounded bg-zinc-100 dark:bg-zinc-800" />
      <p className="sr-only">{label}</p>
    </div>
  );
}

const MonthlyTrendChart = dynamic(
  () =>
    import('./_components/monthly-trend-chart').then(
      (mod) => mod.MonthlyTrendChart,
    ),
  { ssr: false, loading: () => <ChartSkeleton label="Loading monthly trend chart" /> },
);

const CategoryBreakdownChart = dynamic(
  () =>
    import('./_components/category-breakdown-chart').then(
      (mod) => mod.CategoryBreakdownChart,
    ),
  {
    ssr: false,
    loading: () => <ChartSkeleton label="Loading category breakdown chart" />,
  },
);

export default function DashboardPage() {
  const { data: summary, isLoading, isError } = useDashboardSummary();

  return (
    <div className="px-4 py-8 sm:px-6">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Your financial overview</p>
      </header>

      {isLoading && (
        <div
          aria-label="Loading dashboard"
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              aria-hidden="true"
              className="rounded-xl border border-zinc-200 bg-surface p-6 shadow-sm dark:border-zinc-800"
            >
              <div className="h-3 w-24 animate-pulse rounded bg-zinc-100 motion-reduce:animate-none dark:bg-zinc-800" />
              <div className="mt-3 h-8 w-28 animate-pulse rounded-md bg-zinc-100 motion-reduce:animate-none dark:bg-zinc-800" />
              <div className="mt-2 h-2.5 w-32 animate-pulse rounded bg-zinc-100 motion-reduce:animate-none dark:bg-zinc-800" />
            </div>
          ))}
        </div>
      )}

      {isError && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          Could not load your dashboard data. Please try again.
        </p>
      )}

      {summary && (
        <>
          <SummaryCards summary={summary} />

          <section aria-label="Charts" className="mt-6 grid gap-6 lg:grid-cols-2">
            <MonthlyTrendChart trends={summary.monthlyTrends} />
            <CategoryBreakdownChart breakdown={summary.categoryBreakdown} />
          </section>

          <section aria-label="Details" className="mt-6 grid gap-6 lg:grid-cols-2">
            <BudgetStatusCards budgetStatus={summary.budgetStatus} />
            <UpcomingPaymentsList payments={summary.upcomingPayments} />
          </section>
        </>
      )}
    </div>
  );
}
