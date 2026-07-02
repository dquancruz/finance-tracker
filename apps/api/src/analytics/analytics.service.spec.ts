import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { AnalyticsService } from './analytics.service';
import { CategoriesService } from '../categories/categories.service';
import { Expense } from '../expenses/schemas/expense.schema';

function buildCategory(overrides: Record<string, unknown> = {}) {
  return {
    _id: { toString: () => 'cat-1' },
    name: 'Food & Dining',
    color: '#EF4444',
    budgetLimit: undefined,
    budgetPeriod: undefined,
    ...overrides,
  };
}

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let expenseModelMock: {
    aggregate: jest.Mock;
    find: jest.Mock;
  };
  let categoriesServiceMock: { findAllForUser: jest.Mock };

  beforeEach(async () => {
    expenseModelMock = {
      aggregate: jest.fn(),
      find: jest.fn(),
    };
    categoriesServiceMock = {
      findAllForUser: jest.fn().mockResolvedValue([buildCategory()]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        { provide: getModelToken(Expense.name), useValue: expenseModelMock },
        { provide: CategoriesService, useValue: categoriesServiceMock },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);

    jest.useFakeTimers().setSystemTime(new Date(2026, 0, 15));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('getCategoryBreakdown', () => {
    it('maps category name/color and computes percentages of the total', async () => {
      expenseModelMock.aggregate.mockReturnValue({
        exec: jest.fn().mockResolvedValue([
          { _id: 'cat-1', amount: 75 },
          { _id: 'unknown-cat', amount: 25 },
        ]),
      });

      const result = await service.getCategoryBreakdown('user-1');

      expect(result).toEqual([
        {
          categoryId: 'cat-1',
          categoryName: 'Food & Dining',
          color: '#EF4444',
          amount: 75,
          percentage: 75,
        },
        {
          categoryId: 'unknown-cat',
          categoryName: 'Uncategorized',
          color: '#6B7280',
          amount: 25,
          percentage: 25,
        },
      ]);
    });

    it('returns an empty array when there is no spend', async () => {
      expenseModelMock.aggregate.mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      });

      const result = await service.getCategoryBreakdown('user-1', {
        year: 2026,
        month: 1,
      });

      expect(result).toEqual([]);
    });
  });

  describe('getBudgetStatus', () => {
    it('returns nothing when no category has a budget limit', async () => {
      const result = await service.getBudgetStatus('user-1');
      expect(result).toEqual([]);
      expect(expenseModelMock.aggregate).not.toHaveBeenCalled();
    });

    it('computes spent/remaining/percentage for monthly-budgeted categories', async () => {
      categoriesServiceMock.findAllForUser.mockResolvedValue([
        buildCategory({ budgetLimit: 200, budgetPeriod: 'monthly' }),
      ]);
      expenseModelMock.aggregate
        .mockReturnValueOnce({
          exec: jest.fn().mockResolvedValue([{ _id: 'cat-1', amount: 150 }]),
        })
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue([]) });

      const result = await service.getBudgetStatus('user-1');

      expect(result).toEqual([
        {
          categoryId: 'cat-1',
          categoryName: 'Food & Dining',
          budgetLimit: 200,
          spent: 150,
          remaining: 50,
          percentage: 75,
        },
      ]);
    });

    it('reads from the yearly aggregate when budgetPeriod is yearly', async () => {
      categoriesServiceMock.findAllForUser.mockResolvedValue([
        buildCategory({ budgetLimit: 1200, budgetPeriod: 'yearly' }),
      ]);
      expenseModelMock.aggregate
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue([]) })
        .mockReturnValueOnce({
          exec: jest.fn().mockResolvedValue([{ _id: 'cat-1', amount: 1300 }]),
        });

      const result = await service.getBudgetStatus('user-1');

      expect(result[0].spent).toBe(1300);
      expect(result[0].remaining).toBe(-100);
      expect(result[0].percentage).toBeCloseTo(108.33, 1);
    });
  });

  describe('getUpcomingPayments', () => {
    it('combines recurring and unpaid installment rows, sorted by due date', async () => {
      expenseModelMock.find
        .mockReturnValueOnce({
          exec: jest.fn().mockResolvedValue([
            {
              _id: { toString: () => 'exp-recurring' },
              description: 'Netflix',
              amount: 15,
              nextDueDate: new Date(2026, 0, 20),
            },
          ]),
        })
        .mockReturnValueOnce({
          exec: jest.fn().mockResolvedValue([
            {
              _id: { toString: () => 'exp-installment' },
              description: 'Laptop',
              paymentSchedule: [
                {
                  installmentNumber: 1,
                  dueDate: new Date(2026, 0, 18),
                  totalDue: 100,
                  paidAt: undefined,
                },
                {
                  installmentNumber: 2,
                  dueDate: new Date(2026, 1, 18),
                  totalDue: 100,
                  paidAt: undefined,
                },
                {
                  installmentNumber: 3,
                  dueDate: new Date(2026, 0, 10),
                  totalDue: 100,
                  paidAt: new Date(2026, 0, 10),
                },
              ],
            },
          ]),
        });

      const result = await service.getUpcomingPayments('user-1', 30);

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        expenseId: 'exp-installment',
        description: 'Laptop (#1)',
        amount: 100,
        type: 'installment',
      });
      expect(result[1]).toMatchObject({
        expenseId: 'exp-recurring',
        description: 'Netflix',
        amount: 15,
        type: 'recurring',
      });
    });
  });

  describe('getSummary', () => {
    it('computes month-over-month change and assembles every widget', async () => {
      categoriesServiceMock.findAllForUser.mockResolvedValue([
        buildCategory({ budgetLimit: 200, budgetPeriod: 'monthly' }),
      ]);
      expenseModelMock.aggregate.mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      });
      expenseModelMock.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      });

      const result = await service.getSummary('user-1');

      expect(result.totalThisMonth).toBe(0);
      expect(result.totalLastMonth).toBe(0);
      expect(result.monthOverMonthChange).toBe(0);
      expect(result.monthlyTrends).toHaveLength(6);
      expect(result.upcomingPayments).toEqual([]);
      expect(result.budgetStatus).toHaveLength(1);
    });

    it('reports a 100% increase when last month had no spend at all', async () => {
      expenseModelMock.aggregate
        .mockReturnValueOnce({
          exec: jest.fn().mockResolvedValue([{ _id: 'cat-1', amount: 50 }]),
        })
        .mockReturnValueOnce({ exec: jest.fn().mockResolvedValue([]) })
        .mockReturnValue({ exec: jest.fn().mockResolvedValue([]) });
      expenseModelMock.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      });

      const result = await service.getSummary('user-1');

      expect(result.totalThisMonth).toBe(50);
      expect(result.totalLastMonth).toBe(0);
      expect(result.monthOverMonthChange).toBe(100);
    });
  });
});
