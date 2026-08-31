'use client';

import {
  DEFAULT_CURRENCY,
  getCurrencyOption,
  SUPPORTED_CURRENCIES,
} from '@/lib/currencies';

interface CurrencySelectProps {
  id: string;
  value: string;
  onChange: (code: string) => void;
  className?: string;
  compact?: boolean;
}

export function CurrencySelect({
  id,
  value,
  onChange,
  className = '',
  compact = false,
}: CurrencySelectProps) {
  const selected = getCurrencyOption(value) ?? getCurrencyOption(DEFAULT_CURRENCY)!;

  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={compact ? 'Currency' : undefined}
      className={
        className ||
        'mt-1 block w-full rounded-lg border border-zinc-300 bg-surface px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-zinc-700'
      }
    >
      {SUPPORTED_CURRENCIES.map((currency) => (
        <option key={currency.code} value={currency.code}>
          {compact
            ? `${currency.symbol} ${currency.code}`
            : `${currency.symbol} ${currency.code} — ${currency.label}`}
        </option>
      ))}
      {/* Keep invalid stored values visible until the user picks a supported one. */}
      {!SUPPORTED_CURRENCIES.some((currency) => currency.code === value) && (
        <option value={value}>{selected.symbol} {value}</option>
      )}
    </select>
  );
}
