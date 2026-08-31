export type BudgetPeriod = 'monthly' | 'yearly';

export interface ICategory {
  _id: string;
  userId: string | null;
  name: string;
  icon: string;
  color: string;
  budgetLimit?: number;
  budgetPeriod?: BudgetPeriod;
  /** ISO 4217 code the budget was entered in (defaults to USD for legacy rows). */
  budgetCurrency?: string;
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface ICategoryWithBudgetStatus extends ICategory {
  spent: number;
  percentage: number;
}

export const SYSTEM_CATEGORIES: Array<Pick<ICategory, 'name' | 'icon' | 'color'>> = [
  { name: 'Food & Dining',   icon: '🍔', color: '#EF4444' },
  { name: 'Transport',       icon: '🚗', color: '#F97316' },
  { name: 'Entertainment',   icon: '🎬', color: '#8B5CF6' },
  { name: 'Health',          icon: '❤️', color: '#EC4899' },
  { name: 'Utilities',       icon: '💡', color: '#F59E0B' },
  { name: 'Housing',         icon: '🏠', color: '#10B981' },
  { name: 'Shopping',        icon: '🛍️', color: '#3B82F6' },
  { name: 'Education',       icon: '📚', color: '#6366F1' },
  { name: 'Travel',          icon: '✈️', color: '#14B8A6' },
  { name: 'Personal Care',   icon: '💆', color: '#A78BFA' },
  { name: 'Other',           icon: '📦', color: '#6B7280' },
];
