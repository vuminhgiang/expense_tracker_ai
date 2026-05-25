import { getMonthOverMonthTrend } from "@/lib/dashboard";
import { MonthlySummary } from "@/types/expense";

function m(month: string, total: number): MonthlySummary {
  return { month, total, count: 1 };
}

describe("getMonthOverMonthTrend", () => {
  it("returns null when summaries is empty", () => {
    expect(getMonthOverMonthTrend([], "2026-05")).toBeNull();
  });

  it("returns null when only one month exists (no previous)", () => {
    expect(getMonthOverMonthTrend([m("2026-05", 500)], "2026-05")).toBeNull();
  });

  it("returns null when current month is not found", () => {
    const summaries = [m("2026-03", 400), m("2026-04", 500)];
    expect(getMonthOverMonthTrend(summaries, "2026-05")).toBeNull();
  });

  it("returns null when current month is first in the array", () => {
    const summaries = [m("2026-05", 500), m("2026-06", 600)];
    expect(getMonthOverMonthTrend(summaries, "2026-05")).toBeNull();
  });

  it("returns null when previous month total is 0", () => {
    const summaries = [m("2026-04", 0), m("2026-05", 500)];
    expect(getMonthOverMonthTrend(summaries, "2026-05")).toBeNull();
  });

  it('returns "up" when spending increased', () => {
    const summaries = [m("2026-04", 400), m("2026-05", 600)];
    const result = getMonthOverMonthTrend(summaries, "2026-05");
    expect(result).not.toBeNull();
    expect(result!.direction).toBe("up");
    expect(result!.changePct).toBeCloseTo(50);
  });

  it('returns "down" when spending decreased', () => {
    const summaries = [m("2026-04", 600), m("2026-05", 400)];
    const result = getMonthOverMonthTrend(summaries, "2026-05");
    expect(result).not.toBeNull();
    expect(result!.direction).toBe("down");
    expect(result!.changePct).toBeCloseTo(33.33);
  });

  it('returns "flat" when change is within 0.5%', () => {
    const summaries = [m("2026-04", 1000), m("2026-05", 1003)];
    const result = getMonthOverMonthTrend(summaries, "2026-05");
    expect(result).not.toBeNull();
    expect(result!.direction).toBe("flat");
  });

  it("works mid-array (not just last entry)", () => {
    const summaries = [
      m("2026-03", 300),
      m("2026-04", 400),
      m("2026-05", 600),
    ];
    const result = getMonthOverMonthTrend(summaries, "2026-04");
    expect(result!.direction).toBe("up");
    expect(result!.changePct).toBeCloseTo(33.33);
  });

  it("handles 100% increase correctly", () => {
    const summaries = [m("2026-04", 500), m("2026-05", 1000)];
    const result = getMonthOverMonthTrend(summaries, "2026-05");
    expect(result!.changePct).toBeCloseTo(100);
    expect(result!.direction).toBe("up");
  });
});
