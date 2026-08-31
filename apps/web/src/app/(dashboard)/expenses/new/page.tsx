import { Suspense } from 'react';
import NewExpensePageClient from './new-expense-page-client';

export default function NewExpensePage() {
  return (
    <Suspense fallback={<p className="p-6 text-sm text-zinc-500">Loading…</p>}>
      <NewExpensePageClient />
    </Suspense>
  );
}
