import { Type } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import type { ExpenseType } from '@finance-tracker/shared';

export type ExpenseSortBy = 'date' | 'amount' | 'createdAt';
export type SortOrder = 'asc' | 'desc';

export class QueryExpenseDto {
  @IsOptional()
  @IsIn(['simple', 'recurring', 'installment'])
  type?: ExpenseType;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @IsOptional()
  @IsIn(['date', 'amount', 'createdAt'])
  sortBy?: ExpenseSortBy = 'date';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: SortOrder = 'desc';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
