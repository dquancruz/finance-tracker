import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { daysUntilDue } from '@finance-tracker/finance-utils';
import type {
  IBudgetStatus,
  ICategorySpend,
  IDashboardSummary,
  IMonthlyTrend,
  IUpcomingItem,
} from '@finance-tracker/shared';
import { CategoriesService } from '../categories/categories.service';
import { CategoryDocument } from '../categories/schemas/category.schema';
import {
  AnyExpenseDocument,
  Expense,
  ExpenseDocument,
} from '../expenses/schemas/expense.schema';

interface CategorySpendRow {
  _id: string;
  amount: number;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function monthLabel(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(Expense.name)
    private readonly expenseModel: Model<ExpenseDocument>,
    private readonly categoriesService: CategoriesService,
  ) {}

  private async categoriesForUser(userId: string): Promise<CategoryDocument[]> {
    return this.categoriesService.findAllForUser(userId);
  }

  private categoryMap(
    categories: CategoryDocument[],
  ): Map<string, CategoryDocument> {
    return new Map(categories.map((c) => [c._id.toString(), c]));
  }

  private async aggregateCategorySpend(
    userId: string,
    start: Date,
    end: Date,
  ): Promise<CategorySpendRow[]> {
    return this.expenseModel
      .aggregate<CategorySpendRow>([
        {
          $match: {
            userId,
            deletedAt: { $exists: false },
            date: { $gte: start, $lt: end },
          },
        },
        { $group: { _id: '$categoryId', amount: { $sum: '$amount' } } },
      ])
      .exec();
  }

  private buildCategoryBreakdown(
    rows: CategorySpendRow[],
    categoryMap: Map<string, CategoryDocument>,
  ): ICategorySpend[] {
    const total = rows.reduce((sum, row) => sum + row.amount, 0);

    return rows
      .map((row) => {
        const category = categoryMap.get(row._id);
        return {
          categoryId: row._id,
          categoryName: category?.name ?? 'Uncategorized',
          color: category?.color ?? '#6B7280',
          amount: round2(row.amount),
          percentage: total > 0 ? round2((row.amount / total) * 100) : 0,
        };
      })
      .sort((a, b) => b.amount - a.amount);
  }

  /**
   * Spend by category for a given month (if `month` is provided) or the
   * whole calendar year otherwise. Defaults to the current year.
   */
  async getCategoryBreakdown(
    userId: string,
    options: { year?: number; month?: number } = {},
  ): Promise<ICategorySpend[]> {
    const now = new Date();
    const year = options.year ?? now.getFullYear();
    const start = options.month
      ? new Date(year, options.month - 1, 1)
      : new Date(year, 0, 1);
    const end = options.month
      ? new Date(year, options.month, 1)
      : new Date(year + 1, 0, 1);

    const [rows, categories] = await Promise.all([
      this.aggregateCategorySpend(userId, start, end),
      this.categoriesForUser(userId),
    ]);

    return this.buildCategoryBreakdown(rows, this.categoryMap(categories));
  }

  /** Monthly totals + per-category breakdown for the trailing N months (including the current one). */
  async getMonthlyTrends(
    userId: string,
    months = 6,
    categories?: CategoryDocument[],
  ): Promise<IMonthlyTrend[]> {
    const cats = categories ?? (await this.categoriesForUser(userId));
    const categoryMap = this.categoryMap(cats);

    const now = new Date();
    const monthStarts = Array.from(
      { length: months },
      (_, i) =>
        new Date(now.getFullYear(), now.getMonth() - (months - 1 - i), 1),
    );

    const rowsByMonth = await Promise.all(
      monthStarts.map((start) => {
        const end = new Date(start.getFullYear(), start.getMonth() + 1, 1);
        return this.aggregateCategorySpend(userId, start, end);
      }),
    );

    return monthStarts.map((start, i) => {
      const breakdown = this.buildCategoryBreakdown(
        rowsByMonth[i],
        categoryMap,
      );
      const total = round2(breakdown.reduce((sum, c) => sum + c.amount, 0));
      return { month: monthLabel(start), total, breakdown };
    });
  }

