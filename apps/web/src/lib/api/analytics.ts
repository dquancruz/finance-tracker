import type {
  IBudgetStatus,
  ICategorySpend,
  IDashboardSummary,
  IMonthlyTrend,
  IUpcomingItem,
} from '@finance-tracker/shared';
import { apiClient } from '../api-client';

export function fetchDashboardSummary(
  displayCurrency?: string,
  token?: string,
): Promise<IDashboardSummary> {
  const qs = displayCurrency
    ? `?displayCurrency=${encodeURIComponent(displayCurrency)}`
    : '';
  return apiClient<IDashboardSummary>(`/analytics/summary${qs}`, undefined, token);
}

export function fetchCategoryBreakdown(
  params: { year?: number; month?: number } = {},
  token?: string,
): Promise<ICategorySpend[]> {
  const query = new URLSearchParams();
  if (params.year) query.set('year', String(params.year));
  if (params.month) query.set('month', String(params.month));
  const qs = query.toString();

  return apiClient<ICategorySpend[]>(
    `/analytics/category-breakdown${qs ? `?${qs}` : ''}`,
    undefined,
    token,
  );
}

export function fetchMonthlyTrends(
  months?: number,
  token?: string,
): Promise<IMonthlyTrend[]> {
  const qs = months ? `?months=${months}` : '';
  return apiClient<IMonthlyTrend[]>(
    `/analytics/monthly-trends${qs}`,
    undefined,
    token,
  );
}

export function fetchBudgetStatus(token?: string): Promise<IBudgetStatus[]> {
  return apiClient<IBudgetStatus[]>(
    '/analytics/budget-status',
    undefined,
    token,
  );
}

export function fetchUpcomingPayments(
  days?: number,
  token?: string,
): Promise<IUpcomingItem[]> {
  const qs = days ? `?days=${days}` : '';
  return apiClient<IUpcomingItem[]>(
    `/analytics/upcoming-payments${qs}`,
    undefined,
    token,
  );
}
