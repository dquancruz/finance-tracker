import { describe, expect, it, vi } from 'vitest';
import {
  normalizePreferredCurrency,
  readPreferredCurrencyFromStorage,
  writePreferredCurrencyToStorage,
} from './preferred-currency-store';

describe('normalizePreferredCurrency', () => {
  it('returns GTQ for a supported code', () => {
    expect(normalizePreferredCurrency('GTQ')).toBe('GTQ');
  });

  it('falls back to USD for unknown codes', () => {
    expect(normalizePreferredCurrency('NOTREAL')).toBe('USD');
  });
});

describe('preferred currency storage', () => {
  it('normalizes lowercase supported codes on read', () => {
    const storage = {
      getItem: vi.fn().mockReturnValue('gtq'),
    };
    expect(readPreferredCurrencyFromStorage(storage)).toBe('GTQ');
  });

  it('normalizes invalid stored values to USD on read', () => {
    const storage = {
      getItem: vi.fn().mockReturnValue('INVALID'),
    };
    expect(readPreferredCurrencyFromStorage(storage)).toBe('USD');
  });

  it('normalizes values on write', () => {
    const storage = {
      setItem: vi.fn(),
    };
    expect(writePreferredCurrencyToStorage(storage, 'GTQ')).toBe('GTQ');
    expect(storage.setItem).toHaveBeenCalledWith(
      'finance-tracker:preferred-currency',
      'GTQ',
    );
  });

  it('writes USD when an unsupported code is provided', () => {
    const storage = {
      setItem: vi.fn(),
    };
    expect(writePreferredCurrencyToStorage(storage, 'XYZ')).toBe('USD');
    expect(storage.setItem).toHaveBeenCalledWith(
      'finance-tracker:preferred-currency',
      'USD',
    );
  });
});
