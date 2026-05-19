"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
} from "recharts";
import { MonthlySummary } from "@/types/expense";
import { formatCurrency, formatMonthYear } from "@/lib/utils";

interface SpendingChartProps {
  data: MonthlySummary[];
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-3">
      <p className="text-xs text-gray-500 mb-1">{formatMonthYear(label ?? "")}</p>
      <p className="text-sm font-semibold text-gray-900">
        {formatCurrency(payload[0].value)}
      </p>
    </div>
  );
}

export default function SpendingChart({ data }: SpendingChartProps) {
  const chartData = data.map((d) => ({
    ...d,
    label: d.month.slice(5), // "MM" part for short labels
    fullLabel: d.month,
  }));

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Monthly Spending</h3>
        <div className="flex items-center justify-center h-48 text-gray-400">
          <p className="text-sm">No data available yet</p>
        </div>
      </div>
    );
  }

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const formattedData = chartData.map((d) => ({
    ...d,
    shortLabel: monthNames[parseInt(d.label) - 1] ?? d.label,
  }));

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Monthly Spending</h3>
          <p className="text-xs text-gray-500 mt-0.5">Last 6 months overview</p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={formattedData} barSize={32}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis
            dataKey="shortLabel"
            tick={{ fontSize: 12, fill: "#9ca3af" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: "#9ca3af" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `$${v}`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f9fafb" }} />
          <Bar
            dataKey="total"
            fill="#3b82f6"
            radius={[6, 6, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
