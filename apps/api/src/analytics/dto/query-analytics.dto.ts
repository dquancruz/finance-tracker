import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
} from 'class-validator';

const CURRENCY_CODE = /^[A-Z]{3}$/;

export class CategoryBreakdownQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  @Max(3000)
  year?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month?: number;
}

export class MonthlyTrendsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(24)
  months?: number;
}

export class UpcomingPaymentsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(365)
  days?: number;
}

export class SummaryQueryDto {
  @IsOptional()
  @IsString()
  @Matches(CURRENCY_CODE, {
    message: 'displayCurrency must be a 3-letter ISO code',
  })
  displayCurrency?: string;
}
