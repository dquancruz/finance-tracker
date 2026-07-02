import { describe, expect, it } from 'vitest';
import {
  budgetStatusTone,
  budgetToneBarClass,
  budgetToneTextClass,
  formatPercentageChange,
} from './analytics-format';

describe('formatPercentageChange', () => {
  it('prefixes positive changes with a plus sign', () => {
    expect(formatPercentageChange(12.34)).toBe('+12.3%');
  });

  it('leaves negative changes with their own minus sign', () => {
    expect(formatPercentageChange(-8.2)).toBe('-8.2%');
  });

  it('formats zero without a sign', () => {
    expect(formatPercentageChange(0)).toBe('0.0%');
  });
});

describe('budgetStatusTone', () => {
  it('returns "ok" below 80%', () => {
    expect(budgetStatusTone(50)).toBe('ok');
    expect(budgetStatusTone(79.9)).toBe('ok');
  });

  it('returns "warning" between 80% and 100%', () => {
    expect(budgetStatusTone(80)).toBe('warning');
    expect(budgetStatusTone(99.9)).toBe('warning');
  });

  it('returns "over" at or above 100%', () => {
    expect(budgetStatusTone(100)).toBe('over');
    expect(budgetStatusTone(150)).toBe('over');
  });
});

describe('budgetToneBarClass / budgetToneTextClass', () => {
  it('returns a distinct class for every tone', () => {
    const tones = ['ok', 'warning', 'over'] as const;
    const barClasses = new Set(tones.map(budgetToneBarClass));
    const textClasses = new Set(tones.map(budgetToneTextClass));

    expect(barClasses.size).toBe(3);
    expect(textClasses.size).toBe(3);
  });
});
