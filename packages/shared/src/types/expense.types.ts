export type ExpenseType = 'simple' | 'recurring' | 'installment';
export type RecurringFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';
export type InterestType = 'none' | 'simple' | 'compound';

export interface IExpenseBase {
  _id: string;
  userId: string;
  categoryId: string;
  type: ExpenseType;
  currency: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface ISimpleExpense extends IExpenseBase {
  type: 'simple';
  amount: number;
  date: Date;
}

export interface IRecurringExpense extends IExpenseBase {
  type: 'recurring';
  description: string;
  amount: number;
  frequency: RecurringFrequency;
  startDate: Date;
  nextDueDate: Date;
  endDate?: Date;
  isActive: boolean;
  lastPaidDate?: Date;
}

export interface IInstallmentPayment {
  installmentNumber: number;
  dueDate: Date;
  principal: number;
  interest: number;
  totalDue: number;
  paidAt?: Date;
  paidAmount?: number;
}

export interface IInstallmentExpense extends IExpenseBase {
  type: 'installment';
  description: string;
  totalAmount: number;
  numInstallments: number;
  installmentAmount: number;
  interestRate?: number;
  interestType: InterestType;
  startDate: Date;
  paymentSchedule: IInstallmentPayment[];
}

export type IExpense = ISimpleExpense | IRecurringExpense | IInstallmentExpense;
