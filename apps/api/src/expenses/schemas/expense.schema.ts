import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import type {
  ExpenseType,
  InterestType,
  RecurringFrequency,
} from '@finance-tracker/shared';

export type ExpenseDocument = HydratedDocument<Expense>;
export type SimpleExpenseDocument = HydratedDocument<SimpleExpense>;
export type RecurringExpenseDocument = HydratedDocument<RecurringExpense>;
export type InstallmentExpenseDocument = HydratedDocument<InstallmentExpense>;

/**
 * Base schema shared by every expense type (Mongoose discriminated union,
 * discriminatorKey = "type").
 *
 * `amount` and `date` are denormalized onto the base document so the whole
 * collection can be filtered/sorted/paginated consistently regardless of
 * type:
 *  - simple:      amount = the expense amount,      date = the expense date
 *  - recurring:   amount = the per-occurrence amount, date = nextDueDate
 *  - installment: amount = totalAmount,               date = startDate
 */
@Schema({ timestamps: true, discriminatorKey: 'type', collection: 'expenses' })
export class Expense {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  categoryId: string;

  @Prop({
    type: String,
    required: true,
    enum: ['simple', 'recurring', 'installment'],
  })
  type: ExpenseType;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  date: Date;

  @Prop({ required: true, default: 'USD' })
  currency: string;

  @Prop()
  notes?: string;

  @Prop()
  deletedAt?: Date;
}

export const ExpenseSchema = SchemaFactory.createForClass(Expense);
ExpenseSchema.index({ userId: 1, deletedAt: 1, date: -1 });
ExpenseSchema.index({ userId: 1, categoryId: 1 });

// No additional fields beyond the base schema — `amount`/`date` cover it.
@Schema()
export class SimpleExpense {}
export const SimpleExpenseSchema = SchemaFactory.createForClass(SimpleExpense);

@Schema()
export class RecurringExpense {
  @Prop({ required: true, trim: true })
  description: string;

  @Prop({
    type: String,
    required: true,
    enum: ['daily', 'weekly', 'monthly', 'yearly'],
  })
  frequency: RecurringFrequency;

  @Prop({ required: true })
  startDate: Date;

  // Mirrors base `date` — kept as its own named field per the shared contract.
  @Prop({ required: true })
  nextDueDate: Date;

  @Prop()
  endDate?: Date;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  lastPaidDate?: Date;
}
export const RecurringExpenseSchema =
  SchemaFactory.createForClass(RecurringExpense);

@Schema({ _id: false })
export class InstallmentPayment {
  @Prop({ required: true })
  installmentNumber: number;

  @Prop({ required: true })
  dueDate: Date;

  @Prop({ required: true })
  principal: number;

  @Prop({ required: true, default: 0 })
  interest: number;

  @Prop({ required: true })
  totalDue: number;

  @Prop()
  paidAt?: Date;

  @Prop()
  paidAmount?: number;
}
export const InstallmentPaymentSchema =
  SchemaFactory.createForClass(InstallmentPayment);

@Schema()
export class InstallmentExpense {
  @Prop({ required: true, trim: true })
  description: string;

  @Prop({ required: true })
  totalAmount: number;

  @Prop({ required: true, min: 1 })
  numInstallments: number;

  @Prop({ required: true })
  installmentAmount: number;

  @Prop()
  interestRate?: number;

  @Prop({
    type: String,
    required: true,
    enum: ['none', 'simple', 'compound'],
    default: 'none',
  })
  interestType: InterestType;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ type: [InstallmentPaymentSchema], default: [] })
  paymentSchedule: InstallmentPayment[];
}
export const InstallmentExpenseSchema =
  SchemaFactory.createForClass(InstallmentExpense);

/**
 * Flattened view of a persisted expense document covering fields from every
 * discriminator branch. Mongoose discriminator models are typed loosely
 * (`Model<any>`), so the service layer works against this shape instead of
 * chasing per-branch document types.
 */
export type AnyExpenseDocument = ExpenseDocument &
  Partial<RecurringExpense> &
  Partial<InstallmentExpense>;
