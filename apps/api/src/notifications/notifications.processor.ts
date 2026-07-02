import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import type { IBudgetStatus, IUpcomingItem } from '@finance-tracker/shared';
import { AnalyticsService } from '../analytics/analytics.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { UsersService } from '../users/users.service';
import { NotificationsService } from './notifications.service';

/** Notifications are only re-sent for the same budget/payment after this many hours. */
const DEDUPE_WINDOW_HOURS = 24;
/** Only alert on payments due within this many days. */
const UPCOMING_PAYMENT_WINDOW_DAYS = 3;
/** Budget usage percentage at (or above) which a category counts as "over budget". */
const BUDGET_OVERRUN_THRESHOLD = 100;

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function formatAmount(amount: number): string {
  return amount.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  });
}

/**
 * Hourly job that scans every active user for budget overruns and
 * soon-due payments, creating a `Notification` and pushing it in
 * real time (`budget:alert` / `recurring:due_soon`) the first time it's
 * detected. Re-checks are deduped for `DEDUPE_WINDOW_HOURS`.
 */
@Injectable()
export class NotificationsProcessor {
  private readonly logger = new Logger(NotificationsProcessor.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly analyticsService: AnalyticsService,
    private readonly notificationsService: NotificationsService,
    private readonly realtimeGateway: RealtimeGateway,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async handleChecks(): Promise<void> {
    const users = await this.usersService.findAllActive();
    let created = 0;

    for (const user of users) {
      const userId = user._id.toString();
      created += await this.checkBudgetOverruns(userId);
      created += await this.checkUpcomingPayments(userId);
    }

    if (created > 0) {
      this.logger.log(`Created ${created} notification(s)`);
    }
  }

  private async checkBudgetOverruns(userId: string): Promise<number> {
    const budgetStatus = await this.analyticsService.getBudgetStatus(userId);
    const overruns = budgetStatus.filter(
      (b) => b.percentage >= BUDGET_OVERRUN_THRESHOLD,
    );

    let created = 0;
    for (const overrun of overruns) {
      created += (await this.notifyBudgetOverrun(userId, overrun)) ? 1 : 0;
    }
    return created;
  }

  private async notifyBudgetOverrun(
    userId: string,
    overrun: IBudgetStatus,
  ): Promise<boolean> {
    const dedupeKey = `budget:${overrun.categoryId}:${monthKey(new Date())}`;
    const alreadyNotified = await this.notificationsService.existsRecent(
      userId,
      dedupeKey,
      DEDUPE_WINDOW_HOURS,
    );
    if (alreadyNotified) return false;

    const notification = await this.notificationsService.create(userId, {
      type: 'budget_overrun',
      title: `Budget exceeded: ${overrun.categoryName}`,
      message: `You've spent ${formatAmount(overrun.spent)} of your ${formatAmount(
        overrun.budgetLimit,
      )} budget for ${overrun.categoryName} (${overrun.percentage.toFixed(0)}%).`,
      metadata: {
        dedupeKey,
        categoryId: overrun.categoryId,
        percentage: overrun.percentage,
      },
    });

    this.realtimeGateway.emitBudgetAlert(userId, notification);
    return true;
  }

  private async checkUpcomingPayments(userId: string): Promise<number> {
    const upcoming = await this.analyticsService.getUpcomingPayments(
      userId,
      UPCOMING_PAYMENT_WINDOW_DAYS,
    );
    const dueSoon = upcoming.filter(
      (item) =>
        item.daysUntilDue >= 0 &&
        item.daysUntilDue <= UPCOMING_PAYMENT_WINDOW_DAYS,
    );

    let created = 0;
    for (const item of dueSoon) {
      created += (await this.notifyPaymentDue(userId, item)) ? 1 : 0;
    }
    return created;
  }

  private async notifyPaymentDue(
    userId: string,
    item: IUpcomingItem,
  ): Promise<boolean> {
    const dueDateKey = new Date(item.dueDate).toISOString().slice(0, 10);
    const dedupeKey = `payment:${item.expenseId}:${dueDateKey}`;
    const alreadyNotified = await this.notificationsService.existsRecent(
      userId,
      dedupeKey,
      DEDUPE_WINDOW_HOURS,
    );
    if (alreadyNotified) return false;

    const dueLabel =
      item.daysUntilDue === 0 ? 'today' : `in ${item.daysUntilDue} day(s)`;
    const notification = await this.notificationsService.create(userId, {
      type: 'payment_due',
      title: 'Upcoming payment',
      message: `${item.description} — ${formatAmount(item.amount)} due ${dueLabel}.`,
      metadata: { dedupeKey, expenseId: item.expenseId },
    });

    this.realtimeGateway.emitRecurringDueSoon(userId, notification);
    return true;
  }
}
