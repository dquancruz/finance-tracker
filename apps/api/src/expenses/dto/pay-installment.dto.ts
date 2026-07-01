import { IsNumber, IsOptional, IsPositive } from 'class-validator';

export class PayInstallmentDto {
  /** Defaults to the installment's scheduled `totalDue` when omitted. */
  @IsOptional()
  @IsNumber()
  @IsPositive()
  paidAmount?: number;
}
