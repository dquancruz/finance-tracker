import {
  IsDateString,
  IsIn,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
  MinLength,
} from 'class-validator';
import type {
  ExpenseType,
  InterestType,
  RecurringFrequency,
} from '@finance-tracker/shared';

export class BaseCreateExpenseDto {
  @IsIn(['simple', 'recurring', 'installment'])
  type: ExpenseType;

  @IsString()
  @MinLength(1)
  categoryId: string;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateSimpleExpenseDto extends BaseCreateExpenseDto {
  declare type: 'simple';

  @IsNumber()
  @IsPositive()
  amount: number;

  @IsDateString()
  date: string;
}

export class CreateRecurringExpenseDto extends BaseCreateExpenseDto {
  declare type: 'recurring';

  @IsString()
  @MinLength(1)
  description: string;

  @IsNumber()
  @IsPositive()
  amount: number;

  @IsIn(['daily', 'weekly', 'monthly', 'yearly'])
  frequency: RecurringFrequency;

  @IsDateString()
  startDate: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class CreateInstallmentExpenseDto extends BaseCreateExpenseDto {
  declare type: 'installment';

  @IsString()
  @MinLength(1)
  description: string;

  @IsNumber()
  @IsPositive()
  totalAmount: number;

  @IsNumber()
  @Min(1)
  numInstallments: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  interestRate?: number;

  @IsOptional()
  @IsIn(['none', 'simple', 'compound'])
  interestType?: InterestType;

  @IsDateString()
  startDate: string;
}

export type CreateExpenseDto =
  | CreateSimpleExpenseDto
  | CreateRecurringExpenseDto
  | CreateInstallmentExpenseDto;
