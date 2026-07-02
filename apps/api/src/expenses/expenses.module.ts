import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RealtimeModule } from '../realtime/realtime.module';
import { ExpensesController } from './expenses.controller';
import { ExpensesService } from './expenses.service';
import { RecurringExpenseProcessor } from './recurring-expense.processor';
import {
  Expense,
  ExpenseSchema,
  InstallmentExpenseSchema,
  RecurringExpenseSchema,
  SimpleExpenseSchema,
} from './schemas/expense.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Expense.name,
        schema: ExpenseSchema,
        // NOTE: discriminator `name` must match the literal `type` values
        // used across the app ('simple' | 'recurring' | 'installment'),
        // NOT the schema class name — Mongoose stores this name as the
        // discriminatorKey value on save.
        discriminators: [
          { name: 'simple', schema: SimpleExpenseSchema },
          { name: 'recurring', schema: RecurringExpenseSchema },
          { name: 'installment', schema: InstallmentExpenseSchema },
        ],
      },
    ]),
    RealtimeModule,
  ],
  controllers: [ExpensesController],
  providers: [ExpensesService, RecurringExpenseProcessor],
  exports: [ExpensesService],
})
export class ExpensesModule {}
