import { Expense, CategorySummary, Category } from "@/types/expense";
import { CATEGORY_COLORS, CATEGORY_ICONS } from "@/lib/constants";

export interface ChartSlice {
  name: Category;
  value: number;
  color: string;
  icon: string;
}

export function getMonthExpenses(expenses: Expense[], monthKey: string): Expense[] {
  return expenses.filter((e) => e.date.startsWith(monthKey));
}

export function getTop3Categories(expenses: Expense[]): CategorySummary[] {
  const totals: Partial<Record<Category, { total: number; count: number }>> = {};
  const grand = expenses.reduce((s, e) => s + e.amount, 0);

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
      percentage: grand > 0 ? (data!.total / grand) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 3);
}

export function getCategoryChartData(expenses: Expense[]): ChartSlice[] {
  const totals: Partial<Record<Category, number>> = {};

  for (const e of expenses) {
    totals[e.category] = (totals[e.category] ?? 0) + e.amount;
  }

  return Object.entries(totals).map(([cat, total]) => ({
    name: cat as Category,
    value: total as number,
    color: CATEGORY_COLORS[cat as Category],
    icon: CATEGORY_ICONS[cat as Category],
  }));
}

function isoDateStr(year: number, month1: number, day: number): string {
  return `${year}-${String(month1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function computeBudgetStreak(
  expenses: Expense[],
  todayISO: string,
  monthlyBudget?: number
): number {
  const [year, month1, day] = todayISO.split("-").map(Number);
  const dayOfMonth = day;

  if (dayOfMonth < 2) return 0;

  const monthKey = todayISO.substring(0, 7);
  const monthExpenses = expenses.filter((e) => e.date.startsWith(monthKey));
  const monthTotal = monthExpenses.reduce((s, e) => s + e.amount, 0);

  const daysInMonth = new Date(year, month1, 0).getDate();
  const dailyAvg = monthlyBudget != null
    ? monthlyBudget / daysInMonth
    : monthTotal / dayOfMonth;

  if (dailyAvg === 0) return 0;

  const byDate: Record<string, number> = {};
  for (const e of expenses) {
    byDate[e.date] = (byDate[e.date] ?? 0) + e.amount;
  }

  let streak = 0;
  for (let d = dayOfMonth - 1; d >= 1; d--) {
    const dateStr = isoDateStr(year, month1, d);
    const daySpending = byDate[dateStr] ?? 0;
    if (daySpending <= dailyAvg) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}
