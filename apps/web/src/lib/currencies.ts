export interface CurrencyOption {
  code: string;
  label: string;
  symbol: string;
}

/** Common ISO 4217 currencies supported in expense forms and display. */
export const SUPPORTED_CURRENCIES: CurrencyOption[] = [
  { code: 'USD', label: 'US Dollar', symbol: '$' },
  { code: 'EUR', label: 'Euro', symbol: '€' },
  { code: 'GBP', label: 'British Pound', symbol: '£' },
  { code: 'CAD', label: 'Canadian Dollar', symbol: 'CA$' },
  { code: 'AUD', label: 'Australian Dollar', symbol: 'A$' },
  { code: 'MXN', label: 'Mexican Peso', symbol: 'MX$' },
  { code: 'GTQ', label: 'Guatemalan Quetzal', symbol: 'Q' },
  { code: 'JPY', label: 'Japanese Yen', symbol: '¥' },
  { code: 'CHF', label: 'Swiss Franc', symbol: 'CHF' },
  { code: 'INR', label: 'Indian Rupee', symbol: '₹' },
  { code: 'BRL', label: 'Brazilian Real', symbol: 'R$' },
];

export const DEFAULT_CURRENCY = 'USD';

export function getCurrencyOption(code: string): CurrencyOption | undefined {
  const normalized = code.trim().toUpperCase();
  return SUPPORTED_CURRENCIES.find((currency) => currency.code === normalized);
}
