'use client';

import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import {
  fetchBudgetStatus,
  fetchCategoryBreakdown,
  fetchDashboardSummary,
  fetchMonthlyTrends,
  fetchUpcomingPayments,
} from '../api/analytics';

const ANALYTICS_KEY = ['analytics'] as const;

export function useDashboardSummary() {
  const { data: session } = useSession();
  const token = session?.accessToken;

  return useQuery({
    queryKey: [...ANALYTICS_KEY, 'summary'],
    queryFn: () => fetchDashboardSummary(token),
    enabled: Boolean(token),
  });
}

export function useCategoryBreakdown(params: { year?: number; month?: number } = {}) {
  const { data: session } = useSession();
  const token = session?.accessToken;

  return useQuery({
    queryKey: [...ANALYTICS_KEY, 'category-breakdown', params],
    queryFn: () => fetchCategoryBreakdown(params, token),
    enabled: Boolean(token),
  });
}

export function useMonthlyTrends(months?: number) {
  const { data: session } = useSession();
  const token = session?.accessToken;

  return useQuery({
    queryKey: [...ANALYTICS_KEY, 'monthly-trends', months],
    queryFn: () => fetchMonthlyTrends(months, token),
    enabled: Boolean(token),
  });
}

export function useBudgetStatus() {
  const { data: session } = useSession();
  const token = session?.accessToken;

  return useQuery({
    queryKey: [...ANALYTICS_KEY, 'budget-status'],
    queryFn: () => fetchBudgetStatus(token),
    enabled: Boolean(token),
  });
}

export function useUpcomingPayments(days?: number) {
  const { data: session } = useSession();
  const token = session?.accessToken;

  return useQuery({
    queryKey: [...ANALYTICS_KEY, 'upcoming-payments', days],
    queryFn: () => fetchUpcomingPayments(days, token),
    enabled: Boolean(token),
  });
}
