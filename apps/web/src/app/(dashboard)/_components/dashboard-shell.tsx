'use client';

import { useEffect, useState } from 'react';
import { NotificationCenter } from './notification-center';
import { SidebarNav } from './sidebar-nav';

interface DashboardShellProps {
  userName: string;
  userInitial: string;
  userEmail?: string | null;
  children: React.ReactNode;
}

function BrandMark() {
  return (
    <span className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
      Finance Tracker
    </span>
  );
}

function UserFooter({
  userName,
  userInitial,
  userEmail,
}: {
  userName: string;
  userInitial: string;
  userEmail?: string | null;
}) {
  return (
    <div className="flex items-center gap-3 border-t border-zinc-200 px-4 py-3 dark:border-zinc-800">
      <div
        aria-hidden="true"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300"
      >
        {userInitial}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium text-zinc-900 dark:text-zinc-50">
          {userName}
        </p>
        {userEmail && (
          <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
            {userEmail}
          </p>
        )}
      </div>
    </div>
  );
}

export function DashboardShell({
  userName,
  userInitial,
  userEmail,
  children,
}: DashboardShellProps) {
  const [open, setOpen] = useState(false);

  // Close the mobile drawer on Escape, and whenever the viewport grows past
  // the `lg` breakpoint (so it can't be left open-but-hidden behind the
  // static desktop sidebar).
  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }

    const mql = window.matchMedia('(min-width: 64rem)');
    function handleViewportChange() {
      if (mql.matches) setOpen(false);
    }

    document.addEventListener('keydown', handleKeyDown);
    mql.addEventListener('change', handleViewportChange);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      mql.removeEventListener('change', handleViewportChange);
    };
  }, [open]);

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar — static, always visible at lg+ */}
      <aside
        className="hidden shrink-0 flex-col border-r border-zinc-200 bg-surface lg:flex lg:w-60 dark:border-zinc-800"
        aria-label="Main navigation"
      >
        <div className="flex h-14 items-center border-b border-zinc-200 px-4 dark:border-zinc-800">
          <BrandMark />
        </div>
        <SidebarNav />
        <UserFooter
          userName={userName}
          userInitial={userInitial}
          userEmail={userEmail}
        />
      </aside>

      {/* Mobile drawer — off-canvas, toggled by the hamburger button below */}
      <div className="lg:hidden">
        {/* Decorative dismiss layer — Escape/close button provide the keyboard-accessible path */}
        <div
          aria-hidden="true"
          inert={!open}
          onClick={() => setOpen(false)}
          className={`fixed inset-0 z-40 bg-zinc-950/50 transition-opacity duration-200 motion-reduce:transition-none ${
            open ? 'opacity-100' : 'pointer-events-none opacity-0'
          }`}
        />
        <aside
          id="mobile-nav"
          role="dialog"
          aria-modal="true"
          aria-label="Main navigation"
          inert={!open}
          className={`fixed inset-y-0 left-0 z-50 flex w-64 max-w-[80vw] flex-col border-r border-zinc-200 bg-surface transition-transform duration-200 ease-out motion-reduce:transition-none dark:border-zinc-800 ${
            open ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex h-14 items-center justify-between border-b border-zinc-200 px-4 dark:border-zinc-800">
            <BrandMark />
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close navigation"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
            >
              <svg
                aria-hidden="true"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <SidebarNav onNavigate={() => setOpen(false)} />
          <UserFooter
            userName={userName}
            userInitial={userInitial}
            userEmail={userEmail}
          />
        </aside>
      </div>

      {/* Main content */}
      <div className="flex min-w-0 flex-1 flex-col overflow-auto">
        <div className="flex items-center justify-between border-b border-zinc-200 bg-surface px-4 py-2 lg:justify-end lg:px-6 dark:border-zinc-800">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open navigation"
            aria-expanded={open}
            aria-controls="mobile-nav"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 lg:hidden dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
          >
            <svg
              aria-hidden="true"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="text-sm font-semibold tracking-tight text-zinc-900 lg:hidden dark:text-zinc-50">
            Finance Tracker
          </span>
          <NotificationCenter />
        </div>
        {children}
      </div>
    </div>
  );
}
