import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { NotificationCenter } from './_components/notification-center';
import { SidebarNav } from './_components/sidebar-nav';

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

        <SidebarNav />

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
              <p className="truncate text-xs text-zinc-500">
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
