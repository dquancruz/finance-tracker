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
    createDeduped: jest.Mock;
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
      createDeduped: jest
        .fn()
        .mockResolvedValue({ notification: { _id: 'notif-1' }, created: true }),
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

    const [userIdArg, inputArg] = notificationsService.createDeduped.mock
      .calls[0] as [string, { type: string; dedupeKey: string }];
    expect(userIdArg).toBe('user-1');
    expect(inputArg.type).toBe('budget_overrun');
    expect(inputArg.dedupeKey).toContain('budget:cat-1:');
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

    expect(notificationsService.createDeduped).not.toHaveBeenCalled();
  });

  it('does not push a real-time alert when the dedupe key already exists', async () => {
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
    notificationsService.createDeduped.mockResolvedValue({
      notification: { _id: 'notif-1' },
      created: false,
    });

    await processor.handleChecks();

    expect(notificationsService.createDeduped).toHaveBeenCalled();
    expect(realtimeGateway.emitBudgetAlert).not.toHaveBeenCalled();
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

    const [userIdArg, inputArg] = notificationsService.createDeduped.mock
      .calls[0] as [string, { type: string; dedupeKey: string }];
    expect(userIdArg).toBe('user-1');
    expect(inputArg.type).toBe('payment_due');
    expect(inputArg.dedupeKey).toContain('payment:exp-1:');
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

    expect(notificationsService.createDeduped).not.toHaveBeenCalled();
  });

  it('skips a run entirely if the previous one is still in progress (overlap guard)', async () => {
    let resolveFirstRun: () => void = () => {};
    const firstRunGate = new Promise<void>((resolve) => {
      resolveFirstRun = resolve;
    });
    usersService.findAllActive.mockImplementationOnce(async () => {
      await firstRunGate;
      return [];
    });

    const firstRun = processor.handleChecks();
    const secondRun = processor.handleChecks(); // should be skipped, no-op

    resolveFirstRun();
    await Promise.all([firstRun, secondRun]);

    // findAllActive should only have been invoked once (the first run) —
    // the second call returned early without querying anything.
    expect(usersService.findAllActive).toHaveBeenCalledTimes(1);
  });
});
