const SPENDING = [
  { label: "Housing", amount: "$1,420", width: "78%", color: "bg-indigo-500" },
  { label: "Food", amount: "$486", width: "48%", color: "bg-violet-400" },
  { label: "Transport", amount: "$264", width: "31%", color: "bg-sky-400" },
] as const;

function WindowFrame({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div
      role="img"
      aria-label={label}
      className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl shadow-indigo-950/10 dark:border-zinc-700 dark:bg-zinc-900"
    >
      <div
        aria-hidden="true"
        className="flex h-9 items-center gap-1.5 border-b border-zinc-200 px-4 dark:border-zinc-800"
      >
        <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
      </div>
      {children}
    </div>
  );
}

export function DashboardPreview() {
  return (
    <WindowFrame label="Dashboard preview showing monthly spending, budget status, and category breakdown">
      <div className="grid min-h-80 grid-cols-[4.5rem_1fr] text-[10px] sm:grid-cols-[7rem_1fr] sm:text-xs">
        <div className="border-r border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-950">
          <p className="font-semibold text-zinc-800 dark:text-zinc-100">FT</p>
          <div className="mt-6 space-y-3 text-zinc-400">
            <p className="font-medium text-indigo-600">Overview</p>
            <p>Expenses</p>
            <p>Budgets</p>
            <p>Plans</p>
          </div>
        </div>
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-zinc-900 dark:text-zinc-50">
                Good morning, Alex
              </p>
              <p className="mt-1 text-zinc-400">Your August overview</p>
            </div>
            <span className="rounded-full bg-emerald-50 px-2 py-1 font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
              On track
            </span>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {[
              ["Spent", "$2,846"],
              ["Budget left", "$1,154"],
              ["Upcoming", "$312"],
            ].map(([label, value], index) => (
              <div
                key={label}
                className={`rounded-lg border border-zinc-200 p-3 dark:border-zinc-800 ${
                  index === 2 ? "hidden sm:block" : ""
                }`}
              >
                <p className="text-zinc-400">{label}</p>
                <p className="mt-1 text-sm font-semibold text-zinc-900 dark:text-zinc-50 sm:text-base">
                  {value}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <p className="font-medium text-zinc-700 dark:text-zinc-200">
                Spending by category
              </p>
              <p className="text-zinc-400">This month</p>
            </div>
            <div className="mt-4 space-y-3">
              {SPENDING.map((item) => (
                <div key={item.label}>
                  <div className="mb-1 flex justify-between text-zinc-500 dark:text-zinc-400">
                    <span>{item.label}</span>
                    <span>{item.amount}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <div
                      className={`h-1.5 rounded-full ${item.color}`}
                      style={{ width: item.width }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </WindowFrame>
  );
}

export function ExpensePreview() {
  return (
    <WindowFrame label="Expense tracking preview with categorized transactions">
      <div className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              Recent expenses
            </p>
            <p className="mt-1 text-xs text-zinc-400">
              Everything in one searchable view
            </p>
          </div>
          <span className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-medium text-white">
            Add expense
          </span>
        </div>
        <div className="mt-5 divide-y divide-zinc-100 dark:divide-zinc-800">
          {[
            ["Groceries", "Food", "Today", "$82.40"],
            ["Train pass", "Transport", "Aug 24", "$125.00"],
            ["Cloud storage", "Subscriptions", "Aug 22", "$11.99"],
          ].map(([name, category, date, amount]) => (
            <div
              key={name}
              className="grid grid-cols-[1fr_auto] gap-3 py-3 text-xs"
            >
              <div>
                <p className="font-medium text-zinc-800 dark:text-zinc-100">
                  {name}
                </p>
                <p className="mt-1 text-zinc-400">
                  {category} · {date}
                </p>
              </div>
              <p className="font-semibold tabular-nums text-zinc-800 dark:text-zinc-100">
                {amount}
              </p>
            </div>
          ))}
        </div>
      </div>
    </WindowFrame>
  );
}

export function InstallmentPreview() {
  return (
    <WindowFrame label="Installment plan preview with payoff progress and upcoming payment">
      <div className="p-5">
        <p className="text-xs font-medium uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
          Payoff plan
        </p>
        <div className="mt-2 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              Laptop
            </p>
            <p className="mt-1 text-xs text-zinc-400">6 of 12 payments made</p>
          </div>
          <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            50%
          </p>
        </div>
        <div className="mt-4 h-2 rounded-full bg-zinc-100 dark:bg-zinc-800">
          <div className="h-2 w-1/2 rounded-full bg-indigo-600" />
        </div>
        <div className="mt-6 rounded-xl bg-zinc-50 p-4 dark:bg-zinc-950">
          <div className="flex justify-between text-xs">
            <span className="text-zinc-400">Next payment</span>
            <span className="font-medium text-zinc-800 dark:text-zinc-100">
              Sep 1
            </span>
          </div>
          <div className="mt-3 flex justify-between text-xs">
            <span className="text-zinc-400">Amount due</span>
            <span className="font-semibold text-zinc-800 dark:text-zinc-100">
              $149.00
            </span>
          </div>
        </div>
      </div>
    </WindowFrame>
  );
}
