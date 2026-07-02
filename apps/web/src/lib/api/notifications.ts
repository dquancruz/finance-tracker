import type { INotification } from '@finance-tracker/shared';
import { apiClient } from '../api-client';

export function fetchNotifications(token?: string): Promise<INotification[]> {
  return apiClient<INotification[]>('/notifications', undefined, token);
}

export function fetchUnreadNotificationCount(
  token?: string,
): Promise<{ count: number }> {
  return apiClient<{ count: number }>(
    '/notifications/unread-count',
    undefined,
    token,
  );
}

export function markNotificationRead(
  id: string,
  token?: string,
): Promise<INotification> {
  return apiClient<INotification>(
    `/notifications/${id}/read`,
    { method: 'PATCH' },
    token,
  );
}

export function markAllNotificationsRead(
  token?: string,
): Promise<{ modified: number }> {
  return apiClient<{ modified: number }>(
    '/notifications/read-all',
    { method: 'PATCH' },
    token,
  );
}
