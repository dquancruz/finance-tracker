'use client';

import { convertCurrency, type ExchangeRates } from '@finance-tracker/finance-utils';
import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';
import { fetchExchangeRates, FALLBACK_EXCHANGE_RATES } from '../exchange-rates';

export function useExchangeRates() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['exchange-rates'],
    queryFn: fetchExchangeRates,
    staleTime: 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    retry: 1,
  });

  const rates: ExchangeRates = data ?? FALLBACK_EXCHANGE_RATES;

  const convert = useCallback(
    (amount: number, from: string, to: string) =>
      convertCurrency(amount, from, to, rates),
    [rates],
  );

  return { rates, convert, isLoading, isError };
}
