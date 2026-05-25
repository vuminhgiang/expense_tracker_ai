"use client";

import { useState } from "react";
import { Zap } from "lucide-react";
import { useExpensesContext } from "./providers";
import SummaryCards from "@/components/dashboard/SummaryCards";
import SpendingChart from "@/components/dashboard/SpendingChart";
import CategoryBreakdown from "@/components/dashboard/CategoryBreakdown";
import RecentExpenses from "@/components/dashboard/RecentExpenses";
import BudgetPanel from "@/components/dashboard/BudgetPanel";
import ExportHub from "@/components/export/ExportHub";
import Button from "@/components/ui/Button";

export default function DashboardPage() {
  const [hubOpen, setHubOpen] = useState(false);

  const {
    expenses,
    isLoaded,
    totalSpending,
    monthlySpending,
    categorySummaries,
    monthlySummaries,
    topCategory,
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
    <>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">
              Your financial overview at a glance
            </p>
          </div>
          <Button
            onClick={() => setHubOpen(true)}
            className="gap-2 bg-slate-900 hover:bg-slate-800 text-white border-0"
          >
            <Zap size={15} className="text-amber-400" />
            Export Hub
          </Button>
        </div>

        <SummaryCards
          totalSpending={totalSpending}
          monthlySpending={monthlySpending}
          totalCount={expenses.length}
          topCategory={topCategory}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <SpendingChart data={monthlySummaries} />
          </div>
          <BudgetPanel monthlySpending={monthlySpending} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CategoryBreakdown data={categorySummaries} />
        </div>

        <RecentExpenses expenses={expenses} />
      </div>

      <ExportHub
        isOpen={hubOpen}
        onClose={() => setHubOpen(false)}
        expenses={expenses}
      />
    </>
  );
}