  /** Budget vs. actual for every category that has a `budgetLimit` set. */
  async getBudgetStatus(
    userId: string,
    categories?: CategoryDocument[],
  ): Promise<IBudgetStatus[]> {
    const cats = categories ?? (await this.categoriesForUser(userId));
    const budgeted = cats.filter((c) => c.budgetLimit != null);
    if (budgeted.length === 0) return [];

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const yearStart = new Date(now.getFullYear(), 0, 1);
    const yearEnd = new Date(now.getFullYear() + 1, 0, 1);

    const [monthlyRows, yearlyRows] = await Promise.all([
      this.aggregateCategorySpend(userId, monthStart, monthEnd),
      this.aggregateCategorySpend(userId, yearStart, yearEnd),
    ]);
    const monthlySpend = new Map(monthlyRows.map((r) => [r._id, r.amount]));
    const yearlySpend = new Map(yearlyRows.map((r) => [r._id, r.amount]));

    return budgeted.map((category) => {
      const id = category._id.toString();
      const spendMap =
        category.budgetPeriod === 'yearly' ? yearlySpend : monthlySpend;
      const spent = round2(spendMap.get(id) ?? 0);
      const budgetLimit = category.budgetLimit!;
      return {
        categoryId: id,
        categoryName: category.name,
        budgetLimit,
        spent,
        remaining: round2(budgetLimit - spent),
        percentage: budgetLimit > 0 ? round2((spent / budgetLimit) * 100) : 0,
      };
    });
  }

  /** Recurring + installment payments due within the next `withinDays` days. */
  async getUpcomingPayments(
    userId: string,
    withinDays = 30,
  ): Promise<IUpcomingItem[]> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + withinDays);

    const [recurring, installments] = await Promise.all([
      this.expenseModel
        .find({
          userId,
          type: 'recurring',
          isActive: true,
          deletedAt: { $exists: false },
          nextDueDate: { $lte: cutoff },
        })
        .exec(),
      this.expenseModel
        .find({ userId, type: 'installment', deletedAt: { $exists: false } })
        .exec(),
    ]);

    const recurringItems: IUpcomingItem[] = (
      recurring as AnyExpenseDocument[]
    ).map((expense) => ({
      expenseId: expense._id.toString(),
      description: expense.description ?? 'Recurring expense',
      amount: expense.amount,
      dueDate: expense.nextDueDate!,
      daysUntilDue: daysUntilDue(expense.nextDueDate!),
      type: 'recurring',
    }));

    const installmentItems: IUpcomingItem[] = (
      installments as AnyExpenseDocument[]
    ).flatMap((expense) =>
      (expense.paymentSchedule ?? [])
        .filter(
          (row) => !row.paidAt && row.dueDate.getTime() <= cutoff.getTime(),
        )
        .map((row) => ({
          expenseId: expense._id.toString(),
          description: `${expense.description ?? 'Installment'} (#${row.installmentNumber})`,
          amount: row.totalDue,
          dueDate: row.dueDate,
          daysUntilDue: daysUntilDue(row.dueDate),
          type: 'installment' as const,
        })),
    );

    return [...recurringItems, ...installmentItems].sort(
      (a, b) => a.dueDate.getTime() - b.dueDate.getTime(),
    );
  }

  /** Aggregated payload backing the dashboard — one call, every widget. */
  async getSummary(userId: string): Promise<IDashboardSummary> {
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = thisMonthStart;

    const categories = await this.categoriesForUser(userId);
    const categoryMap = this.categoryMap(categories);

    const [
      thisMonthRows,
      lastMonthRows,
      budgetStatus,
      upcomingPayments,
      monthlyTrends,
    ] = await Promise.all([
      this.aggregateCategorySpend(userId, thisMonthStart, thisMonthEnd),
      this.aggregateCategorySpend(userId, lastMonthStart, lastMonthEnd),
      this.getBudgetStatus(userId, categories),
      this.getUpcomingPayments(userId, 30),
      this.getMonthlyTrends(userId, 6, categories),
    ]);

    const categoryBreakdown = this.buildCategoryBreakdown(
      thisMonthRows,
      categoryMap,
    );
    const totalThisMonth = round2(
      categoryBreakdown.reduce((sum, c) => sum + c.amount, 0),
    );
    const totalLastMonth = round2(
      lastMonthRows.reduce((sum, r) => sum + r.amount, 0),
    );
    const monthOverMonthChange =
      totalLastMonth > 0
        ? round2(((totalThisMonth - totalLastMonth) / totalLastMonth) * 100)
        : totalThisMonth > 0
          ? 100
          : 0;

    return {
      totalThisMonth,
      totalLastMonth,
      monthOverMonthChange,
      categoryBreakdown,
      budgetStatus,
      upcomingPayments,
      monthlyTrends,
    };
  }
}
