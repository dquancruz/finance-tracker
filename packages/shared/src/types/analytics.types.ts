export interface ICategorySpend {
  categoryId: string;
  categoryName: string;
  color: string;
  amount: number;
  percentage: number;
}

export interface IBudgetStatus {
  categoryId: string;
  categoryName: string;
  budgetLimit: number;
  spent: number;
  remaining: number;
  percentage: number;
}

export interface IMonthlyTrend {
  month: string;
  total: number;
  breakdown: ICategorySpend[];
}

export interface IUpcomingItem {
  expenseId: string;
  description: string;
  amount: number;
  currency: string;
  dueDate: Date;
  daysUntilDue: number;
  type: 'recurring' | 'installment';
}

export interface IDashboardSummary {
  totalThisMonth: number;
  totalLastMonth: number;
  monthOverMonthChange: number;
  categoryBreakdown: ICategorySpend[];
  budgetStatus: IBudgetStatus[];
  upcomingPayments: IUpcomingItem[];
  monthlyTrends: IMonthlyTrend[];
}
