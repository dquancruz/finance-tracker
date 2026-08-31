import { convertCurrency, sumConvertedAmounts } from './currency';

const RATES = {
  USD: 1,
  GTQ: 7.63,
  EUR: 0.86,
};

describe('convertCurrency', () => {
  it('returns the same amount when currencies match', () => {
    expect(convertCurrency(100, 'USD', 'USD', RATES)).toBe(100);
  });

  it('converts USD to GTQ', () => {
    expect(convertCurrency(100, 'USD', 'GTQ', RATES)).toBe(763);
  });

  it('converts GTQ to USD', () => {
    expect(convertCurrency(763, 'GTQ', 'USD', RATES)).toBe(100);
  });

  it('converts between two non-USD currencies via USD', () => {
    const eur = convertCurrency(100, 'USD', 'EUR', RATES);
    const backToUsd = convertCurrency(eur, 'EUR', 'USD', RATES);
    expect(backToUsd).toBe(100);
  });

  it('returns the original amount when a rate is missing', () => {
    expect(convertCurrency(50, 'XYZ', 'GTQ', RATES)).toBe(50);
  });
});

describe('sumConvertedAmounts', () => {
  it('converts each item before summing', () => {
    const total = sumConvertedAmounts(
      [
        { amount: 100, currency: 'USD' },
        { amount: 763, currency: 'GTQ' },
      ],
      'GTQ',
      RATES,
    );
    expect(total).toBe(1526);
  });
});
