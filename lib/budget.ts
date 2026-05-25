const BUDGET_KEY = "expense_tracker_budget";

export interface BudgetData {
  monthly: number;
}

export type BudgetStatus = "safe" | "warning" | "danger" | "over";

export function loadBudget(): BudgetData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(BUDGET_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as BudgetData;
    if (typeof parsed.monthly !== "number" || parsed.monthly <= 0) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveBudget(data: BudgetData): boolean {
  try {
    localStorage.setItem(BUDGET_KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

export function clearBudget(): void {
  if (typeof window !== "undefined") localStorage.removeItem(BUDGET_KEY);
}

export function getBudgetPercentage(spent: number, budget: number): number {
  if (budget <= 0) return 0;
  return Math.min((spent / budget) * 100, 999);
}

export function getBudgetStatus(spent: number, budget: number): BudgetStatus {
  const pct = (spent / budget) * 100;
  if (pct >= 100) return "over";
  if (pct >= 85) return "danger";
  if (pct >= 65) return "warning";
  return "safe";
}

export function getRemainingBudget(spent: number, budget: number): number {
  return budget - spent;
}
