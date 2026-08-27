"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import {
  fetchBudgetStatus,
  fetchCategoryBreakdown,
  fetchDashboardSummary,
  fetchMonthlyTrends,
  fetchUpcomingPayments,
} from "../api/analytics";

const ANALYTICS_KEY = ["analytics"] as const;

export function useDashboardSummary() {
  const { data: session } = useSession();
  const token = session?.accessToken;
  const identity = session?.user?.email;

  return useQuery({
    queryKey: [...ANALYTICS_KEY, identity, "summary"],
    queryFn: () => fetchDashboardSummary(token),
    enabled: Boolean(token),
  });
}

export function useCategoryBreakdown(
  params: { year?: number; month?: number } = {},
) {
  const { data: session } = useSession();
  const token = session?.accessToken;
  const identity = session?.user?.email;

  return useQuery({
    queryKey: [...ANALYTICS_KEY, identity, "category-breakdown", params],
    queryFn: () => fetchCategoryBreakdown(params, token),
    enabled: Boolean(token),
  });
}

export function useMonthlyTrends(months?: number) {
  const { data: session } = useSession();
  const token = session?.accessToken;
  const identity = session?.user?.email;

  return useQuery({
    queryKey: [...ANALYTICS_KEY, identity, "monthly-trends", months],
    queryFn: () => fetchMonthlyTrends(months, token),
    enabled: Boolean(token),
  });
}

export function useBudgetStatus() {
  const { data: session } = useSession();
  const token = session?.accessToken;
  const identity = session?.user?.email;

  return useQuery({
    queryKey: [...ANALYTICS_KEY, identity, "budget-status"],
    queryFn: () => fetchBudgetStatus(token),
    enabled: Boolean(token),
  });
}

export function useUpcomingPayments(days?: number) {
  const { data: session } = useSession();
  const token = session?.accessToken;
  const identity = session?.user?.email;

  return useQuery({
    queryKey: [...ANALYTICS_KEY, identity, "upcoming-payments", days],
    queryFn: () => fetchUpcomingPayments(days, token),
    enabled: Boolean(token),
  });
}
