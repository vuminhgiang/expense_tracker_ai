"use client";

import { useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Expense } from "@/types/expense";
import { CATEGORY_ICONS } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import {
  getMonthExpenses,
  getTop3Categories,
  getCategoryChartData,
  computeBudgetStreak,
} from "@/lib/insights";

interface MonthlyInsightsProps {
  expenses: Expense[];
  todayISO?: string;
  monthlyBudget?: number;
}

function DonutCenterLabel() {
  return (
    <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
      <tspan x="50%" dy="-0.3em" fontSize="11" fill="#6b7280" fontWeight="500">
        Spending
      </tspan>
    </text>
  );
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { name: string; value: number }[];
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-md px-3 py-2 text-xs">
      <p className="font-semibold text-gray-800">{payload[0].name}</p>
      <p className="text-gray-600">{formatCurrency(payload[0].value)}</p>
    </div>
  );
}

export default function MonthlyInsights({
  expenses,
  todayISO,
  monthlyBudget,
}: MonthlyInsightsProps) {
  const today = todayISO ?? new Date().toISOString().split("T")[0];
  const monthKey = today.substring(0, 7);

  const monthExpenses = useMemo(
    () => getMonthExpenses(expenses, monthKey),
    [expenses, monthKey]
  );

  const top3 = useMemo(() => getTop3Categories(monthExpenses), [monthExpenses]);

  const chartData = useMemo(
    () => getCategoryChartData(monthExpenses),
    [monthExpenses]
  );

  const streak = useMemo(
    () => computeBudgetStreak(expenses, today, monthlyBudget),
    [expenses, today, monthlyBudget]
  );

  const isEmpty = monthExpenses.length === 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">
          Monthly Insights
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">
          {new Date(monthKey + "-01").toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>

      {isEmpty ? (
        <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
          No expenses recorded this month
        </div>
      ) : (
        <>
          {/* Donut chart */}
          <div className="flex justify-center">
            <div className="w-48 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={78}
                    paddingAngle={2}
                    dataKey="value"
                    nameKey="name"
                  >
                    {chartData.map((slice, i) => (
                      <Cell key={i} fill={slice.color} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <text
                    x="50%"
                    y="50%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={11}
                    fill="#6b7280"
                    fontWeight={500}
                  >
                    Spending
                  </text>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top 3 categories */}
          <div className="space-y-3">
            {top3.map((item) => (
              <div key={item.category} className="flex items-center gap-3">
                <div
                  className="w-1 h-6 rounded-full flex-shrink-0"
                  style={{
                    backgroundColor:
                      chartData.find((s) => s.name === item.category)?.color ??
                      "#e5e7eb",
                  }}
                />
                <span className="text-sm text-gray-700 flex-1">
                  {CATEGORY_ICONS[item.category]} {item.category}
                </span>
                <span className="text-sm font-semibold text-gray-900">
                  {formatCurrency(item.total)}
                </span>
              </div>
            ))}
            {top3.length > 0 && (
              <p className="text-xs text-gray-400 text-right">Top {top3.length}</p>
            )}
          </div>
        </>
      )}

      {/* Budget streak */}
      <div className="border-2 border-dashed border-gray-200 rounded-xl p-4">
        <p className="text-sm font-semibold text-gray-700 text-center mb-2">
          Budget Streak
        </p>
        <div className="flex items-center justify-center gap-4">
          <div className="text-center">
            <span className="text-4xl font-bold text-emerald-500">{streak}</span>
            <p className="text-xs text-gray-500 mt-0.5">days!</p>
          </div>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(streak, 7) }).map((_, i) => (
              <div
                key={i}
                className="w-3 h-6 rounded-sm bg-emerald-400 opacity-80"
                style={{ opacity: 0.4 + (i / Math.max(streak - 1, 1)) * 0.6 }}
              />
            ))}
            {streak === 0 && (
              <div className="w-16 h-6 rounded-full bg-gray-100 border border-gray-200" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
