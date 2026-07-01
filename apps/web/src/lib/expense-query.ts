import type { ExpenseType } from '@finance-tracker/shared';

export interface ExpenseFilters {
  type?: ExpenseType | '';
  categoryId?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'date' | 'amount' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

/** Builds a `?a=b&c=d` query string from expense filters, omitting empty values. */
export function buildExpenseQueryString(filters: ExpenseFilters): string {
  const params = new URLSearchParams();

  if (filters.type) params.set('type', filters.type);
  if (filters.categoryId) params.set('categoryId', filters.categoryId);
  if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
  if (filters.dateTo) params.set('dateTo', filters.dateTo);
  if (filters.sortBy) params.set('sortBy', filters.sortBy);
  if (filters.sortOrder) params.set('sortOrder', filters.sortOrder);
  if (filters.page) params.set('page', String(filters.page));
  if (filters.limit) params.set('limit', String(filters.limit));

  const query = params.toString();
  return query ? `?${query}` : '';
}
