import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { AnalyticsService } from './analytics.service';
import { CategoriesService } from '../categories/categories.service';
import { ExchangeRatesService } from '../exchange-rates/exchange-rates.service';
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

function mockExpenseFind(
  expenseModelMock: { find: jest.Mock },
  expenses: Array<{
    categoryId: string;
    amount: number;
    currency?: string;
  }>,
) {
  expenseModelMock.find.mockReturnValue({
    select: jest.fn().mockReturnValue({
      lean: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(expenses),
      }),
    }),
    exec: jest.fn().mockResolvedValue([]),
  });
}

function mockEmptyExpenseQueries(expenseModelMock: { find: jest.Mock }) {
  mockExpenseFind(expenseModelMock, []);
}

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let expenseModelMock: {
    find: jest.Mock;
  };
  let categoriesServiceMock: { findAllForUser: jest.Mock };
  let exchangeRatesServiceMock: { getRates: jest.Mock };

  beforeEach(async () => {
    expenseModelMock = {
      find: jest.fn(),
    };
    categoriesServiceMock = {
      findAllForUser: jest.fn().mockResolvedValue([buildCategory()]),
    };
    exchangeRatesServiceMock = {
      getRates: jest.fn().mockResolvedValue({ USD: 1, GTQ: 7.63, EUR: 0.86 }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        { provide: getModelToken(Expense.name), useValue: expenseModelMock },
        { provide: CategoriesService, useValue: categoriesServiceMock },
        { provide: ExchangeRatesService, useValue: exchangeRatesServiceMock },
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
      mockExpenseFind(expenseModelMock, [
        { categoryId: 'cat-1', amount: 75, currency: 'USD' },
        { categoryId: 'unknown-cat', amount: 25, currency: 'USD' },
      ]);

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

    it('converts foreign-currency expenses into the display currency', async () => {
      mockExpenseFind(expenseModelMock, [
        { categoryId: 'cat-1', amount: 100, currency: 'USD' },
        { categoryId: 'cat-1', amount: 763, currency: 'GTQ' },
      ]);

      const result = await service.getCategoryBreakdown('user-1', {
        displayCurrency: 'GTQ',
      });

      expect(result[0].amount).toBe(1526);
      expect(result[0].percentage).toBe(100);
    });

    it('returns an empty array when there is no spend', async () => {
      mockExpenseFind(expenseModelMock, []);

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
      expect(expenseModelMock.find).not.toHaveBeenCalled();
    });

    it('computes spent/remaining/percentage for monthly-budgeted categories', async () => {
      categoriesServiceMock.findAllForUser.mockResolvedValue([
        buildCategory({ budgetLimit: 200, budgetPeriod: 'monthly' }),
      ]);
      mockExpenseFind(expenseModelMock, [
        { categoryId: 'cat-1', amount: 150, currency: 'USD' },
      ]);

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
      expenseModelMock.find
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            lean: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue([]),
            }),
          }),
        })
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            lean: jest.fn().mockReturnValue({
              exec: jest
                .fn()
                .mockResolvedValue([
                  { categoryId: 'cat-1', amount: 1300, currency: 'USD' },
                ]),
            }),
          }),
        });

      const result = await service.getBudgetStatus('user-1');

      expect(result[0].spent).toBe(1300);
      expect(result[0].remaining).toBe(-100);
      expect(result[0].percentage).toBeCloseTo(108.33, 1);
    });

    it('converts budget limits into the display currency', async () => {
      categoriesServiceMock.findAllForUser.mockResolvedValue([
        buildCategory({
          budgetLimit: 100,
          budgetPeriod: 'monthly',
          budgetCurrency: 'USD',
        }),
      ]);
      mockExpenseFind(expenseModelMock, [
        { categoryId: 'cat-1', amount: 763, currency: 'GTQ' },
      ]);

      const result = await service.getBudgetStatus('user-1', undefined, 'GTQ');

      expect(result[0].budgetLimit).toBe(763);
      expect(result[0].spent).toBe(763);
      expect(result[0].remaining).toBe(0);
      expect(result[0].percentage).toBe(100);
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
              currency: 'USD',
              nextDueDate: new Date(2026, 0, 20),
            },
          ]),
        })
        .mockReturnValueOnce({
          exec: jest.fn().mockResolvedValue([
            {
              _id: { toString: () => 'exp-installment' },
              description: 'Laptop',
              currency: 'USD',
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
        currency: 'USD',
        type: 'installment',
      });
      expect(result[1]).toMatchObject({
        expenseId: 'exp-recurring',
        description: 'Netflix',
        amount: 15,
        currency: 'USD',
        type: 'recurring',
      });
    });
  });

  describe('getSummary', () => {
    it('computes month-over-month change and assembles every widget', async () => {
      categoriesServiceMock.findAllForUser.mockResolvedValue([
        buildCategory({ budgetLimit: 200, budgetPeriod: 'monthly' }),
      ]);
      mockEmptyExpenseQueries(expenseModelMock);

      const result = await service.getSummary('user-1');

      expect(result.totalThisMonth).toBe(0);
      expect(result.totalLastMonth).toBe(0);
      expect(result.monthOverMonthChange).toBe(0);
      expect(result.monthlyTrends).toHaveLength(6);
      expect(result.upcomingPayments).toEqual([]);
      expect(result.budgetStatus).toHaveLength(1);
    });

    it('reports a 100% increase when last month had no spend at all', async () => {
      let selectCalls = 0;
      expenseModelMock.find.mockImplementation(() => ({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockReturnValue({
            exec: jest.fn().mockImplementation(() => {
              selectCalls += 1;
              if (selectCalls === 1) {
                return Promise.resolve([
                  { categoryId: 'cat-1', amount: 50, currency: 'USD' },
                ]);
              }
              return Promise.resolve([]);
            }),
          }),
        }),
        exec: jest.fn().mockResolvedValue([]),
      }));

      const result = await service.getSummary('user-1');

      expect(result.totalThisMonth).toBe(50);
      expect(result.totalLastMonth).toBe(0);
      expect(result.monthOverMonthChange).toBe(100);
    });
  });
});
