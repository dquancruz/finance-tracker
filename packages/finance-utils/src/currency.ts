/** USD-relative rates: 1 USD = rates[code] units of `code`. */
export type ExchangeRates = Record<string, number>;

export interface ConvertedSum {
  total: number;
  unconvertedCount: number;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Converts `amount` from `from` to `to` using USD-relative exchange rates.
 * Rates follow open.er-api.com semantics (1 USD = rates[GTQ] quetzales).
 * Returns `null` when a rate is missing so callers can skip or surface errors.
 */
export function convertCurrency(
  amount: number,
  from: string,
  to: string,
  rates: ExchangeRates,
): number | null {
  if (from === to) return round2(amount);

  const fromRate = from === 'USD' ? 1 : rates[from];
  const toRate = to === 'USD' ? 1 : rates[to];

  if (!fromRate || !toRate) {
    return null;
  }

  const amountInUsd = from === 'USD' ? amount : amount / fromRate;
  const converted = to === 'USD' ? amountInUsd : amountInUsd * toRate;
  return round2(converted);
}

/** Sums monetary amounts after converting each to the target currency. */
export function sumConvertedAmounts(
  items: Array<{ amount: number; currency: string }>,
  targetCurrency: string,
  rates: ExchangeRates,
): ConvertedSum {
  let unconvertedCount = 0;

  const total = items.reduce((sum, item) => {
    const converted = convertCurrency(
      item.amount,
      item.currency,
      targetCurrency,
      rates,
    );
    if (converted === null) {
      unconvertedCount += 1;
      return sum;
    }
    return sum + converted;
  }, 0);

  return { total: round2(total), unconvertedCount };
}
