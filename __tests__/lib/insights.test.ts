import { getMonthExpenses, getTop3Categories, getCategoryChartData, computeBudgetStreak } from "@/lib/insights";
import { Expense } from "@/types/expense";

function makeExpense(overrides: Partial<Expense> & { date: string; amount: number; category: Expense["category"] }): Expense {
  return {
    id: Math.random().toString(36),
    description: "test",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

const SAMPLE: Expense[] = [
  makeExpense({ date: "2026-05-01", amount: 100, category: "Food" }),
  makeExpense({ date: "2026-05-02", amount: 50, category: "Transportation" }),
  makeExpense({ date: "2026-05-03", amount: 200, category: "Food" }),
  makeExpense({ date: "2026-05-04", amount: 30, category: "Entertainment" }),
  makeExpense({ date: "2026-04-15", amount: 999, category: "Shopping" }),
];

// ─── getMonthExpenses ──────────────────────────────────────────────────────────

describe("getMonthExpenses", () => {
  it("returns only expenses in the given month", () => {
    const result = getMonthExpenses(SAMPLE, "2026-05");
    expect(result).toHaveLength(4);
    result.forEach((e) => expect(e.date).toMatch(/^2026-05/));
  });

  it("returns empty array when no expenses match", () => {
    expect(getMonthExpenses(SAMPLE, "2025-01")).toHaveLength(0);
  });

  it("handles empty input", () => {
    expect(getMonthExpenses([], "2026-05")).toHaveLength(0);
  });
});

// ─── getTop3Categories ─────────────────────────────────────────────────────────

describe("getTop3Categories", () => {
  it("returns at most 3 categories sorted by total descending", () => {
    // Use only May expenses: Food=300, Transportation=50, Entertainment=30
    const mayExpenses = getMonthExpenses(SAMPLE, "2026-05");
    const result = getTop3Categories(mayExpenses);
    expect(result.length).toBeLessThanOrEqual(3);
    expect(result[0].category).toBe("Food"); // 300 total
  });

  it("computes correct totals", () => {
    const monthExpenses = getMonthExpenses(SAMPLE, "2026-05");
    const result = getTop3Categories(monthExpenses);
    const food = result.find((r) => r.category === "Food");
    expect(food?.total).toBe(300);
  });

  it("computes percentage relative to grand total", () => {
    const result = getTop3Categories([
      makeExpense({ date: "2026-05-01", amount: 50, category: "Food" }),
      makeExpense({ date: "2026-05-01", amount: 50, category: "Bills" }),
    ]);
    expect(result[0].percentage).toBeCloseTo(50);
    expect(result[1].percentage).toBeCloseTo(50);
  });

  it("returns empty array for empty input", () => {
    expect(getTop3Categories([])).toHaveLength(0);
  });

  it("returns 0 percentage when grand total is 0", () => {
    const result = getTop3Categories([
      makeExpense({ date: "2026-05-01", amount: 0, category: "Food" }),
    ]);
    expect(result[0].percentage).toBe(0);
  });
});

// ─── getCategoryChartData ─────────────────────────────────────────────────────

describe("getCategoryChartData", () => {
  it("groups expenses by category and sums amounts", () => {
    const monthExpenses = getMonthExpenses(SAMPLE, "2026-05");
    const result = getCategoryChartData(monthExpenses);
    const food = result.find((r) => r.name === "Food");
    expect(food?.value).toBe(300);
  });

  it("includes color and icon for each slice", () => {
    const result = getCategoryChartData(SAMPLE);
    result.forEach((slice) => {
      expect(slice.color).toBeTruthy();
      expect(slice.icon).toBeTruthy();
    });
  });

  it("returns empty array for empty input", () => {
    expect(getCategoryChartData([])).toHaveLength(0);
  });
});

// ─── computeBudgetStreak ──────────────────────────────────────────────────────

describe("computeBudgetStreak", () => {
  it("returns 0 when today is the 1st of the month", () => {
    expect(computeBudgetStreak(SAMPLE, "2026-05-01")).toBe(0);
  });

  it("returns 0 when there are no expenses", () => {
    expect(computeBudgetStreak([], "2026-05-10")).toBe(0);
  });

  it("counts consecutive under-average days going backwards", () => {
    // Days 1-4 each spend 50 → avg = 200/4 = 50
    // Day 3 = 50 (≤50 ✓), Day 2 = 50 (≤50 ✓), Day 1 = 50 (≤50 ✓) → streak=3
    const expenses = [
      makeExpense({ date: "2026-05-01", amount: 50, category: "Food" }),
      makeExpense({ date: "2026-05-02", amount: 50, category: "Food" }),
      makeExpense({ date: "2026-05-03", amount: 50, category: "Food" }),
    ];
    // Today is May 4, avg = 150/4 = 37.5; day3=50>37.5 → streak breaks at day3
    // So streak = 0
    expect(computeBudgetStreak(expenses, "2026-05-04")).toBe(0);
  });

  it("breaks streak on first over-average day", () => {
    // Total = 10+10+500 = 520, days elapsed = 3, avg = 173.3
    // yesterday (day2) = 10 ≤ 173.3 → streak=1
    // day1 = 10 ≤ 173.3 → streak=2 ... but day3 is today, we look back from day2
    // Actually today is day 4, so looking back: day3=500>520/4=130 → break
    const expenses = [
      makeExpense({ date: "2026-05-01", amount: 10, category: "Food" }),
      makeExpense({ date: "2026-05-02", amount: 10, category: "Food" }),
      makeExpense({ date: "2026-05-03", amount: 500, category: "Food" }),
    ];
    // today May 4: monthTotal=520, avg=520/4=130; day3=500>130 → streak=0
    expect(computeBudgetStreak(expenses, "2026-05-04")).toBe(0);
  });

  it("counts days with zero spending as under budget", () => {
    // Expense only on day 1; days 2-4 have no spending
    // today=May5, monthTotal=100, avg=100/5=20
    // day4=0≤20 ✓, day3=0≤20 ✓, day2=0≤20 ✓, day1=100>20 → streak=3
    const expenses = [
      makeExpense({ date: "2026-05-01", amount: 100, category: "Food" }),
    ];
    expect(computeBudgetStreak(expenses, "2026-05-05")).toBe(3);
  });
});
