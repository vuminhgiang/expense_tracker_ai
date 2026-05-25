"use client";

import { useState, useMemo } from "react";
import { Zap } from "lucide-react";
import { useExpensesContext } from "./providers";
import SummaryCards from "@/components/dashboard/SummaryCards";
import SpendingChart from "@/components/dashboard/SpendingChart";
import CategoryBreakdown from "@/components/dashboard/CategoryBreakdown";
import RecentExpenses from "@/components/dashboard/RecentExpenses";
import BudgetPanel from "@/components/dashboard/BudgetPanel";
import EmptyDashboard from "@/components/dashboard/EmptyDashboard";
import ExportHub from "@/components/export/ExportHub";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import ExpenseForm from "@/components/expenses/ExpenseForm";
import { getMonthOverMonthTrend } from "@/lib/dashboard";
import { getMonthKey } from "@/lib/utils";

export default function DashboardPage() {
  const [hubOpen, setHubOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const {
    expenses,
    isLoaded,
    totalSpending,
    monthlySpending,
    categorySummaries,
    monthlySummaries,
    topCategory,
    addExpense,
  } = useExpensesContext();

  const currentMonthKey = useMemo(
    () => getMonthKey(new Date().toISOString().split("T")[0]),
    []
  );

  const monthTrend = useMemo(
    () => getMonthOverMonthTrend(monthlySummaries, currentMonthKey),
    [monthlySummaries, currentMonthKey]
  );

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

  if (expenses.length === 0) {
    return (
      <>
        <EmptyDashboard onAddExpense={() => setShowAddModal(true)} />
        <Modal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="Add New Expense"
        >
          <ExpenseForm
            onSubmit={(data) => { addExpense(data); setShowAddModal(false); }}
            onCancel={() => setShowAddModal(false)}
          />
        </Modal>
      </>
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
          monthTrend={monthTrend}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <SpendingChart data={monthlySummaries} />
          </div>
          <BudgetPanel monthlySpending={monthlySpending} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CategoryBreakdown data={categorySummaries} />
          <RecentExpenses expenses={expenses} />
        </div>
      </div>

      <ExportHub
        isOpen={hubOpen}
        onClose={() => setHubOpen(false)}
        expenses={expenses}
      />
    </>
  );
}
