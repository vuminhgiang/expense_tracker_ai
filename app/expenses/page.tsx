"use client";

import { useExpensesContext } from "../providers";
import ExpenseList from "@/components/expenses/ExpenseList";

export default function ExpensesPage() {
  const {
    expenses,
    filteredExpenses,
    isLoaded,
    filters,
    setFilters,
    addExpense,
    updateExpense,
    deleteExpense,
    deleteMultiple,
  } = useExpensesContext();

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading expenses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage and track all your expenses
        </p>
      </div>

      <ExpenseList
        expenses={expenses}
        filteredExpenses={filteredExpenses}
        filters={filters}
        onFilterChange={setFilters}
        onAdd={addExpense}
        onEdit={updateExpense}
        onDelete={deleteExpense}
        onDeleteMultiple={deleteMultiple}
      />
    </div>
  );
}
