"use client";

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { CategorySummary } from "@/types/expense";
import { formatCurrency } from "@/lib/utils";
import { CATEGORY_COLORS, CATEGORY_ICONS } from "@/lib/constants";
import { Category } from "@/types/expense";

interface CategoryBreakdownProps {
  data: CategorySummary[];
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { name: string; value: number; payload: { percentage: number } }[] }) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-3">
      <p className="text-xs text-gray-500 mb-1">{item.name}</p>
      <p className="text-sm font-semibold text-gray-900">{formatCurrency(item.value)}</p>
      <p className="text-xs text-gray-500">{item.payload.percentage.toFixed(1)}% of total</p>
    </div>
  );
}

export default function CategoryBreakdown({ data }: CategoryBreakdownProps) {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4">By Category</h3>
        <div className="flex items-center justify-center h-48 text-gray-400">
          <p className="text-sm">No data available yet</p>
        </div>
      </div>
    );
  }

  const chartData = data.map((d) => ({
    name: d.category,
    value: d.total,
    percentage: d.percentage,
    color: CATEGORY_COLORS[d.category],
  }));

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-gray-900">By Category</h3>
        <p className="text-xs text-gray-500 mt-0.5">Spending distribution</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 items-center">
        <div className="w-full lg:w-48 h-48 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex-1 space-y-2 w-full">
          {data.map((item) => (
            <div key={item.category} className="flex items-center gap-3">
              <div
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: CATEGORY_COLORS[item.category] }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">
                    {CATEGORY_ICONS[item.category]} {item.category}
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatCurrency(item.total)}
                  </span>
                </div>
                <div className="mt-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${item.percentage}%`,
                      backgroundColor: CATEGORY_COLORS[item.category],
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
