"use client";

import { useExpensesContext } from "./providers";
import SummaryCards from "@/components/dashboard/SummaryCards";
import SpendingChart from "@/components/dashboard/SpendingChart";
import CategoryBreakdown from "@/components/dashboard/CategoryBreakdown";
import RecentExpenses from "@/components/dashboard/RecentExpenses";
import Button from "@/components/ui/Button";
import { exportToCSV } from "@/lib/exportUtils";

export default function DashboardPage() {
  const {
    expenses,
    isLoaded,
    totalSpending,
    monthlySpending,
    categorySummaries,
    monthlySummaries,
    topCategory,
    chartData,
  } = useExpensesContext();

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading your expenses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Your financial overview at a glance
          </p>
        </div>
        <Button variant="outline" onClick={() => exportToCSV(expenses)}>
          Export Data
        </Button>
      </div>

      <SummaryCards
        totalSpending={totalSpending}
        monthlySpending={monthlySpending}
        totalCount={expenses.length}
        topCategory={topCategory}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SpendingChart data={monthlySummaries} />
        <CategoryBreakdown data={categorySummaries} />
      </div>

      <RecentExpenses expenses={expenses} />
    </div>
  );
}
