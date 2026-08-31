/** USD-relative rates: 1 USD = rates[code] units of `code`. */
export type ExchangeRates = Record<string, number>;

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Converts `amount` from `from` to `to` using USD-relative exchange rates.
 * Rates follow open.er-api.com semantics (1 USD = rates[GTQ] quetzales).
 */
export function convertCurrency(
  amount: number,
  from: string,
  to: string,
  rates: ExchangeRates,
): number {
  if (from === to) return round2(amount);

  const fromRate = from === 'USD' ? 1 : rates[from];
  const toRate = to === 'USD' ? 1 : rates[to];

  if (!fromRate || !toRate) {
    return round2(amount);
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
): number {
  return round2(
    items.reduce(
      (sum, item) =>
        sum + convertCurrency(item.amount, item.currency, targetCurrency, rates),
      0,
    ),
  );
}
