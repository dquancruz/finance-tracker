import { Controller, Get, UseGuards } from '@nestjs/common';
import type { ExchangeRates } from '@finance-tracker/finance-utils';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ExchangeRatesService } from './exchange-rates.service';

@UseGuards(JwtAuthGuard)
@Controller('exchange-rates')
export class ExchangeRatesController {
  constructor(private readonly exchangeRatesService: ExchangeRatesService) {}

  /** USD-relative rates for client-side currency conversion. */
  @Get()
  getRates(): Promise<ExchangeRates> {
    return this.exchangeRatesService.getRates();
  }
}
