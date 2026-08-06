export default function InstallmentsPage() {
  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        Installments
      </h1>
      <p className="mt-2 text-zinc-500 dark:text-zinc-400">
        A dedicated view for tracking installment plans across all your expenses.
      </p>

      <div className="mt-6 rounded-xl border border-dashed border-zinc-300 bg-surface p-10 text-center shadow-sm dark:border-zinc-700">
        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
          Coming soon
        </p>
        <p className="mx-auto mt-1 max-w-sm text-sm text-zinc-500 dark:text-zinc-400">
          Installment tracking with a consolidated payment schedule is planned
          for a future release. In the meantime, manage individual
          installment expenses from the Expenses page.
        </p>
      </div>
    </div>
  );
}
