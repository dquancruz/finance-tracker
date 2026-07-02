import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsService } from '../analytics/analytics.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { UsersService } from '../users/users.service';
import { NotificationsProcessor } from './notifications.processor';
import { NotificationsService } from './notifications.service';

describe('NotificationsProcessor', () => {
  let processor: NotificationsProcessor;
  let usersService: { findAllActive: jest.Mock };
  let analyticsService: {
    getBudgetStatus: jest.Mock;
    getUpcomingPayments: jest.Mock;
  };
  let notificationsService: {
    create: jest.Mock;
    existsRecent: jest.Mock;
  };
  let realtimeGateway: {
    emitBudgetAlert: jest.Mock;
    emitRecurringDueSoon: jest.Mock;
  };

  beforeEach(async () => {
    usersService = {
      findAllActive: jest
        .fn()
        .mockResolvedValue([{ _id: { toString: () => 'user-1' } }]),
    };
    analyticsService = {
      getBudgetStatus: jest.fn().mockResolvedValue([]),
      getUpcomingPayments: jest.fn().mockResolvedValue([]),
    };
    notificationsService = {
      create: jest.fn().mockResolvedValue({ _id: 'notif-1' }),
      existsRecent: jest.fn().mockResolvedValue(false),
    };
    realtimeGateway = {
      emitBudgetAlert: jest.fn(),
      emitRecurringDueSoon: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsProcessor,
        { provide: UsersService, useValue: usersService },
        { provide: AnalyticsService, useValue: analyticsService },
        { provide: NotificationsService, useValue: notificationsService },
        { provide: RealtimeGateway, useValue: realtimeGateway },
      ],
    }).compile();

    processor = module.get<NotificationsProcessor>(NotificationsProcessor);
  });

  it('creates a budget_overrun notification when a category is at/over 100%', async () => {
    analyticsService.getBudgetStatus.mockResolvedValue([
      {
        categoryId: 'cat-1',
        categoryName: 'Groceries',
        budgetLimit: 100,
        spent: 120,
        remaining: -20,
        percentage: 120,
      },
    ]);

    await processor.handleChecks();

    expect(notificationsService.create).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({ type: 'budget_overrun' }),
    );
    expect(realtimeGateway.emitBudgetAlert).toHaveBeenCalledWith('user-1', {
      _id: 'notif-1',
    });
  });

  it('skips categories under budget', async () => {
    analyticsService.getBudgetStatus.mockResolvedValue([
      {
        categoryId: 'cat-1',
        categoryName: 'Groceries',
        budgetLimit: 100,
        spent: 50,
        remaining: 50,
        percentage: 50,
      },
    ]);

    await processor.handleChecks();

    expect(notificationsService.create).not.toHaveBeenCalled();
  });

  it('does not re-notify a budget overrun already alerted within the dedupe window', async () => {
    analyticsService.getBudgetStatus.mockResolvedValue([
      {
        categoryId: 'cat-1',
        categoryName: 'Groceries',
        budgetLimit: 100,
        spent: 120,
        remaining: -20,
        percentage: 120,
      },
    ]);
    notificationsService.existsRecent.mockResolvedValue(true);

    await processor.handleChecks();

    expect(notificationsService.create).not.toHaveBeenCalled();
  });

  it('creates a payment_due notification for payments due within the window', async () => {
    analyticsService.getUpcomingPayments.mockResolvedValue([
      {
        expenseId: 'exp-1',
        description: 'Netflix',
        amount: 15,
        dueDate: new Date(),
        daysUntilDue: 1,
        type: 'recurring',
      },
    ]);

    await processor.handleChecks();

    expect(notificationsService.create).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({ type: 'payment_due' }),
    );
    expect(realtimeGateway.emitRecurringDueSoon).toHaveBeenCalledWith(
      'user-1',
      { _id: 'notif-1' },
    );
  });

  it('ignores payments further out than the alert window', async () => {
    analyticsService.getUpcomingPayments.mockResolvedValue([
      {
        expenseId: 'exp-1',
        description: 'Netflix',
        amount: 15,
        dueDate: new Date(),
        daysUntilDue: 10,
        type: 'recurring',
      },
    ]);

    await processor.handleChecks();

    expect(notificationsService.create).not.toHaveBeenCalled();
  });
});
