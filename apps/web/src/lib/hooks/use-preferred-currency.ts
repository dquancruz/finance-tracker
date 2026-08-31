'use client';

import { useCallback, useSyncExternalStore } from 'react';
import { DEFAULT_CURRENCY, getCurrencyOption } from '../currencies';

const STORAGE_KEY = 'finance-tracker:preferred-currency';

function normalizeCurrency(code: string | null | undefined): string {
  return getCurrencyOption(code ?? '')?.code ?? DEFAULT_CURRENCY;
}

function readStoredCurrency(): string {
  if (typeof window === 'undefined') return DEFAULT_CURRENCY;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return normalizeCurrency(stored);
  } catch {
    return DEFAULT_CURRENCY;
  }
}

let listeners: Array<() => void> = [];

function subscribe(listener: () => void) {
  listeners = [...listeners, listener];
  return () => {
    listeners = listeners.filter((item) => item !== listener);
  };
}

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

function setStoredCurrency(code: string) {
  const normalized = normalizeCurrency(code);
  try {
    localStorage.setItem(STORAGE_KEY, normalized);
  } catch {
    // Ignore quota / private-mode errors — in-memory updates still work.
  }
  emitChange();
}

/** Persists the user's preferred display currency in localStorage. */
export function usePreferredCurrency() {
  const currency = useSyncExternalStore(
    subscribe,
    readStoredCurrency,
    () => DEFAULT_CURRENCY,
  );

  const setCurrency = useCallback((code: string) => {
    setStoredCurrency(code);
  }, []);

  return { currency, setCurrency };
}
