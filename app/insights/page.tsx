"use client";

import { useExpensesContext } from "../providers";
import { useBudget } from "@/hooks/useBudget";
import MonthlyInsights from "@/components/dashboard/MonthlyInsights";
import BudgetPanel from "@/components/dashboard/BudgetPanel";

export default function InsightsPage() {
  const { expenses, isLoaded, monthlySpending } = useExpensesContext();
  const { budget } = useBudget();

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
    <div className="max-w-md mx-auto space-y-4">
      <BudgetPanel monthlySpending={monthlySpending} />
      <MonthlyInsights
        expenses={expenses}
        monthlyBudget={budget?.monthly}
      />
    </div>
  );
}
