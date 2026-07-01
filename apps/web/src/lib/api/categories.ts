import type { ICategory } from '@finance-tracker/shared';
import { apiClient } from '../api-client';

export interface CreateCategoryInput {
  name: string;
  icon: string;
  color: string;
  budgetLimit?: number;
  budgetPeriod?: 'monthly' | 'yearly';
}

export type UpdateCategoryInput = Partial<CreateCategoryInput>;

export function fetchCategories(token?: string): Promise<ICategory[]> {
  return apiClient<ICategory[]>('/categories', undefined, token);
}

export function createCategory(
  input: CreateCategoryInput,
  token?: string,
): Promise<ICategory> {
  return apiClient<ICategory>(
    '/categories',
    { method: 'POST', body: JSON.stringify(input) },
    token,
  );
}

export function updateCategory(
  id: string,
  input: UpdateCategoryInput,
  token?: string,
): Promise<ICategory> {
  return apiClient<ICategory>(
    `/categories/${id}`,
    { method: 'PATCH', body: JSON.stringify(input) },
    token,
  );
}

export function deleteCategory(id: string, token?: string): Promise<ICategory> {
  return apiClient<ICategory>(`/categories/${id}`, { method: 'DELETE' }, token);
}
