import { auth } from '@/lib/auth';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { NotificationCenter } from './_components/notification-center';

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: 'grid' },
  { href: '/expenses', label: 'Expenses', icon: 'receipt' },
  { href: '/categories', label: 'Categories', icon: 'tag' },
  { href: '/installments', label: 'Installments', icon: 'calendar' },
] as const;

function NavIcon({ name }: { name: (typeof NAV_ITEMS)[number]['icon'] }) {
  switch (name) {
    case 'grid':
      return (
        <svg
          aria-hidden="true"
          className="h-4 w-4 shrink-0"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      );
    case 'receipt':
      return (
        <svg
          aria-hidden="true"
          className="h-4 w-4 shrink-0"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
      );
    case 'tag':
      return (
        <svg
          aria-hidden="true"
          className="h-4 w-4 shrink-0"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z"
          />
        </svg>
      );
    case 'calendar':
      return (
        <svg
          aria-hidden="true"
          className="h-4 w-4 shrink-0"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path strokeLinecap="round" d="M16 2v4M8 2v4M3 10h18" />
        </svg>
      );
  }
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  const userName = session.user?.name ?? session.user?.email ?? 'User';
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside
        className="flex w-60 shrink-0 flex-col border-r border-zinc-200 bg-white"
        aria-label="Main navigation"
      >
        {/* Brand */}
        <div className="flex h-14 items-center border-b border-zinc-200 px-4">
          <span className="text-sm font-semibold tracking-tight text-zinc-900">
            Finance Tracker
          </span>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4">
          <ul role="list" className="space-y-1">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                >
                  <NavIcon name={item.icon} />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* User footer */}
        <div className="flex items-center gap-3 border-t border-zinc-200 px-4 py-3">
          <div
            aria-hidden="true"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700"
          >
            {userInitial}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-zinc-900">
              {userName}
            </p>
            {session.user?.email && (
              <p className="truncate text-xs text-zinc-400">
                {session.user.email}
              </p>
            )}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="flex items-center justify-end border-b border-zinc-200 bg-white px-6 py-2">
          <NotificationCenter />
        </div>
        {children}
      </main>
    </div>
  );
}
