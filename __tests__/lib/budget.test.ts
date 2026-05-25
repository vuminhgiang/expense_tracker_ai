import {
  getBudgetPercentage,
  getBudgetStatus,
  getRemainingBudget,
} from "@/lib/budget";

// ─── getBudgetPercentage ──────────────────────────────────────────────────────

describe("getBudgetPercentage", () => {
  it("returns 0 when budget is 0", () => {
    expect(getBudgetPercentage(100, 0)).toBe(0);
  });

  it("returns 50 when half spent", () => {
    expect(getBudgetPercentage(50, 100)).toBe(50);
  });

  it("returns 100 when exactly at budget", () => {
    expect(getBudgetPercentage(100, 100)).toBe(100);
  });

  it("caps at 999 when over budget", () => {
    expect(getBudgetPercentage(2000, 100)).toBe(999);
  });

  it("returns 0 when nothing spent", () => {
    expect(getBudgetPercentage(0, 500)).toBe(0);
  });

  it("handles fractional amounts", () => {
    expect(getBudgetPercentage(33.33, 100)).toBeCloseTo(33.33);
  });
});

// ─── getBudgetStatus ──────────────────────────────────────────────────────────

describe("getBudgetStatus", () => {
  it('returns "safe" when under 65%', () => {
    expect(getBudgetStatus(60, 100)).toBe("safe");
    expect(getBudgetStatus(0, 100)).toBe("safe");
  });

  it('returns "warning" at 65%', () => {
    expect(getBudgetStatus(65, 100)).toBe("warning");
  });

  it('returns "warning" between 65% and 85%', () => {
    expect(getBudgetStatus(80, 100)).toBe("warning");
  });

  it('returns "danger" at 85%', () => {
    expect(getBudgetStatus(85, 100)).toBe("danger");
  });

  it('returns "danger" between 85% and 100%', () => {
    expect(getBudgetStatus(95, 100)).toBe("danger");
  });

  it('returns "over" at exactly 100%', () => {
    expect(getBudgetStatus(100, 100)).toBe("over");
  });

  it('returns "over" above 100%', () => {
    expect(getBudgetStatus(150, 100)).toBe("over");
  });
});

// ─── getRemainingBudget ───────────────────────────────────────────────────────

describe("getRemainingBudget", () => {
  it("returns positive when under budget", () => {
    expect(getRemainingBudget(80, 100)).toBe(20);
  });

  it("returns 0 when exactly at budget", () => {
    expect(getRemainingBudget(100, 100)).toBe(0);
  });

  it("returns negative when over budget", () => {
    expect(getRemainingBudget(120, 100)).toBe(-20);
  });

  it("returns full budget when nothing spent", () => {
    expect(getRemainingBudget(0, 500)).toBe(500);
  });

  it("handles fractional amounts", () => {
    expect(getRemainingBudget(33.33, 100)).toBeCloseTo(66.67);
  });
});
