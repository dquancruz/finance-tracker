import {
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import type { BudgetPeriod } from '@finance-tracker/shared';

export class CreateCategoryDto {
  @IsString()
  @MinLength(1)
  @MaxLength(40)
  name: string;

  @IsString()
  @MinLength(1)
  icon: string;

  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'color must be a hex color, e.g. #3B82F6',
  })
  color: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  budgetLimit?: number;

  @IsOptional()
  @IsIn(['monthly', 'yearly'])
  budgetPeriod?: BudgetPeriod;

  @IsOptional()
  @IsString()
  @Matches(/^[A-Z]{3}$/, {
    message: 'budgetCurrency must be a 3-letter ISO code',
  })
  budgetCurrency?: string;
}
