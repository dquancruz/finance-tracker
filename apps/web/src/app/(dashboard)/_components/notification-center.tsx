'use client';

import { useEffect, useRef, useState } from 'react';
import type { INotification } from '@finance-tracker/shared';
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
  useUnreadNotificationCount,
} from '@/lib/hooks/use-notifications';
import { useRealtimeSync } from '@/lib/hooks/use-realtime-sync';
import {
  formatRelativeTime,
  formatUnreadBadge,
  notificationTone,
  notificationToneBadgeClass,
} from '@/lib/notification-format';
import { requestPushPermission } from '@/lib/push-notifications';

function NotificationRow({
  notification,
  onRead,
}: {
  notification: INotification;
  onRead: (id: string) => void;
}) {
  const tone = notificationTone(notification.type);

  return (
    <li>
      <button
        type="button"
        onClick={() => !notification.read && onRead(notification._id)}
        className={`flex w-full flex-col gap-1 rounded-lg px-3 py-2 text-left transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500 dark:hover:bg-zinc-800 ${
          notification.read ? 'opacity-60' : ''
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${notificationToneBadgeClass(tone)}`}
          >
            {notification.type.replace('_', ' ')}
          </span>
          <span className="shrink-0 text-[11px] text-zinc-500 dark:text-zinc-400">
            {formatRelativeTime(notification.createdAt)}
          </span>
        </div>
        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
          {notification.title}
        </p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">{notification.message}</p>
      </button>
    </li>
  );
}

export function NotificationCenter() {
  useRealtimeSync();

  const [open, setOpen] = useState(false);
  const [pushPermission, setPushPermission] =
    useState<NotificationPermission>(() =>
      typeof window !== 'undefined' && 'Notification' in window
        ? Notification.permission
        : 'default',
    );
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: unread } = useUnreadNotificationCount();
  const { data: notifications, isLoading } = useNotifications();
  const markAsRead = useMarkNotificationRead();
  const markAllAsRead = useMarkAllNotificationsRead();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = unread?.count ?? 0;

  async function handleEnablePush() {
    const permission = await requestPushPermission();
    setPushPermission(permission);
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        onClick={() => setOpen((o) => !o)}
        className="relative flex h-9 w-9 items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
      >
        <svg
          aria-hidden="true"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0a3 3 0 11-6 0m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span
            aria-hidden="true"
            className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white"
          >
            {formatUnreadBadge(unreadCount)}
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Notifications"
          className="absolute right-0 z-20 mt-2 w-80 rounded-xl border border-zinc-200 bg-surface shadow-lg dark:border-zinc-800"
        >
          <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">Notifications</p>
            <button
              type="button"
              onClick={() => markAllAsRead.mutate()}
              disabled={unreadCount === 0 || markAllAsRead.isPending}
              className="rounded text-xs font-medium text-indigo-600 hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-40 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              Mark all read
            </button>
          </div>

          {pushPermission !== 'granted' && (
            <div className="border-b border-zinc-100 px-4 py-2 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => void handleEnablePush()}
                className="rounded text-xs font-medium text-zinc-500 hover:text-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-zinc-400 dark:hover:text-zinc-200"
              >
                Enable push notifications
              </button>
            </div>
          )}

          <div className="max-h-80 overflow-y-auto p-2">
            {isLoading && (
              <p className="px-3 py-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
                Loading…
              </p>
            )}
            {!isLoading && (notifications ?? []).length === 0 && (
              <p className="px-3 py-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
                You&apos;re all caught up.
              </p>
            )}
            {!isLoading && notifications && notifications.length > 0 && (
              <ul role="list" className="space-y-1">
                {notifications.map((notification) => (
                  <NotificationRow
                    key={notification._id}
                    notification={notification}
                    onRead={(id) => markAsRead.mutate(id)}
                  />
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
