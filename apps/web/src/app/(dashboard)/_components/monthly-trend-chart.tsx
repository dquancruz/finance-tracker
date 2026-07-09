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
      className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm"
    >
      <p className="text-sm font-medium text-zinc-700">Monthly trend</p>
      <p className="mt-1 text-xs text-zinc-500">
        Total spend over the last {trends.length} months
      </p>

      {hasData ? (
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trends} margin={{ left: 4, right: 12, top: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F4F4F5" />
              <XAxis
                dataKey="month"
                tickFormatter={monthTickLabel}
                tick={{ fontSize: 12, fill: '#71717A' }}
                axisLine={{ stroke: '#E4E4E7' }}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(value: number) => formatCurrency(value)}
                tick={{ fontSize: 11, fill: '#71717A' }}
                axisLine={false}
                tickLine={false}
                width={72}
              />
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                labelFormatter={monthTickLabel}
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
        <p className="mt-8 text-sm text-zinc-500">
          Not enough data yet to chart a trend.
        </p>
      )}
    </article>
  );
}
