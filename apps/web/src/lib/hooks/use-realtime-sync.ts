'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { INotification } from '@finance-tracker/shared';
import { showPushNotification } from '../push-notifications';
import { useSocket } from './use-socket';

const EXPENSES_KEY = ['expenses'] as const;
const ANALYTICS_KEY = ['analytics'] as const;
const NOTIFICATIONS_KEY = ['notifications'] as const;

/**
 * Wires the shared socket connection to the app's real-time behavior:
 *  - expense:created/updated/deleted, installment:paid → refetch expense lists
 *  - analytics:refresh (debounced server-side) → refetch dashboard data
 *  - budget:alert / recurring:due_soon → refresh the notification center and
 *    surface an OS push notification when the tab isn't focused
 *
 * Mount once near the root of the authenticated app (see the dashboard layout).
 */
export function useRealtimeSync(): void {
  const socket = useSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket) return;

    const invalidateExpenses = () =>
      void queryClient.invalidateQueries({ queryKey: EXPENSES_KEY });
    const invalidateAnalytics = () =>
      void queryClient.invalidateQueries({ queryKey: ANALYTICS_KEY });
    const handleNotification = (notification: INotification) => {
      void queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
      showPushNotification(notification.title, notification.message);
    };

    socket.on('expense:created', invalidateExpenses);
    socket.on('expense:updated', invalidateExpenses);
    socket.on('expense:deleted', invalidateExpenses);
    socket.on('installment:paid', invalidateExpenses);
    socket.on('analytics:refresh', invalidateAnalytics);
    socket.on('budget:alert', handleNotification);
    socket.on('recurring:due_soon', handleNotification);

    return () => {
      socket.off('expense:created', invalidateExpenses);
      socket.off('expense:updated', invalidateExpenses);
      socket.off('expense:deleted', invalidateExpenses);
      socket.off('installment:paid', invalidateExpenses);
      socket.off('analytics:refresh', invalidateAnalytics);
      socket.off('budget:alert', handleNotification);
      socket.off('recurring:due_soon', handleNotification);
    };
  }, [socket, queryClient]);
}
