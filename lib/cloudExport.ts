import { Expense, Category } from "@/types/expense";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ExportDestination = "download" | "email" | "sheets" | "dropbox" | "onedrive" | "link";
export type ExportFormat = "csv" | "json" | "pdf" | "snapshot";
export type ExportFrequency = "daily" | "weekly" | "monthly";
export type DateRangePreset = "all" | "current-month" | "last-month" | "last-3-months" | "ytd" | "last-year";

export interface ExportTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  format: ExportFormat;
  dateRange: DateRangePreset;
  categories: Category[] | "all";
  badge: string;
  badgeColor: string;
  accentColor: string;
  usageCount: number;
}

export interface HistoryEntry {
  id: string;
  timestamp: string;
  templateName: string;
  templateIcon: string;
  destination: ExportDestination;
  format: ExportFormat;
  recordCount: number;
  fileSizeKB: number;
  status: "success" | "failed";
}

export interface ScheduleConfig {
  enabled: boolean;
  frequency: ExportFrequency;
  dayOfWeek: number;
  dayOfMonth: number;
  hour: number;
  templateId: string;
  destination: ExportDestination;
  lastRun?: string;
  nextRun?: string;
  runCount: number;
}

export type ConnectionMap = Partial<Record<ExportDestination, { connected: boolean; detail?: string }>>;

// ─── Templates ────────────────────────────────────────────────────────────────

export const EXPORT_TEMPLATES: ExportTemplate[] = [
  {
    id: "tax-report",
    name: "Tax Report",
    description: "Full-year expense log formatted for tax filing and accounting software",
    icon: "🧾",
    format: "csv",
    dateRange: "ytd",
    categories: "all",
    badge: "Tax",
    badgeColor: "bg-red-100 text-red-700",
    accentColor: "#dc2626",
    usageCount: 0,
  },
  {
    id: "monthly-summary",
    name: "Monthly Summary",
    description: "Printable PDF overview with totals, category breakdown and trends",
    icon: "📅",
    format: "pdf",
    dateRange: "current-month",
    categories: "all",
    badge: "Report",
    badgeColor: "bg-blue-100 text-blue-700",
    accentColor: "#2563eb",
    usageCount: 0,
  },
  {
    id: "category-analysis",
    name: "Category Analysis",
    description: "Structured JSON for importing into analytics dashboards or BI tools",
    icon: "🏷️",
    format: "json",
    dateRange: "last-3-months",
    categories: "all",
    badge: "Analytics",
    badgeColor: "bg-violet-100 text-violet-700",
    accentColor: "#7c3aed",
    usageCount: 0,
  },
  {
    id: "business-expenses",
    name: "Business Expenses",
    description: "Filtered for reimbursable categories: Food, Transport, and Other",
    icon: "💼",
    format: "csv",
    dateRange: "last-month",
    categories: ["Food", "Transportation", "Other"],
    badge: "Business",
    badgeColor: "bg-cyan-100 text-cyan-700",
    accentColor: "#0891b2",
    usageCount: 0,
  },
  {
    id: "spending-snapshot",
    name: "Spending Snapshot",
    description: "Beautiful visual summary card — share your year-in-review with anyone",
    icon: "✨",
    format: "snapshot",
    dateRange: "ytd",
    categories: "all",
    badge: "Share",
    badgeColor: "bg-amber-100 text-amber-700",
    accentColor: "#d97706",
    usageCount: 0,
  },
];

// ─── Date range filter ─────────────────────────────────────────────────────────

export function applyDateRange(expenses: Expense[], range: DateRangePreset): Expense[] {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const pad = (n: number) => String(n).padStart(2, "0");
  const iso = (yr: number, mo: number, day: number) =>
    `${yr}-${pad(mo + 1)}-${pad(day)}`;

  switch (range) {
    case "all": return expenses;
    case "current-month": {
      const f = iso(y, m, 1);
      const t = iso(y, m, new Date(y, m + 1, 0).getDate());
      return expenses.filter((e) => e.date >= f && e.date <= t);
    }
    case "last-month": {
      const lm = m === 0 ? 11 : m - 1;
      const ly = m === 0 ? y - 1 : y;
      const f = iso(ly, lm, 1);
      const t = iso(ly, lm, new Date(ly, lm + 1, 0).getDate());
      return expenses.filter((e) => e.date >= f && e.date <= t);
    }
    case "last-3-months": {
      const d = new Date(y, m - 2, 1);
      const f = iso(d.getFullYear(), d.getMonth(), 1);
      const t = iso(y, m, new Date(y, m + 1, 0).getDate());
      return expenses.filter((e) => e.date >= f && e.date <= t);
    }
    case "ytd":
      return expenses.filter((e) => e.date >= `${y}-01-01`);
    case "last-year":
      return expenses.filter((e) => e.date >= `${y - 1}-01-01` && e.date <= `${y - 1}-12-31`);
  }
}

