import { Expense } from "@/types/expense";
import { STORAGE_KEY } from "@/lib/constants";

export function loadExpenses(): Expense[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return getDefaultExpenses();
    return JSON.parse(data) as Expense[];
  } catch {
    return getDefaultExpenses();
  }
}

export function saveExpenses(expenses: Expense[]): boolean {
  if (typeof window === "undefined") return true;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
    return true;
  } catch {
    return false;
  }
}

function getDefaultExpenses(): Expense[] {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = String(now.getMonth() + 1).padStart(2, "0");
  const lastMonth = String(now.getMonth() === 0 ? 12 : now.getMonth()).padStart(2, "0");
  const lastMonthYear = now.getMonth() === 0 ? currentYear - 1 : currentYear;

  const defaults: Expense[] = [
    {
      id: "default-1",
      date: `${currentYear}-${currentMonth}-05`,
      amount: 45.5,
      category: "Food",
      description: "Weekly groceries",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "default-2",
      date: `${currentYear}-${currentMonth}-07`,
      amount: 35.0,
      category: "Transportation",
      description: "Gas fill-up",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "default-3",
      date: `${currentYear}-${currentMonth}-10`,
      amount: 120.0,
      category: "Bills",
      description: "Internet bill",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "default-4",
      date: `${currentYear}-${currentMonth}-12`,
      amount: 28.99,
      category: "Entertainment",
      description: "Streaming subscription",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "default-5",
      date: `${currentYear}-${currentMonth}-15`,
      amount: 89.75,
      category: "Shopping",
      description: "Online clothing",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "default-6",
      date: `${currentYear}-${currentMonth}-18`,
      amount: 22.0,
      category: "Food",
      description: "Lunch with colleagues",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "default-7",
      date: `${lastMonthYear}-${lastMonth}-08`,
      amount: 55.0,
      category: "Food",
      description: "Dinner out",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "default-8",
      date: `${lastMonthYear}-${lastMonth}-14`,
      amount: 200.0,
      category: "Shopping",
      description: "Electronics accessories",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "default-9",
      date: `${lastMonthYear}-${lastMonth}-20`,
      amount: 150.0,
      category: "Bills",
      description: "Electric bill",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "default-10",
      date: `${lastMonthYear}-${lastMonth}-25`,
      amount: 40.0,
      category: "Entertainment",
      description: "Movie night",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  saveExpenses(defaults);
  return defaults;
}
