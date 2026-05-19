"use client";

import { createContext, useContext } from "react";
import { useExpenses } from "@/hooks/useExpenses";

type ExpensesContextType = ReturnType<typeof useExpenses>;

const ExpensesContext = createContext<ExpensesContextType | null>(null);

export function ExpensesProvider({ children }: { children: React.ReactNode }) {
  const value = useExpenses();
  return (
    <ExpensesContext.Provider value={value}>
      {children}
    </ExpensesContext.Provider>
  );
}

export function useExpensesContext(): ExpensesContextType {
  const ctx = useContext(ExpensesContext);
  if (!ctx) throw new Error("useExpensesContext must be used inside ExpensesProvider");
  return ctx;
}
