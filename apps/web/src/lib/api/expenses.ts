import type {
  IExpense,
  InterestType,
  RecurringFrequency,
} from '@finance-tracker/shared';
import { apiClient } from '../api-client';
import { buildExpenseQueryString, type ExpenseFilters } from '../expense-query';

export interface PaginatedExpenses {
  data: IExpense[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface BaseExpenseInput {
  categoryId: string;
  currency?: string;
  notes?: string;
}

export interface CreateSimpleExpenseInput extends BaseExpenseInput {
  type: 'simple';
  amount: number;
  date: string;
}

export interface CreateRecurringExpenseInput extends BaseExpenseInput {
  type: 'recurring';
  description: string;
  amount: number;
  frequency: RecurringFrequency;
  startDate: string;
  endDate?: string;
}

export interface CreateInstallmentExpenseInput extends BaseExpenseInput {
  type: 'installment';
  description: string;
  totalAmount: number;
  numInstallments: number;
  interestRate?: number;
  interestType?: InterestType;
  startDate: string;
}

export type CreateExpenseInput =
  | CreateSimpleExpenseInput
  | CreateRecurringExpenseInput
  | CreateInstallmentExpenseInput;

export type UpdateExpenseInput = Partial<
  BaseExpenseInput & {
    amount: number;
    date: string;
    description: string;
    frequency: RecurringFrequency;
    endDate: string;
    isActive: boolean;
    interestRate: number;
    interestType: InterestType;
  }
>;

export function fetchExpenses(
  filters: ExpenseFilters,
  token?: string,
): Promise<PaginatedExpenses> {
  return apiClient<PaginatedExpenses>(
    `/expenses${buildExpenseQueryString(filters)}`,
    undefined,
    token,
  );
}

export function fetchExpense(id: string, token?: string): Promise<IExpense> {
  return apiClient<IExpense>(`/expenses/${id}`, undefined, token);
}

export function createExpense(
  input: CreateExpenseInput,
  token?: string,
): Promise<IExpense> {
  return apiClient<IExpense>(
    '/expenses',
    { method: 'POST', body: JSON.stringify(input) },
    token,
  );
}

export function updateExpense(
  id: string,
  input: UpdateExpenseInput,
  token?: string,
): Promise<IExpense> {
  return apiClient<IExpense>(
    `/expenses/${id}`,
    { method: 'PATCH', body: JSON.stringify(input) },
    token,
  );
}

export function deleteExpense(id: string, token?: string): Promise<IExpense> {
  return apiClient<IExpense>(`/expenses/${id}`, { method: 'DELETE' }, token);
}

export function payInstallment(
  id: string,
  installmentNumber: number,
  paidAmount: number | undefined,
  token?: string,
): Promise<IExpense> {
  return apiClient<IExpense>(
    `/expenses/${id}/installments/${installmentNumber}/pay`,
    { method: 'POST', body: JSON.stringify({ paidAmount }) },
    token,
  );
}

export function payRecurringOccurrence(
  id: string,
  token?: string,
): Promise<IExpense> {
  return apiClient<IExpense>(
    `/expenses/${id}/recurring/pay`,
    { method: 'POST' },
    token,
  );
}

export function fetchUpcomingRecurring(
  withinDays: number | undefined,
  token?: string,
): Promise<Array<IExpense & { daysUntilDue: number }>> {
  const query = withinDays ? `?withinDays=${withinDays}` : '';
  return apiClient<Array<IExpense & { daysUntilDue: number }>>(
    `/expenses/recurring/upcoming${query}`,
    undefined,
    token,
  );
}
