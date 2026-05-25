"use client";

import { TrendingUp, TrendingDown, Minus, DollarSign, Calendar, Tag, Receipt } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Category } from "@/types/expense";
import { CATEGORY_ICONS } from "@/lib/constants";
import { MonthTrend } from "@/lib/dashboard";

interface SummaryCardsProps {
  totalSpending: number;
  monthlySpending: number;
  totalCount: number;
  topCategory: { category: Category; total: number; percentage: number } | null;
  monthTrend?: MonthTrend | null;
}

interface CardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  trend?: { value: string; positive: boolean; icon: React.ReactNode } | null;
}

function StatCard({ title, value, subtitle, icon, iconBg, iconColor, trend }: CardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
        </div>
        <div className={`p-3 rounded-xl ${iconBg}`}>
          <span className={iconColor}>{icon}</span>
        </div>
      </div>
      {trend && (
        <div className="mt-3 pt-3 border-t border-gray-50">
          <div
            className={`flex items-center gap-1 text-xs font-medium ${
              trend.positive ? "text-emerald-600" : "text-red-500"
            }`}
          >
            {trend.icon}
            {trend.value}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SummaryCards({
  totalSpending,
  monthlySpending,
  totalCount,
  topCategory,
  monthTrend,
}: SummaryCardsProps) {
  const avgPerExpense = totalCount > 0 ? totalSpending / totalCount : 0;

  const trendProp = monthTrend
    ? {
        value:
          monthTrend.direction === "flat"
            ? "Same as last month"
            : `${monthTrend.changePct.toFixed(1)}% vs last month`,
        positive: monthTrend.direction !== "up",
        icon:
          monthTrend.direction === "up" ? (
            <TrendingUp size={12} />
          ) : monthTrend.direction === "down" ? (
            <TrendingDown size={12} />
          ) : (
            <Minus size={12} />
          ),
      }
    : null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <StatCard
        title="Total Spending"
        value={formatCurrency(totalSpending)}
        subtitle={`Across ${totalCount} expense${totalCount !== 1 ? "s" : ""}`}
        icon={<DollarSign size={20} />}
        iconBg="bg-blue-50"
        iconColor="text-blue-600"
      />
      <StatCard
        title="This Month"
        value={formatCurrency(monthlySpending)}
        subtitle="Current month total"
        icon={<Calendar size={20} />}
        iconBg="bg-violet-50"
        iconColor="text-violet-600"
        trend={trendProp}
      />
      <StatCard
        title="Avg per Expense"
        value={formatCurrency(avgPerExpense)}
        subtitle="Average expense amount"
        icon={<Receipt size={20} />}
        iconBg="bg-amber-50"
        iconColor="text-amber-600"
      />
      <StatCard
        title="Top Category"
        value={topCategory ? topCategory.category : "—"}
        subtitle={
          topCategory
            ? `${formatCurrency(topCategory.total)} (${topCategory.percentage.toFixed(0)}%)`
            : "No expenses yet"
        }
        icon={<Tag size={20} />}
        iconBg="bg-emerald-50"
        iconColor="text-emerald-600"
      />
    </div>
  );
}
