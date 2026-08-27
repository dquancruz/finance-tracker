"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import {
  fetchNotifications,
  fetchUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
} from "../api/notifications";

const NOTIFICATIONS_KEY = ["notifications"] as const;

export function useNotifications() {
  const { data: session } = useSession();
  const token = session?.accessToken;
  const identity = session?.user?.email;

  return useQuery({
    queryKey: [...NOTIFICATIONS_KEY, identity, "list"],
    queryFn: () => fetchNotifications(token),
    enabled: Boolean(token),
  });
}

export function useUnreadNotificationCount() {
  const { data: session } = useSession();
  const token = session?.accessToken;
  const identity = session?.user?.email;

  return useQuery({
    queryKey: [...NOTIFICATIONS_KEY, identity, "unread-count"],
    queryFn: () => fetchUnreadNotificationCount(token),
    enabled: Boolean(token),
  });
}

export function useMarkNotificationRead() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => markNotificationRead(id, session?.accessToken),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => markAllNotificationsRead(session?.accessToken),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
    },
  });
}
