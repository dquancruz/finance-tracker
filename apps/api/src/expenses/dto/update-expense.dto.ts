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
import type { InterestType, RecurringFrequency } from '@finance-tracker/shared';

// The `type` discriminator is immutable once an expense is created — updates
// only touch fields belonging to the expense's existing type.

export class UpdateCommonExpenseDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  categoryId?: string;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateSimpleExpenseDto extends UpdateCommonExpenseDto {
  @IsOptional()
  @IsNumber()
  @IsPositive()
  amount?: number;

  @IsOptional()
  @IsDateString()
  date?: string;
}

export class UpdateRecurringExpenseDto extends UpdateCommonExpenseDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  description?: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  amount?: number;

  @IsOptional()
  @IsIn(['daily', 'weekly', 'monthly', 'yearly'])
  frequency?: RecurringFrequency;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  isActive?: boolean;
}

export class UpdateInstallmentExpenseDto extends UpdateCommonExpenseDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  interestRate?: number;

  @IsOptional()
  @IsIn(['none', 'simple', 'compound'])
  interestType?: InterestType;
}

export type UpdateExpenseDto =
  | UpdateSimpleExpenseDto
  | UpdateRecurringExpenseDto
  | UpdateInstallmentExpenseDto;
