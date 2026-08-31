import { Injectable, Logger } from '@nestjs/common';
import type { ExchangeRates } from '@finance-tracker/finance-utils';

const RATES_API_URL = 'https://open.er-api.com/v6/latest/USD';
const CACHE_TTL_MS = 60 * 60 * 1000;

const FALLBACK_RATES: ExchangeRates = {
  USD: 1,
  EUR: 0.86,
  GBP: 0.79,
  CAD: 1.36,
  AUD: 1.54,
  MXN: 18.5,
  GTQ: 7.63,
  JPY: 149,
  CHF: 0.88,
  INR: 83.5,
  BRL: 5.05,
};

interface RatesApiResponse {
  result: string;
  rates?: ExchangeRates;
}

@Injectable()
export class ExchangeRatesService {
  private readonly logger = new Logger(ExchangeRatesService.name);
  private cachedRates: ExchangeRates = { ...FALLBACK_RATES };
  private fetchedAt = 0;

  /** Returns USD-relative rates (1 USD = rates[code]). */
  async getRates(): Promise<ExchangeRates> {
    if (Date.now() - this.fetchedAt < CACHE_TTL_MS) {
      return this.cachedRates;
    }

    try {
      const response = await fetch(RATES_API_URL, { cache: 'no-store' });
      if (!response.ok) throw new Error(`Rates API ${response.status}`);
      const body = (await response.json()) as RatesApiResponse;
      if (body.result !== 'success' || !body.rates) {
        throw new Error('Rates API returned an invalid payload');
      }
      this.cachedRates = { USD: 1, ...body.rates };
      this.fetchedAt = Date.now();
      return this.cachedRates;
    } catch (error) {
      this.logger.warn(
        `Falling back to static exchange rates: ${error instanceof Error ? error.message : error}`,
      );
      this.cachedRates = { ...FALLBACK_RATES };
      this.fetchedAt = Date.now();
      return this.cachedRates;
    }
  }
}
