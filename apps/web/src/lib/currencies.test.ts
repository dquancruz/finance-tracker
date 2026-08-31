import { describe, expect, it } from 'vitest';
import { DEFAULT_CURRENCY, getCurrencyOption, SUPPORTED_CURRENCIES } from './currencies';

describe('currencies', () => {
  it('includes Guatemalan quetzales', () => {
    expect(getCurrencyOption('GTQ')).toEqual({
      code: 'GTQ',
      label: 'Guatemalan Quetzal',
      symbol: 'Q',
    });
  });

  it('falls back to undefined for unknown codes', () => {
    expect(getCurrencyOption('XYZ')).toBeUndefined();
  });

  it('defaults to USD', () => {
    expect(DEFAULT_CURRENCY).toBe('USD');
    expect(SUPPORTED_CURRENCIES[0]?.code).toBe('USD');
  });
});
