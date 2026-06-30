import { buildAmortizationSchedule } from './amortization';

const START_DATE = new Date(2024, 0, 1); // Jan 1, 2024 (local time)

describe('buildAmortizationSchedule — no interest', () => {
  const schedule = buildAmortizationSchedule(1200, 12, 0, 'none', START_DATE);

  it('produces a schedule with length equal to numInstallments', () => {
    expect(schedule).toHaveLength(12);
  });

  it('sums principal across all rows to the original amount', () => {
    const totalPrincipal = schedule.reduce((sum, row) => sum + row.principal, 0);
    expect(totalPrincipal).toBeCloseTo(1200, 1);
  });

  it('has zero interest on every row', () => {
    for (const row of schedule) {
      expect(row.interest).toBe(0);
    }
  });

  it('assigns sequential installment numbers starting at 1', () => {
    schedule.forEach((row, i) => {
      expect(row.installmentNumber).toBe(i + 1);
    });
  });
});

describe('buildAmortizationSchedule — simple interest', () => {
  const schedule = buildAmortizationSchedule(1200, 12, 0.12, 'simple', START_DATE);

  it('produces a schedule with length equal to numInstallments', () => {
    expect(schedule).toHaveLength(12);
  });

  it('sums principal across all rows to the original amount', () => {
    const totalPrincipal = schedule.reduce((sum, row) => sum + row.principal, 0);
    expect(totalPrincipal).toBeCloseTo(1200, 1);
  });

  it('has positive interest on every row', () => {
    for (const row of schedule) {
      expect(row.interest).toBeGreaterThan(0);
    }
  });
});

describe('buildAmortizationSchedule — compound interest', () => {
  const schedule = buildAmortizationSchedule(1200, 12, 0.12, 'compound', START_DATE);

  it('produces a schedule with length equal to numInstallments', () => {
    expect(schedule).toHaveLength(12);
  });

  it('sums principal across all rows to the original amount', () => {
    const totalPrincipal = schedule.reduce((sum, row) => sum + row.principal, 0);
    expect(totalPrincipal).toBeCloseTo(1200, 1);
  });

  it('has positive interest on every row', () => {
    for (const row of schedule) {
      expect(row.interest).toBeGreaterThan(0);
    }
  });

  it('has decreasing interest amounts (French amortization property)', () => {
    for (let i = 1; i < schedule.length; i++) {
      const current = schedule[i];
      const previous = schedule[i - 1];
      if (current && previous) {
        expect(current.interest).toBeLessThanOrEqual(previous.interest + 0.01);
      }
    }
  });
});
