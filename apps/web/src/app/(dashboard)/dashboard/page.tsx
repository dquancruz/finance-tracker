"use client";

import dynamic from "next/dynamic";
import { signOut, useSession } from "next-auth/react";
import { getDashboardView } from "@/lib/dashboard-view";
import { useDashboardSummary } from "@/lib/hooks/use-analytics";
import { usePreferredCurrency } from '@/lib/hooks/use-preferred-currency';
import { BudgetStatusCards } from "../_components/budget-status-cards";
import { SummaryCards } from "../_components/summary-cards";
import { UpcomingPaymentsList } from "../_components/upcoming-payments-list";

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

function DashboardSkeleton() {
  return (
    <div
      aria-label="Loading dashboard"
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          aria-hidden="true"
          className="rounded-xl border border-zinc-200 bg-surface p-6 shadow-sm dark:border-zinc-800"
        >
          <div className="h-3 w-24 animate-pulse rounded bg-zinc-100 motion-reduce:animate-none dark:bg-zinc-800" />
          <div className="mt-3 h-8 w-28 animate-pulse rounded-md bg-zinc-100 motion-reduce:animate-none dark:bg-zinc-800" />
          <div className="mt-2 h-2.5 w-32 animate-pulse rounded bg-zinc-100 motion-reduce:animate-none dark:bg-zinc-800" />
        </div>
      ))}
    </div>
  );
}

const MonthlyTrendChart = dynamic(
  () =>
    import("../_components/monthly-trend-chart").then(
      (mod) => mod.MonthlyTrendChart,
    ),
  {
    ssr: false,
    loading: () => <ChartSkeleton label="Loading monthly trend chart" />,
  },
);

const CategoryBreakdownChart = dynamic(
  () =>
    import("../_components/category-breakdown-chart").then(
      (mod) => mod.CategoryBreakdownChart,
    ),
  {
    ssr: false,
    loading: () => <ChartSkeleton label="Loading category breakdown chart" />,
  },
);

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-4 py-8 sm:px-6">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Your financial overview
        </p>
      </header>
      {children}
    </div>
  );
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const {
    data: summary,
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useDashboardSummary();

  const { currency } = usePreferredCurrency();
  const view = getDashboardView({
    sessionStatus: status,
    hasAccessToken: Boolean(session?.accessToken),
    isLoading,
    isError,
    hasSummary: Boolean(summary),
  });

  if (view === "loading") {
    return (
      <PageShell>
        <DashboardSkeleton />
      </PageShell>
    );
  }

  if (view === "reauth") {
    return (
      <PageShell>
        <div
          role="alert"
          className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200"
        >
          <p className="font-medium">Your session could not access the API.</p>
          <p className="mt-1">
            Sign in again to restore a secure connection to your financial data.
          </p>
          <button
            type="button"
            onClick={() =>
              void signOut({
                callbackUrl: "/login?callbackUrl=%2Fdashboard",
              })
            }
            className="mt-4 rounded-lg bg-amber-900 px-3 py-2 font-medium text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700 focus-visible:ring-offset-2 dark:bg-amber-200 dark:text-amber-950"
          >
            Sign in again
          </button>
        </div>
      </PageShell>
    );
  }

  if (view === "error") {
    return (
      <PageShell>
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
        >
          <p className="font-medium">Could not load your dashboard data.</p>
          <p className="mt-1">
            Check your connection and try the request again.
          </p>
          <button
            type="button"
            disabled={isFetching}
            onClick={() => void refetch()}
            className="mt-4 rounded-lg bg-red-700 px-3 py-2 font-medium text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 disabled:opacity-60"
          >
            {isFetching ? "Retrying…" : "Try again"}
          </button>
        </div>
      </PageShell>
    );
  }

  // getDashboardView only returns "ready" when a summary is present.
  if (!summary) return null;

  return (
    <PageShell>
      <SummaryCards summary={summary} currency={currency} />

      <section aria-label="Charts" className="mt-6 grid gap-6 lg:grid-cols-2">
        <MonthlyTrendChart trends={summary.monthlyTrends} currency={currency} />
        <CategoryBreakdownChart breakdown={summary.categoryBreakdown} currency={currency} />
      </section>

      <section aria-label="Details" className="mt-6 grid gap-6 lg:grid-cols-2">
        <BudgetStatusCards budgetStatus={summary.budgetStatus} currency={currency} />
        <UpcomingPaymentsList payments={summary.upcomingPayments} currency={currency} />
      </section>
    </PageShell>
  );
}
