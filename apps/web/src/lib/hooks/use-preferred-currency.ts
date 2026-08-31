'use client';

import { useCallback, useSyncExternalStore } from 'react';
import {
  normalizePreferredCurrency,
  readPreferredCurrencyFromStorage,
  writePreferredCurrencyToStorage,
} from '../preferred-currency-store';
import { DEFAULT_CURRENCY } from '../currencies';

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

function readStoredCurrency(): string {
  if (typeof window === 'undefined') return DEFAULT_CURRENCY;
  return readPreferredCurrencyFromStorage(localStorage);
}

function setStoredCurrency(code: string) {
  writePreferredCurrencyToStorage(localStorage, code);
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

export { normalizePreferredCurrency };
