import type { NotificationType } from '@finance-tracker/shared';

/** Formats how long ago a date was, e.g. "Just now", "5m ago", "3h ago", "2d ago". */
export function formatRelativeTime(
  date: string | Date,
  now: Date = new Date(),
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const diffMinutes = Math.floor((now.getTime() - d.getTime()) / 60000);

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

/** Caps the unread-count badge at "9+"; returns an empty string when there's nothing to show. */
export function formatUnreadBadge(count: number): string {
  if (count <= 0) return '';
  return count > 9 ? '9+' : String(count);
}

export type NotificationTone = 'alert' | 'warning' | 'info';

const NOTIFICATION_TONE: Record<NotificationType, NotificationTone> = {
  budget_overrun: 'alert',
  payment_due: 'warning',
  system: 'info',
};

/** Maps a notification's domain type to a display tone. */
export function notificationTone(type: NotificationType): NotificationTone {
  return NOTIFICATION_TONE[type] ?? 'info';
}

const TONE_BADGE_CLASSES: Record<NotificationTone, string> = {
  alert: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400',
  warning: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400',
  info: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300',
};

/** Tailwind badge classes matching a notification tone. */
export function notificationToneBadgeClass(tone: NotificationTone): string {
  return TONE_BADGE_CLASSES[tone];
}
