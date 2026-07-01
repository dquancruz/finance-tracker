import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ExpensesService } from './expenses.service';

/**
 * Daily job that advances every active recurring expense whose
 * `nextDueDate` has elapsed, using the shared recurrence engine
 * (`@finance-tracker/finance-utils`).
 */
@Injectable()
export class RecurringExpenseProcessor {
  private readonly logger = new Logger(RecurringExpenseProcessor.name);

  constructor(private readonly expensesService: ExpensesService) {}

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async handleDueRecurringExpenses(): Promise<void> {
    const count = await this.expensesService.processDueRecurringExpenses();
    if (count > 0) {
      this.logger.log(`Advanced ${count} recurring expense(s)`);
    }
  }
}
