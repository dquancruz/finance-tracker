import type { ExchangeRates } from '@finance-tracker/finance-utils';

/** Static fallback when the live rate API is unavailable (USD-relative). */
export const FALLBACK_EXCHANGE_RATES: ExchangeRates = {
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

const RATES_API_URL = 'https://open.er-api.com/v6/latest/USD';
const CACHE_KEY = 'finance-tracker:exchange-rates';
const CACHE_TTL_MS = 60 * 60 * 1000;

interface CachedRates {
  fetchedAt: number;
  rates: ExchangeRates;
}

interface RatesApiResponse {
  result: string;
  rates?: ExchangeRates;
}

function readCache(): CachedRates | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedRates;
    if (Date.now() - parsed.fetchedAt > CACHE_TTL_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeCache(rates: ExchangeRates) {
  if (typeof window === 'undefined') return;
  try {
    const payload: CachedRates = { fetchedAt: Date.now(), rates };
    localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
  } catch {
    // Ignore storage errors.
  }
}

/** Fetches USD-relative exchange rates, with localStorage cache + static fallback. */
export async function fetchExchangeRates(): Promise<ExchangeRates> {
  const cached = readCache();
  if (cached) return cached.rates;

  try {
    const response = await fetch(RATES_API_URL, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Rates API ${response.status}`);
    const body = (await response.json()) as RatesApiResponse;
    if (body.result !== 'success' || !body.rates) {
      throw new Error('Rates API returned an invalid payload');
    }
    const rates: ExchangeRates = { USD: 1, ...body.rates };
    writeCache(rates);
    return rates;
  } catch {
    return { ...FALLBACK_EXCHANGE_RATES };
  }
}
