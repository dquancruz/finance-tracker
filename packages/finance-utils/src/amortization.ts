import { compoundAmortization, simpleInterestTotal } from './interest';
import { addMonths } from './recurrence';

export interface ScheduleRow {
  installmentNumber: number;
  dueDate: Date;
  principal: number;
  interest: number;
  totalDue: number;
}

export function buildAmortizationSchedule(
  principal: number,
  numInstallments: number,
  annualRate: number,
  interestType: 'none' | 'simple' | 'compound',
  startDate: Date,
): ScheduleRow[] {
  const schedule: ScheduleRow[] = [];

  if (interestType === 'none' || annualRate === 0) {
    const installmentPrincipal = round2(principal / numInstallments);
    for (let i = 1; i <= numInstallments; i++) {
      const isLast = i === numInstallments;
      const paid = installmentPrincipal * (i - 1);
      const p = isLast ? round2(principal - paid) : installmentPrincipal;
      schedule.push({
        installmentNumber: i,
        dueDate: addMonths(startDate, i),
        principal: p,
        interest: 0,
        totalDue: p,
      });
    }
    return schedule;
  }

  if (interestType === 'simple') {
    const totalInterest = simpleInterestTotal(principal, annualRate, numInstallments);
    const totalAmount = principal + totalInterest;
    const monthlyTotal = round2(totalAmount / numInstallments);
    const monthlyInterest = round2(totalInterest / numInstallments);
    const monthlyPrincipal = round2(monthlyTotal - monthlyInterest);

    for (let i = 1; i <= numInstallments; i++) {
      const isLast = i === numInstallments;
      const paid = monthlyTotal * (i - 1);
      const total = isLast ? round2(totalAmount - paid) : monthlyTotal;
      schedule.push({
        installmentNumber: i,
        dueDate: addMonths(startDate, i),
        principal: isLast ? round2(total - monthlyInterest) : monthlyPrincipal,
        interest: monthlyInterest,
        totalDue: total,
      });
    }
    return schedule;
  }

  // Compound — standard amortization (French method)
  const { monthlyPayment } = compoundAmortization(principal, annualRate, numInstallments);
  const r = annualRate / 12;
  let remaining = principal;

  for (let i = 1; i <= numInstallments; i++) {
    const interest = round2(remaining * r);
    const isLast = i === numInstallments;
    const total = isLast ? round2(remaining + interest) : round2(monthlyPayment);
    const principalPart = round2(total - interest);
    remaining = round2(remaining - principalPart);

    schedule.push({
      installmentNumber: i,
      dueDate: addMonths(startDate, i),
      principal: principalPart,
      interest,
      totalDue: total,
    });
  }

  return schedule;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
