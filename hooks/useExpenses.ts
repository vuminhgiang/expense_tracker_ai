"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Expense, ExpenseFormData, ExpenseFilters, CategorySummary, MonthlySummary } from "@/types/expense";
import { Category } from "@/types/expense";
import { loadExpenses, saveExpenses } from "@/lib/storage";
import { generateId, getMonthKey, getCurrentMonthRange } from "@/lib/utils";
import { CATEGORY_COLORS } from "@/lib/constants";

const defaultFilters: ExpenseFilters = {
  search: "",
  category: "All",
  dateFrom: "",
  dateTo: "",
};

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [filters, setFilters] = useState<ExpenseFilters>(defaultFilters);
  const [saveError, setSaveError] = useState(false);

  useEffect(() => {
    const loaded = loadExpenses();
    setExpenses(loaded);
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      const ok = saveExpenses(expenses);
      setSaveError(!ok);
    }
  }, [expenses, isLoaded]);

  const addExpense = useCallback((data: ExpenseFormData) => {
    const now = new Date().toISOString();
    const newExpense: Expense = {
      id: generateId(),
      date: data.date,
      amount: parseFloat(data.amount),
      category: data.category,
      description: data.description.trim(),
      createdAt: now,
      updatedAt: now,
    };
    setExpenses((prev) => [newExpense, ...prev]);
    return newExpense;
  }, []);

  const updateExpense = useCallback((id: string, data: ExpenseFormData) => {
    setExpenses((prev) =>
      prev.map((e) =>
        e.id === id
          ? {
              ...e,
              date: data.date,
              amount: parseFloat(data.amount),
              category: data.category,
              description: data.description.trim(),
              updatedAt: new Date().toISOString(),
            }
          : e
      )
    );
  }, []);

  const deleteExpense = useCallback((id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const deleteMultiple = useCallback((ids: string[]) => {
    const idSet = new Set(ids);
    setExpenses((prev) => prev.filter((e) => !idSet.has(e.id)));
  }, []);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        if (
          !e.description.toLowerCase().includes(searchLower) &&
          !e.category.toLowerCase().includes(searchLower)
        ) {
          return false;
        }
      }
      if (filters.category !== "All" && e.category !== filters.category) {
        return false;
      }
      if (filters.dateFrom && e.date < filters.dateFrom) return false;
      if (filters.dateTo && e.date > filters.dateTo) return false;
      return true;
    });
  }, [expenses, filters]);

  const totalSpending = useMemo(
    () => expenses.reduce((sum, e) => sum + e.amount, 0),
    [expenses]
  );

  const monthlySpending = useMemo(() => {
    const { from, to } = getCurrentMonthRange();
    return expenses
      .filter((e) => e.date >= from && e.date <= to)
      .reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  const categorySummaries = useMemo((): CategorySummary[] => {
    const totals: Partial<Record<Category, { total: number; count: number }>> = {};
    for (const e of expenses) {
      if (!totals[e.category]) totals[e.category] = { total: 0, count: 0 };
      totals[e.category]!.total += e.amount;
      totals[e.category]!.count += 1;
    }
    return Object.entries(totals)
      .map(([cat, data]) => ({
        category: cat as Category,
        total: data!.total,
        count: data!.count,
        percentage: totalSpending > 0 ? (data!.total / totalSpending) * 100 : 0,
      }))
      .sort((a, b) => b.total - a.total);
  }, [expenses, totalSpending]);

  const monthlySummaries = useMemo((): MonthlySummary[] => {
    const months: Record<string, { total: number; count: number }> = {};
    for (const e of expenses) {
      const key = getMonthKey(e.date);
      if (!months[key]) months[key] = { total: 0, count: 0 };
      months[key].total += e.amount;
      months[key].count += 1;
    }
    return Object.entries(months)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({ month, total: data.total, count: data.count }))
      .slice(-6);
  }, [expenses]);

  const topCategory = useMemo(
    () => categorySummaries[0] ?? null,
    [categorySummaries]
  );

  const chartData = useMemo(() => {
    return categorySummaries.map((s) => ({
      name: s.category,
      value: s.total,
      color: CATEGORY_COLORS[s.category],
    }));
  }, [categorySummaries]);

  return {
    expenses,
    filteredExpenses,
    isLoaded,
    filters,
    setFilters,
    addExpense,
    updateExpense,
    deleteExpense,
    deleteMultiple,
    totalSpending,
    monthlySpending,
    categorySummaries,
    monthlySummaries,
    topCategory,
    chartData,
    saveError,
  };
}
