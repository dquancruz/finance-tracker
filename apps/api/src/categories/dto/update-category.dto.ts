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

// Not using @nestjs/mapped-types PartialType here since it is not a
// dependency of this app — fields are declared explicitly instead.
export class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(40)
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  icon?: string;

  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'color must be a hex color, e.g. #3B82F6',
  })
  color?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  budgetLimit?: number;

  @IsOptional()
  @IsIn(['monthly', 'yearly'])
  budgetPeriod?: BudgetPeriod;
}
