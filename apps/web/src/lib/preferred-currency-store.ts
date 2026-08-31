import { DEFAULT_CURRENCY, getCurrencyOption } from './currencies';

export const PREFERRED_CURRENCY_STORAGE_KEY = 'finance-tracker:preferred-currency';

/** Normalizes a currency code against supported currencies. */
export function normalizePreferredCurrency(code: string | null | undefined): string {
  return getCurrencyOption(code ?? '')?.code ?? DEFAULT_CURRENCY;
}

export function readPreferredCurrencyFromStorage(
  storage: Pick<Storage, 'getItem'>,
): string {
  try {
    return normalizePreferredCurrency(storage.getItem(PREFERRED_CURRENCY_STORAGE_KEY));
  } catch {
    return DEFAULT_CURRENCY;
  }
}

export function writePreferredCurrencyToStorage(
  storage: Pick<Storage, 'setItem'>,
  code: string,
): string {
  const normalized = normalizePreferredCurrency(code);
  try {
    storage.setItem(PREFERRED_CURRENCY_STORAGE_KEY, normalized);
  } catch {
    // Ignore quota / private-mode errors.
  }
  return normalized;
}