// ─── Share link ────────────────────────────────────────────────────────────────

export function generateShareId(): string {
  return Array.from({ length: 12 }, () => Math.random().toString(36)[2]).join("");
}

// ─── Next run computation ──────────────────────────────────────────────────────

export function computeNextRun(s: ScheduleConfig): string {
  const now = new Date();
  const next = new Date(now);
  if (s.frequency === "daily") {
    next.setDate(now.getDate() + 1);
  } else if (s.frequency === "weekly") {
    const diff = (s.dayOfWeek - now.getDay() + 7) % 7 || 7;
    next.setDate(now.getDate() + diff);
  } else {
    next.setMonth(now.getMonth() + 1, Math.min(s.dayOfMonth, 28));
  }
  next.setHours(s.hour, 0, 0, 0);
  return next.toISOString();
}

// ─── LocalStorage helpers ──────────────────────────────────────────────────────

const HISTORY_KEY = "etai_export_history";
const SCHEDULE_KEY = "etai_export_schedule";
const CONNECTIONS_KEY = "etai_export_connections";
const TEMPLATES_KEY = "etai_export_templates";

function seedHistory(): HistoryEntry[] {
  const ago = (days: number) => new Date(Date.now() - days * 864e5).toISOString();
  return [
    { id: "seed-1", timestamp: ago(3), templateName: "Monthly Summary", templateIcon: "📅", destination: "email", format: "pdf", recordCount: 10, fileSizeKB: 42, status: "success" },
    { id: "seed-2", timestamp: ago(17), templateName: "Tax Report", templateIcon: "🧾", destination: "download", format: "csv", recordCount: 10, fileSizeKB: 8, status: "success" },
    { id: "seed-3", timestamp: ago(34), templateName: "Category Analysis", templateIcon: "🏷️", destination: "sheets", format: "json", recordCount: 10, fileSizeKB: 14, status: "success" },
    { id: "seed-4", timestamp: ago(51), templateName: "Business Expenses", templateIcon: "💼", destination: "dropbox", format: "csv", recordCount: 4, fileSizeKB: 3, status: "failed" },
  ];
}

export function loadHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (raw) return JSON.parse(raw);
    const seeded = seedHistory();
    localStorage.setItem(HISTORY_KEY, JSON.stringify(seeded));
    return seeded;
  } catch { return []; }
}

export function addHistoryEntry(entry: Omit<HistoryEntry, "id">): HistoryEntry {
  const full: HistoryEntry = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, ...entry };
  const history = [full, ...loadHistory()].slice(0, 50);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  return full;
}

export function clearHistory(): void {
  localStorage.removeItem(HISTORY_KEY);
}

export function loadSchedule(): ScheduleConfig {
  if (typeof window === "undefined") return defaultSchedule();
  try {
    return JSON.parse(localStorage.getItem(SCHEDULE_KEY) || "null") ?? defaultSchedule();
  } catch { return defaultSchedule(); }
}

export function saveSchedule(s: ScheduleConfig): void {
  localStorage.setItem(SCHEDULE_KEY, JSON.stringify(s));
}

function defaultSchedule(): ScheduleConfig {
  return { enabled: false, frequency: "monthly", dayOfWeek: 1, dayOfMonth: 1, hour: 9, templateId: "monthly-summary", destination: "email", runCount: 0 };
}

export function loadConnections(): ConnectionMap {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(CONNECTIONS_KEY) || "null") ?? {};
  } catch { return {}; }
}

export function saveConnections(c: ConnectionMap): void {
  localStorage.setItem(CONNECTIONS_KEY, JSON.stringify(c));
}

export function loadTemplateCounts(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(TEMPLATES_KEY) || "{}");
  } catch { return {}; }
}

export function incrementTemplateCount(id: string): void {
  const counts = loadTemplateCounts();
  counts[id] = (counts[id] ?? 0) + 1;
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(counts));
}
