import type { Metadata } from "next";
import Link from "next/link";
import { AppIconMark } from "@/lib/app-icon";
import {
  DashboardPreview,
  ExpensePreview,
  InstallmentPreview,
} from "./_components/product-preview";

export const metadata: Metadata = {
  title: "Finance Tracker — See where your money goes",
  description:
    "Track expenses, subscriptions, budgets, and installment plans from one private financial workspace.",
};

const FEATURES = [
  [
    "Every expense, one view",
    "Capture one-time purchases and organize them with flexible categories and budgets.",
  ],
  [
    "Subscriptions on schedule",
    "See recurring costs before they arrive and keep upcoming payments visible.",
  ],
  [
    "A clear path to payoff",
    "Model interest and follow every installment payment to completion.",
  ],
  [
    "Insights that stay current",
    "Live category trends and budget signals update as your financial picture changes.",
  ],
] as const;

export default function HomePage() {
  return (
    <div className="min-h-screen overflow-hidden bg-background">
      <a
        href="#main-content"
        className="sr-only z-50 rounded-lg bg-zinc-900 px-4 py-2 text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>

      <header className="border-b border-zinc-200/80 bg-background/90 backdrop-blur dark:border-zinc-800">
        <nav
          aria-label="Main navigation"
          className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
        >
          <Link
            href="/"
            aria-label="Finance Tracker home"
            className="flex items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <AppIconMark size={32} />
            <span className="text-sm font-semibold tracking-tight">
              Finance Tracker
            </span>
          </Link>
          <div className="hidden items-center gap-7 text-sm text-zinc-600 sm:flex dark:text-zinc-300">
            <a
              href="#features"
              className="rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 hover:text-zinc-950 dark:hover:text-white"
            >
              Features
            </a>
            <a
              href="#product"
              className="rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 hover:text-zinc-950 dark:hover:text-white"
            >
              Product
            </a>
            <a
              href="#security"
              className="rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 hover:text-zinc-950 dark:hover:text-white"
            >
              Security
            </a>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-zinc-300 dark:hover:text-white"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-zinc-900 px-3.5 py-2 text-sm font-medium text-white hover:bg-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:bg-white dark:text-zinc-950"
            >
              Get started
            </Link>
          </div>
        </nav>
      </header>

      <main id="main-content">
        <section className="relative">
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-[34rem] bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.15),transparent_55%)]"
          />
          <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-20 sm:px-6 sm:pt-28 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <p className="inline-flex rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300">
                Your complete financial picture, without the noise
              </p>
              <h1 className="mt-6 text-balance text-4xl font-semibold tracking-[-0.035em] text-zinc-950 sm:text-6xl dark:text-white">
                Know where your money goes—and what comes next.
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-7 text-zinc-600 sm:text-lg dark:text-zinc-300">
                Bring everyday expenses, subscriptions, budgets, and payoff
                plans into one calm, real-time workspace.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Link
                  href="/register"
                  className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  Create your free account
                </Link>
                <a
                  href="#product"
                  className="rounded-xl border border-zinc-300 bg-surface px-5 py-3 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  Explore the product
                </a>
              </div>
              <p className="mt-4 text-xs text-zinc-500">
                No credit card required.
              </p>
            </div>
            <div className="mx-auto mt-16 max-w-5xl">
              <DashboardPreview />
            </div>
          </div>
        </section>

        <section
          id="features"
          className="border-y border-zinc-200 bg-surface py-20 dark:border-zinc-800"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                Built for real life
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                From daily spending to long-term plans
              </h2>
              <p className="mt-4 leading-7 text-zinc-600 dark:text-zinc-300">
                One flexible system covers the different ways money leaves your
                account, without flattening everything into a spreadsheet.
              </p>
            </div>
            <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-200 sm:grid-cols-2 dark:border-zinc-800 dark:bg-zinc-800">
              {FEATURES.map(([title, description], index) => (
                <article key={title} className="bg-surface p-7 sm:p-8">
                  <span className="font-mono text-xs text-indigo-600 dark:text-indigo-400">
                    0{index + 1}
                  </span>
                  <h3 className="mt-5 text-lg font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                    {description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="product" className="py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                Product previews
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                The details you need, at a glance
              </h2>
              <p className="mt-4 leading-7 text-zinc-600 dark:text-zinc-300">
                Sanitized previews show how transactions and plans come
                together. No real customer data is used.
              </p>
            </div>
            <div className="mt-14 grid gap-6 lg:grid-cols-2">
              <figure>
                <ExpensePreview />
                <figcaption className="mt-3 text-sm text-zinc-500">
                  Searchable, categorized expense history
                </figcaption>
              </figure>
              <figure>
                <InstallmentPreview />
                <figcaption className="mt-3 text-sm text-zinc-500">
                  Payment schedules with visible payoff progress
                </figcaption>
              </figure>
            </div>
          </div>
        </section>

        <section id="security" className="bg-zinc-950 py-20 text-white">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_1.2fr] lg:px-8">
            <div>
              <p className="text-sm font-semibold text-indigo-300">
                Security by design
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight">
                Financial data deserves strong boundaries.
              </h2>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              {[
                [
                  "Private by default",
                  "Every request is scoped to your verified account.",
                ],
                [
                  "Protected credentials",
                  "Passwords are hashed with Argon2id.",
                ],
                [
                  "Controlled access",
                  "Validation, rate limits, and origin allowlists reduce exposure.",
                ],
                [
                  "Fresh balances",
                  "Financial requests always go to the live API.",
                ],
              ].map(([title, description]) => (
                <article key={title} className="border-l border-zinc-700 pl-5">
                  <h3 className="font-medium">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">
                    {description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-24 sm:px-6">
          <div className="mx-auto max-w-4xl rounded-3xl border border-indigo-200 bg-indigo-50 px-6 py-14 text-center sm:px-12 dark:border-indigo-500/20 dark:bg-indigo-500/10">
            <h2 className="text-3xl font-semibold tracking-tight">
              Start with clarity today.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-zinc-600 dark:text-zinc-300">
              Build a complete view of your spending, upcoming payments, and
              progress toward payoff.
            </p>
            <Link
              href="/register"
              className="mt-8 inline-flex rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              Create your account
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-200 py-8 dark:border-zinc-800">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} Finance Tracker</p>
          <div className="flex gap-5">
            <Link href="/login" className="hover:text-zinc-900">
              Sign in
            </Link>
            <Link href="/register" className="hover:text-zinc-900">
              Create account
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
