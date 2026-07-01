import { simpleInterestTotal, compoundAmortization } from './interest';

describe('simpleInterestTotal', () => {
  it('calculates simple interest correctly', () => {
    // 10000 at 12% per year for 12 months = 1200
    expect(simpleInterestTotal(10000, 0.12, 12)).toBeCloseTo(1200, 2);
  });

  it('returns 0 for 0% rate', () => {
    expect(simpleInterestTotal(5000, 0, 6)).toBe(0);
  });
});

describe('compoundAmortization', () => {
  it('calculates monthly payment for 0% rate', () => {
    const result = compoundAmortization(12000, 0, 12);
    expect(result.monthlyPayment).toBeCloseTo(1000, 2);
    expect(result.totalInterest).toBe(0);
  });

  it('calculates correct amortization for 10000 at 12% / 12 months', () => {
    // M = 10000 * (0.01 * 1.01^12) / (1.01^12 - 1) ≈ 888.49
    const result = compoundAmortization(10000, 0.12, 12);
    expect(result.monthlyPayment).toBeCloseTo(888.49, 1);
    expect(result.totalInterest).toBeGreaterThan(0);
    expect(result.totalPayment).toBeCloseTo(result.monthlyPayment * 12, 1);
  });

  it('total payment = principal + total interest', () => {
    const result = compoundAmortization(5000, 0.1, 24);
    expect(result.totalPayment).toBeCloseTo(result.totalInterest + 5000, 1);
  });
});
