/**
 * Thin wrapper over the browser Notification API. Every function is a safe
 * no-op outside a browser (SSR, tests) or when the API isn't supported.
 */

/** Requests permission to show notifications; idempotent once a decision has been made. */
export async function requestPushPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  if (Notification.permission === 'default') {
    return Notification.requestPermission();
  }
  return Notification.permission;
}

export function hasPushPermission(): boolean {
  return (
    typeof window !== 'undefined' &&
    'Notification' in window &&
    Notification.permission === 'granted'
  );
}

/**
 * Shows a native OS-level notification for real-time alerts (budget
 * overruns, upcoming payments). Only fires when permission is granted and
 * the tab isn't already focused, so it doesn't duplicate the in-app
 * notification center.
 */
export function showPushNotification(title: string, body: string): void {
  if (!hasPushPermission()) return;
  if (document.visibilityState === 'visible' && document.hasFocus()) return;

  new Notification(title, { body, icon: '/favicon.ico' });
}
