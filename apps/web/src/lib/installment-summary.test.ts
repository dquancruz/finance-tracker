import { describe, expect, it } from 'vitest';
import { summarizeInstallment } from './installment-summary';

function row(
  overrides: Partial<{
    installmentNumber: number;
    dueDate: Date;
    totalDue: number;
    paidAt?: Date;
  }> = {},
) {
  return {
    installmentNumber: 1,
    dueDate: new Date('2026-01-01'),
    principal: 90,
    interest: 10,
    totalDue: 100,
    ...overrides,
  };
}

describe('summarizeInstallment', () => {
  it('reports zero progress for a schedule with nothing paid', () => {
    const summary = summarizeInstallment({
      paymentSchedule: [
        row({ installmentNumber: 1, dueDate: new Date('2026-02-01') }),
        row({ installmentNumber: 2, dueDate: new Date('2026-03-01') }),
      ],
    });

    expect(summary.paidCount).toBe(0);
    expect(summary.remainingCount).toBe(2);
    expect(summary.remainingBalance).toBe(200);
    expect(summary.progressPercentage).toBe(0);
    expect(summary.isComplete).toBe(false);
  });

  it('picks the soonest unpaid due date as next due', () => {
    const summary = summarizeInstallment({
      paymentSchedule: [
        row({ installmentNumber: 1, dueDate: new Date('2026-03-01') }),
        row({ installmentNumber: 2, dueDate: new Date('2026-02-01') }),
      ],
    });

    expect(summary.nextDueDate).toEqual(new Date('2026-02-01'));
  });

  it('excludes paid installments from the remaining balance', () => {
    const summary = summarizeInstallment({
      paymentSchedule: [
        row({ installmentNumber: 1, paidAt: new Date('2026-01-02') }),
        row({ installmentNumber: 2, dueDate: new Date('2026-02-01') }),
      ],
    });

    expect(summary.paidCount).toBe(1);
    expect(summary.remainingCount).toBe(1);
    expect(summary.remainingBalance).toBe(100);
    expect(summary.progressPercentage).toBe(50);
  });

  it('marks a fully paid schedule as complete', () => {
    const summary = summarizeInstallment({
      paymentSchedule: [
        row({ installmentNumber: 1, paidAt: new Date('2026-01-01') }),
        row({ installmentNumber: 2, paidAt: new Date('2026-02-01') }),
      ],
    });

    expect(summary.isComplete).toBe(true);
    expect(summary.remainingBalance).toBe(0);
    expect(summary.nextDueDate).toBeNull();
    expect(summary.progressPercentage).toBe(100);
  });

  it('handles an empty schedule without dividing by zero', () => {
    const summary = summarizeInstallment({ paymentSchedule: [] });

    expect(summary.progressPercentage).toBe(0);
    expect(summary.isComplete).toBe(false);
    expect(summary.nextDueDate).toBeNull();
  });
});
