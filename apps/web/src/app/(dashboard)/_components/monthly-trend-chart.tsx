'use client';

import type { IMonthlyTrend } from '@finance-tracker/shared';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatCurrency } from '@/lib/format';

interface MonthlyTrendChartProps {
  trends: IMonthlyTrend[];
}

function monthTickLabel(month: string): string {
  const [year, monthNum] = month.split('-');
  const date = new Date(Number(year), Number(monthNum) - 1, 1);
  return new Intl.DateTimeFormat('en-US', { month: 'short' }).format(date);
}

export function MonthlyTrendChart({ trends }: MonthlyTrendChartProps) {
  const hasData = trends.some((t) => t.total > 0);

  return (
    <article
      aria-label="Monthly spending trend"
      className="rounded-xl border border-zinc-200 bg-surface p-6 shadow-sm dark:border-zinc-800"
    >
      <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Monthly trend</p>
      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
        Total spend over the last {trends.length} months
      </p>

      {hasData ? (
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trends} margin={{ left: 4, right: 12, top: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
              <XAxis
                dataKey="month"
                tickFormatter={monthTickLabel}
                tick={{ fontSize: 12, fill: 'var(--chart-tick)' }}
                axisLine={{ stroke: 'var(--chart-grid)' }}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(value: number) => formatCurrency(value)}
                tick={{ fontSize: 11, fill: 'var(--chart-tick)' }}
                axisLine={false}
                tickLine={false}
                width={72}
              />
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                labelFormatter={monthTickLabel}
                contentStyle={{
                  background: 'var(--surface)',
                  borderColor: 'var(--border)',
                  borderRadius: 8,
                  fontSize: 13,
                }}
                labelStyle={{ color: 'var(--foreground)' }}
                itemStyle={{ color: 'var(--foreground)' }}
              />
              <Line
                type="monotone"
                dataKey="total"
                name="Total spend"
                stroke="#6366F1"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="mt-8 text-sm text-zinc-500 dark:text-zinc-400">
          Not enough data yet to chart a trend.
        </p>
      )}
    </article>
  );
}
