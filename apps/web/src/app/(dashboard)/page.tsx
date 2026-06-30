import type { IDashboardSummary } from '@finance-tracker/shared';

// Placeholder type mirroring IDashboardSummary keys used in cards
type SummaryCardProps = {
  title: string;
  description: string;
  placeholderLabel: string;
};

function SummaryCard({ title, description, placeholderLabel }: SummaryCardProps) {
  return (
    <article
      aria-label={title}
      className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm"
    >
      <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">
        {title}
      </p>
      <div
        aria-label={`${title} — ${placeholderLabel}`}
        className="mt-3 h-8 w-28 animate-pulse rounded-md bg-zinc-100"
      />
      <p className="mt-2 text-xs text-zinc-400">{description}</p>
    </article>
  );
}

// Satisfies the shared type to confirm our placeholder structure is correct
// Real data will be fetched in Phase 3
const CARD_CONFIG = [
  {
    key: 'totalThisMonth' satisfies keyof IDashboardSummary,
    title: 'Total This Month',
    description: 'All expenses in the current calendar month',
    placeholderLabel: 'loading…',
  },
  {
    key: 'totalLastMonth' satisfies keyof IDashboardSummary,
    title: 'Last Month',
    description: 'Total spending in the previous month',
    placeholderLabel: 'loading…',
  },
  {
    key: 'upcomingPayments' satisfies keyof IDashboardSummary,
    title: 'Upcoming Payments',
    description: 'Recurring and installment payments due soon',
    placeholderLabel: 'loading…',
  },
  {
    key: 'budgetStatus' satisfies keyof IDashboardSummary,
    title: 'Budget Status',
    description: 'How you are tracking against your budget limits',
    placeholderLabel: 'loading…',
  },
] as const;

export default function DashboardPage() {
  return (
    <div className="px-6 py-8">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-zinc-500">Your financial overview</p>
      </header>

      <section aria-label="Financial summary">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CARD_CONFIG.map((card) => (
            <SummaryCard
              key={card.key}
              title={card.title}
              description={card.description}
              placeholderLabel={card.placeholderLabel}
            />
          ))}
        </div>
      </section>

      <section aria-label="Activity" className="mt-8">
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-zinc-700">Recent activity</p>
          <div className="mt-4 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                aria-hidden="true"
                className="flex items-center gap-4"
              >
                <div className="h-8 w-8 animate-pulse rounded-full bg-zinc-100" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-36 animate-pulse rounded bg-zinc-100" />
                  <div className="h-2.5 w-24 animate-pulse rounded bg-zinc-100" />
                </div>
                <div className="h-3 w-16 animate-pulse rounded bg-zinc-100" />
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-zinc-400">
            Real data will appear here in Phase 3.
          </p>
        </div>
      </section>
    </div>
  );
}
