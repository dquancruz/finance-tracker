import { describe, expect, it } from 'vitest';
import { formatCurrency, formatDate, toDateInputValue } from './format';

describe('formatCurrency', () => {
  it('formats USD amounts with two decimals', () => {
    expect(formatCurrency(1234.5)).toBe('$1,234.50');
  });

  it('respects the provided currency code', () => {
    expect(formatCurrency(10, 'EUR')).toContain('10.00');
  });

  it('falls back to USD for unsupported currency codes', () => {
    expect(formatCurrency(10, 'NOTREAL')).toBe('$10.00');
  });
});

describe('formatDate', () => {
  it('formats an ISO date string in UTC', () => {
    expect(formatDate('2026-01-15')).toBe('Jan 15, 2026');
  });

  it('formats a Date instance', () => {
    expect(formatDate(new Date('2026-12-01T00:00:00.000Z'))).toBe(
      'Dec 1, 2026',
    );
  });
});

describe('toDateInputValue', () => {
  it('returns a YYYY-MM-DD string', () => {
    expect(toDateInputValue('2026-03-05T12:00:00.000Z')).toBe('2026-03-05');
  });
});
