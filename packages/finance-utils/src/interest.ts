export function simpleInterestTotal(
  principal: number,
  annualRate: number,
  months: number,
): number {
  return principal * (annualRate / 12) * months;
}

export interface CompoundResult {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
}

export function compoundAmortization(
  principal: number,
  annualRate: number,
  numPayments: number,
): CompoundResult {
  if (annualRate === 0) {
    const monthly = principal / numPayments;
    return { monthlyPayment: monthly, totalPayment: principal, totalInterest: 0 };
  }
  const r = annualRate / 12;
  const factor = Math.pow(1 + r, numPayments);
  const monthly = (principal * r * factor) / (factor - 1);
  return {
    monthlyPayment: monthly,
    totalPayment: monthly * numPayments,
    totalInterest: monthly * numPayments - principal,
  };
}
