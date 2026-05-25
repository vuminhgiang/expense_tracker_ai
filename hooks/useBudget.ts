"use client";

import { useState, useEffect } from "react";
import { BudgetData, loadBudget, saveBudget, clearBudget as clearBudgetStorage } from "@/lib/budget";

export function useBudget() {
  const [budget, setBudgetState] = useState<BudgetData | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setBudgetState(loadBudget());
    setIsLoaded(true);
  }, []);

  function setBudget(monthly: number): void {
    const data: BudgetData = { monthly };
    saveBudget(data);
    setBudgetState(data);
  }

  function clearBudget(): void {
    clearBudgetStorage();
    setBudgetState(null);
  }

  return { budget, isLoaded, setBudget, clearBudget };
}
