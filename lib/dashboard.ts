import { MonthlySummary } from "@/types/expense";

export interface MonthTrend {
  changePct: number;
  direction: "up" | "down" | "flat";
}

export function getMonthOverMonthTrend(
  summaries: MonthlySummary[],
  currentMonthKey: string
): MonthTrend | null {
  const idx = summaries.findIndex((s) => s.month === currentMonthKey);
  if (idx < 1) return null;

  const current = summaries[idx].total;
  const previous = summaries[idx - 1].total;
  if (previous === 0) return null;

  const changePct = ((current - previous) / previous) * 100;
  const direction = changePct > 0.5 ? "up" : changePct < -0.5 ? "down" : "flat";
  return { changePct: Math.abs(changePct), direction };
}
