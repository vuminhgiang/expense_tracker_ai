"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  X, Download, Mail, Table2, HardDrive, Cloud, Link2,
  CheckCircle, XCircle, Clock, RefreshCw, Zap, Copy,
  Check, Calendar, LayoutTemplate, History, Wifi, WifiOff,
  ChevronRight, AlertCircle, Sparkles, Share2, Trash2,
} from "lucide-react";
import { Expense } from "@/types/expense";
import { formatCurrency } from "@/lib/utils";
import { CATEGORY_COLORS, CATEGORY_ICONS } from "@/lib/constants";
import {
  EXPORT_TEMPLATES, ExportTemplate, ExportDestination, HistoryEntry, ScheduleConfig,
  ConnectionMap, DateRangePreset,
  loadHistory, addHistoryEntry, clearHistory,
  loadSchedule, saveSchedule,
  loadConnections, saveConnections,
  loadTemplateCounts, incrementTemplateCount,
  applyDateRange, generateShareId, computeNextRun,
} from "@/lib/cloudExport";
import { exportCSV, exportJSON, exportPDF, exportSnapshot } from "@/lib/exportUtils";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";

// ─── Constants ────────────────────────────────────────────────────────────────

type HubTab = "templates" | "destinations" | "schedule" | "history";

const DESTINATION_META: Record<ExportDestination, { label: string; icon: React.ReactNode; description: string; color: string }> = {
  download: { label: "Direct Download", icon: <Download size={18} />, description: "Save to your device instantly", color: "#1d4ed8" },
  email:    { label: "Email",           icon: <Mail size={18} />,     description: "Send to any email address",    color: "#7c3aed" },
  sheets:   { label: "Google Sheets",   icon: <Table2 size={18} />,   description: "Sync directly to a spreadsheet", color: "#15803d" },
  dropbox:  { label: "Dropbox",         icon: <HardDrive size={18} />, description: "Auto-save to your Dropbox",   color: "#0061ff" },
  onedrive: { label: "OneDrive",        icon: <Cloud size={18} />,    description: "Sync with Microsoft OneDrive", color: "#0078d4" },
  link:     { label: "Share Link",      icon: <Link2 size={18} />,    description: "Generate a shareable URL",     color: "#d97706" },
};

const DATE_RANGE_LABELS: Record<DateRangePreset, string> = {
  all: "All time",
  "current-month": "This month",
  "last-month": "Last month",
  "last-3-months": "Last 3 months",
  ytd: "Year to date",
  "last-year": "Last year",
};

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// ─── Sub-components ───────────────────────────────────────────────────────────

function Toast({ message }: { message: string }) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] bg-gray-900 text-white text-sm px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
      <Check size={14} className="text-emerald-400" />
      {message}
    </div>
  );
}

function StatusBadge({ connected }: { connected: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium",
      connected ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500")}>
      {connected ? <Wifi size={10} /> : <WifiOff size={10} />}
      {connected ? "Connected" : "Not connected"}
    </span>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface ExportHubProps {
  isOpen: boolean;
  onClose: () => void;
  expenses: Expense[];
}

export default function ExportHub({ isOpen, onClose, expenses }: ExportHubProps) {
  const [activeTab, setActiveTab] = useState<HubTab>("templates");
  const [connections, setConnections] = useState<ConnectionMap>({});
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [schedule, setSchedule] = useState<ScheduleConfig | null>(null);
  const [usageCounts, setUsageCounts] = useState<Record<string, number>>({});
  const [connectingTo, setConnectingTo] = useState<ExportDestination | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [exporting, setExporting] = useState<string | null>(null);
  const [shareLink, setShareLink] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [emailTo, setEmailTo] = useState("");
  const [emailConnected, setEmailConnected] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [scheduleSaved, setScheduleSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setConnections(loadConnections());
      setHistory(loadHistory());
      setSchedule(loadSchedule());
      setUsageCounts(loadTemplateCounts());
    }
  }, [isOpen]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    const handle = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (isOpen) window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [isOpen, onClose]);

  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const copiedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scheduleSavedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
      if (copiedTimer.current) clearTimeout(copiedTimer.current);
      if (scheduleSavedTimer.current) clearTimeout(scheduleSavedTimer.current);
    };
  }, []);

  function showToast(msg: string) {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(msg);
    toastTimer.current = setTimeout(() => setToast(null), 2400);
  }

  async function runTemplateExport(tpl: ExportTemplate) {
    setExporting(tpl.id);
    await new Promise((r) => setTimeout(r, 700));
    try {
      const filtered = applyDateRange(expenses, tpl.dateRange);
      const subset = tpl.categories === "all"
        ? filtered
        : filtered.filter((e) => (tpl.categories as string[]).includes(e.category));
      const filename = `${tpl.id}-${new Date().toISOString().split("T")[0]}`;

      if (tpl.format === "csv")      exportCSV(subset, filename);
      else if (tpl.format === "json") exportJSON(subset, filename);
      else if (tpl.format === "pdf")  exportPDF(subset, filename, tpl.name);
      else if (tpl.format === "snapshot") exportSnapshot(subset, tpl.name);

      incrementTemplateCount(tpl.id);
      setUsageCounts(loadTemplateCounts());

      const entry = addHistoryEntry({
        timestamp: new Date().toISOString(),
        templateName: tpl.name,
        templateIcon: tpl.icon,
        destination: "download",
        format: tpl.format,
        recordCount: subset.length,
        fileSizeKB: Math.round(subset.length * 0.8 + 2),
        status: "success",
      });
      setHistory((h) => [entry, ...h]);
      showToast(`${tpl.icon} ${tpl.name} exported successfully`);
    } finally {
      setExporting(null);
    }
  }

  async function connectService(dest: ExportDestination) {
    if (dest === "email") {
      if (!emailTo.includes("@")) { showToast("Enter a valid email first"); return; }
      setSendingEmail(true);
      await new Promise((r) => setTimeout(r, 1200));
      setSendingEmail(false);
      setEmailConnected(true);
      const next = { ...connections, email: { connected: true, detail: emailTo } };
      setConnections(next);
      saveConnections(next);
      showToast(`✓ Connected — verification sent to ${emailTo}`);
      return;
    }
    setConnectingTo(dest);
    await new Promise((r) => setTimeout(r, 1800));
    const meta = DESTINATION_META[dest];
    const detail = dest === "sheets"
      ? "https://docs.google.com/spreadsheets/d/mock-sheet-id"
      : dest === "dropbox" ? "/Apps/ExpenseTracker"
      : dest === "onedrive" ? "/Documents/ExpenseTracker"
      : undefined;
    const next = { ...connections, [dest]: { connected: true, detail } };
    setConnections(next);
    saveConnections(next);
    setConnectingTo(null);
    showToast(`✓ Connected to ${meta.label}`);
  }

  function disconnectService(dest: ExportDestination) {
    const next = { ...connections, [dest]: { connected: false } };
    if (dest === "email") setEmailConnected(false);
    setConnections(next);
    saveConnections(next);
  }

  function generateLink() {
    const id = generateShareId();
    const link = `https://expensetracker.app/shared/${id}`;
    setShareLink(link);
    const next = { ...connections, link: { connected: true, detail: link } };
    setConnections(next);
    saveConnections(next);
  }

  async function copyLink() {
    if (!shareLink) return;
    await navigator.clipboard.writeText(shareLink).catch(() => {});
    setCopied(true);
    if (copiedTimer.current) clearTimeout(copiedTimer.current);
    copiedTimer.current = setTimeout(() => setCopied(false), 2000);
    showToast("Link copied to clipboard");
  }

  function updateSchedule(patch: Partial<ScheduleConfig>) {
    setSchedule((s) => s ? { ...s, ...patch } : null);
  }

  function handleSaveSchedule() {
    if (!schedule) return;
    const updated = { ...schedule, nextRun: computeNextRun(schedule) };
    saveSchedule(updated);
    setSchedule(updated);
    setScheduleSaved(true);
    if (scheduleSavedTimer.current) clearTimeout(scheduleSavedTimer.current);
    scheduleSavedTimer.current = setTimeout(() => setScheduleSaved(false), 2000);
    showToast("Schedule saved");
  }

  function handleClearHistory() {
    clearHistory();
    setHistory([]);
    showToast("Export history cleared");
  }

  // ─── Tabs ──────────────────────────────────────────────────────────────────

  const tabs: { id: HubTab; label: string; icon: React.ReactNode }[] = [
    { id: "templates",    label: "Templates",    icon: <LayoutTemplate size={15} /> },
    { id: "destinations", label: "Destinations", icon: <Share2 size={15} /> },
    { id: "schedule",     label: "Schedule",     icon: <Calendar size={15} /> },
    { id: "history",      label: "History",      icon: <History size={15} /> },
  ];

  if (!isOpen) return null;

  return (
    <>
      {toast && <Toast message={toast} />}

      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 flex flex-col w-full max-w-[680px] bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
              <Zap size={18} className="text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold">Export Hub</h2>
                <span className="text-xs bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full font-medium">
                  Cloud
                </span>
              </div>
              <p className="text-xs text-slate-400">{expenses.length} records · {formatCurrency(expenses.reduce((s,e)=>s+e.amount,0))} total</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Tab bar */}
        <div className="flex border-b border-gray-100 bg-gray-50 flex-shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium transition-all border-b-2",
                activeTab === tab.id
                  ? "border-blue-600 text-blue-600 bg-white"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              )}
            >
              {tab.icon}
              {tab.label}
              {tab.id === "history" && history.length > 0 && (
                <span className="ml-0.5 bg-gray-200 text-gray-600 text-[10px] px-1.5 rounded-full">
                  {history.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto">

          {/* ── Templates ── */}
          {activeTab === "templates" && (
            <div className="p-5">
              <p className="text-xs text-gray-500 mb-4">
                Pre-built export configurations — one click to download in the right format for each use case.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {EXPORT_TEMPLATES.map((tpl) => {
                  const count = usageCounts[tpl.id] ?? 0;
                  const subset = (() => {
                    const f = applyDateRange(expenses, tpl.dateRange);
                    return tpl.categories === "all" ? f : f.filter(e => (tpl.categories as string[]).includes(e.category));
                  })();
                  const isRunning = exporting === tpl.id;
                  return (
                    <div
                      key={tpl.id}
                      className="group relative bg-white border border-gray-200 rounded-2xl p-4 hover:border-gray-300 hover:shadow-md transition-all flex flex-col"
                    >
                      {/* Accent bar */}
                      <div
                        className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
                        style={{ background: tpl.accentColor }}
                      />
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-2xl">{tpl.icon}</span>
                        <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded-full", tpl.badgeColor)}>
                          {tpl.badge}
                        </span>
                      </div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-1">{tpl.name}</h3>
                      <p className="text-xs text-gray-500 mb-3 flex-1 leading-relaxed">{tpl.description}</p>
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-mono uppercase">
                          {tpl.format}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {DATE_RANGE_LABELS[tpl.dateRange]}
                        </span>
                        <span className="text-[10px] text-gray-400 ml-auto">
                          {subset.length} records
                        </span>
                      </div>
                      <button
                        onClick={() => runTemplateExport(tpl)}
                        disabled={isRunning || subset.length === 0}
                        className={cn(
                          "w-full py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all",
                          subset.length === 0
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : isRunning
                            ? "bg-gray-100 text-gray-500"
                            : "text-white hover:opacity-90 active:scale-[0.98]"
                        )}
                        style={subset.length > 0 && !isRunning ? { background: tpl.accentColor } : {}}
                      >
                        {isRunning ? (
                          <><RefreshCw size={12} className="animate-spin" /> Exporting…</>
                        ) : (
                          <><Download size={12} /> Export Now</>
                        )}
                      </button>
                      {count > 0 && (
                        <p className="text-[10px] text-center text-gray-400 mt-2">
                          Used {count} time{count !== 1 ? "s" : ""}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Destinations ── */}
          {activeTab === "destinations" && (
            <div className="p-5 space-y-4">
              <p className="text-xs text-gray-500">
                Connect your accounts to enable one-click exports and automatic syncing to your preferred destinations.
              </p>

              {/* Direct download + Share Link (always available) */}
              <div className="space-y-2">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-1">Always available</p>

                {/* Direct Download */}
                <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                    <Download size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">Direct Download</p>
                    <p className="text-xs text-gray-500">Save file to device immediately</p>
                  </div>
                  <StatusBadge connected />
                </div>

                {/* Share Link */}
                <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 flex-shrink-0">
                      <Link2 size={18} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Share Link</p>
                      <p className="text-xs text-gray-500">Generate a shareable URL · expires in 7 days</p>
                    </div>
                    <button
                      onClick={generateLink}
                      className="text-xs bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors flex-shrink-0"
                    >
                      {shareLink ? "Regenerate" : "Generate"}
                    </button>
                  </div>
                  {shareLink && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          readOnly
                          value={shareLink}
                          className="flex-1 text-xs bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 font-mono text-gray-600 truncate"
                        />
                        <button
                          onClick={copyLink}
                          className={cn(
                            "flex items-center gap-1 text-xs px-3 py-2 rounded-lg font-medium transition-all flex-shrink-0",
                            copied ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                          )}
                        >
                          {copied ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy</>}
                        </button>
                      </div>
                      {/* Mini snapshot card preview */}
                      <div className="rounded-xl overflow-hidden border border-amber-200 bg-gradient-to-br from-slate-800 to-indigo-900 p-3 text-white">
                        <p className="text-[10px] text-white/50 mb-2 uppercase tracking-wider">Link preview</p>
                        <p className="text-base font-bold">{formatCurrency(expenses.reduce((s,e)=>s+e.amount,0))}</p>
                        <p className="text-xs text-white/60">{expenses.length} expenses · Shared snapshot</p>
                        <div className="mt-2 flex gap-1">
                          {Object.entries(expenses.reduce<Record<string,number>>((a,e)=>({...a,[e.category]:(a[e.category]??0)+e.amount}),{}))
                            .sort((a,b)=>b[1]-a[1]).slice(0,3).map(([cat])=>(
                            <span key={cat} className="text-xs bg-white/10 rounded px-1.5 py-0.5">
                              {CATEGORY_ICONS[cat as keyof typeof CATEGORY_ICONS]} {cat}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Cloud services */}
              <div className="space-y-2">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-1">Cloud integrations</p>

                {/* Email */}
                <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600 flex-shrink-0">
                      <Mail size={18} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Email</p>
                      <p className="text-xs text-gray-500">
                        {connections.email?.connected ? `Sending to ${connections.email.detail}` : "Send exports directly to your inbox"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <StatusBadge connected={connections.email?.connected ?? false} />
                      {connections.email?.connected && (
                        <button onClick={() => disconnectService("email")} className="text-[10px] text-gray-400 hover:text-red-500 transition-colors">
                          Disconnect
                        </button>
                      )}
                    </div>
                  </div>
                  {!connections.email?.connected && (
                    <div className="flex gap-2">
                      <input
                        type="email"
                        value={emailTo}
                        onChange={(e) => setEmailTo(e.target.value)}
                        placeholder="your@email.com"
                        className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                      />
                      <button
                        onClick={() => connectService("email")}
                        disabled={sendingEmail}
                        className="flex items-center gap-1.5 text-xs bg-violet-600 hover:bg-violet-700 text-white px-3 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                      >
                        {sendingEmail ? <><RefreshCw size={11} className="animate-spin" /> Connecting…</> : "Connect"}
                      </button>
                    </div>
                  )}
                </div>

                {/* Google Sheets, Dropbox, OneDrive */}
                {(["sheets", "dropbox", "onedrive"] as ExportDestination[]).map((dest) => {
                  const meta = DESTINATION_META[dest];
                  const conn = connections[dest];
                  const isConnecting = connectingTo === dest;
                  return (
                    <div key={dest} className="bg-white border border-gray-200 rounded-xl p-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-white"
                          style={{ background: meta.color }}
                        >
                          {meta.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{meta.label}</p>
                          <p className="text-xs text-gray-500 truncate">
                            {conn?.connected && conn.detail ? conn.detail : meta.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <StatusBadge connected={conn?.connected ?? false} />
                          {conn?.connected ? (
                            <button onClick={() => disconnectService(dest)} className="text-[10px] text-gray-400 hover:text-red-500 transition-colors">
                              Disconnect
                            </button>
                          ) : (
                            <button
                              onClick={() => connectService(dest)}
                              disabled={isConnecting}
                              className="flex items-center gap-1 text-xs border border-gray-300 hover:bg-gray-50 px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50"
                            >
                              {isConnecting ? <><RefreshCw size={11} className="animate-spin" /> Connecting…</> : "Connect"}
                            </button>
                          )}
                        </div>
                      </div>
                      {conn?.connected && dest === "sheets" && (
                        <div className="mt-3 flex items-center gap-2">
                          <a href="#" className="text-xs text-green-700 hover:underline flex items-center gap-1">
                            <ChevronRight size={11} /> Open in Google Sheets
                          </a>
                          <button className="text-xs text-gray-500 hover:text-gray-700 ml-auto flex items-center gap-1">
                            <RefreshCw size={11} /> Sync now
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Schedule ── */}
          {activeTab === "schedule" && schedule && (
            <div className="p-5 space-y-5">
              {/* Toggle */}
              <div className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-5 py-4">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Automatic Exports</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {schedule.enabled
                      ? `Runs ${schedule.frequency} — ${schedule.runCount} run${schedule.runCount !== 1 ? "s" : ""} completed`
                      : "Enable to run exports on a schedule"}
                  </p>
                </div>
                <button
                  onClick={() => updateSchedule({ enabled: !schedule.enabled })}
                  className={cn(
                    "relative w-11 h-6 rounded-full transition-colors",
                    schedule.enabled ? "bg-blue-600" : "bg-gray-300"
                  )}
                >
                  <span className={cn("absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform",
                    schedule.enabled ? "translate-x-5.5" : "translate-x-0.5"
                  )} />
                </button>
              </div>

              {schedule.enabled && (
                <>
                  {/* Template + Destination */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Template</label>
                      <select
                        value={schedule.templateId}
                        onChange={(e) => updateSchedule({ templateId: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {EXPORT_TEMPLATES.filter(t => t.format !== "snapshot").map((t) => (
                          <option key={t.id} value={t.id}>{t.icon} {t.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Destination</label>
                      <select
                        value={schedule.destination}
                        onChange={(e) => updateSchedule({ destination: e.target.value as ExportDestination })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="download">Direct Download</option>
                        <option value="email" disabled={!connections.email?.connected}>
                          Email {!connections.email?.connected ? "(connect first)" : ""}
                        </option>
                        <option value="sheets" disabled={!connections.sheets?.connected}>
                          Google Sheets {!connections.sheets?.connected ? "(connect first)" : ""}
                        </option>
                        <option value="dropbox" disabled={!connections.dropbox?.connected}>
                          Dropbox {!connections.dropbox?.connected ? "(connect first)" : ""}
                        </option>
                      </select>
                    </div>
                  </div>

                  {/* Frequency */}
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">Frequency</label>
                    <div className="flex gap-2">
                      {(["daily", "weekly", "monthly"] as const).map((freq) => (
                        <button
                          key={freq}
                          onClick={() => updateSchedule({ frequency: freq })}
                          className={cn(
                            "flex-1 py-2.5 rounded-xl text-sm font-medium border-2 capitalize transition-all",
                            schedule.frequency === freq
                              ? "border-blue-500 bg-blue-50 text-blue-700"
                              : "border-gray-200 text-gray-500 hover:border-gray-300"
                          )}
                        >
                          {freq}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Day picker */}
                  {schedule.frequency === "weekly" && (
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">Day of week</label>
                      <div className="flex gap-1.5">
                        {DAY_NAMES.map((d, i) => (
                          <button
                            key={d}
                            onClick={() => updateSchedule({ dayOfWeek: i })}
                            className={cn(
                              "flex-1 py-2 text-xs font-semibold rounded-lg transition-all",
                              schedule.dayOfWeek === i
                                ? "bg-blue-600 text-white"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            )}
                          >
                            {d}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {schedule.frequency === "monthly" && (
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
                        Day of month
                      </label>
                      <select
                        value={schedule.dayOfMonth}
                        onChange={(e) => updateSchedule({ dayOfMonth: Number(e.target.value) })}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
                          <option key={d} value={d}>
                            {d}{d === 1 ? "st" : d === 2 ? "nd" : d === 3 ? "rd" : "th"}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Time */}
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">Time</label>
                    <select
                      value={schedule.hour}
                      onChange={(e) => updateSchedule({ hour: Number(e.target.value) })}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {Array.from({ length: 24 }, (_, h) => (
                        <option key={h} value={h}>
                          {h === 0 ? "12:00 AM" : h < 12 ? `${h}:00 AM` : h === 12 ? "12:00 PM" : `${h - 12}:00 PM`}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Next run preview */}
                  <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex items-center gap-3">
                    <Clock size={16} className="text-blue-500 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-blue-700">Next scheduled run</p>
                      <p className="text-sm text-blue-900">
                        {new Date(computeNextRun(schedule)).toLocaleDateString("en-US", {
                          weekday: "long", month: "long", day: "numeric", hour: "numeric", minute: "2-digit"
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="text-xs text-gray-400 bg-gray-50 rounded-xl px-4 py-3 flex gap-2">
                    <AlertCircle size={13} className="flex-shrink-0 mt-0.5 text-gray-400" />
                    In a production deployment, scheduled exports run server-side. This demo saves your preferences locally and shows you exactly what the experience would look like.
                  </div>
                </>
              )}

              <Button
                onClick={handleSaveSchedule}
                className={cn("w-full", scheduleSaved && "bg-emerald-600 hover:bg-emerald-700")}
              >
                {scheduleSaved ? <><Check size={15} /> Saved!</> : "Save Schedule"}
              </Button>
            </div>
          )}

          {/* ── History ── */}
          {activeTab === "history" && (
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs text-gray-500">{history.length} export{history.length !== 1 ? "s" : ""} recorded</p>
                {history.length > 0 && (
                  <button
                    onClick={handleClearHistory}
                    className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={12} /> Clear all
                  </button>
                )}
              </div>

              {history.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                    <History size={22} className="text-gray-300" />
                  </div>
                  <p className="text-sm font-medium text-gray-500">No exports yet</p>
                  <p className="text-xs text-gray-400 mt-1">Your export history will appear here</p>
                </div>
              ) : (
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-4 top-3 bottom-3 w-px bg-gray-200" />

                  <div className="space-y-1">
                    {history.map((entry) => {
                      const destMeta = DESTINATION_META[entry.destination];
                      const relTime = (() => {
                        const diff = Date.now() - new Date(entry.timestamp).getTime();
                        const m = Math.floor(diff / 60000);
                        const h = Math.floor(m / 60);
                        const d = Math.floor(h / 24);
                        if (d > 0) return `${d}d ago`;
                        if (h > 0) return `${h}h ago`;
                        if (m > 0) return `${m}m ago`;
                        return "Just now";
                      })();

                      return (
                        <div key={entry.id} className="flex gap-4 pl-3">
                          {/* Timeline dot */}
                          <div className={cn(
                            "flex-shrink-0 w-3 h-3 rounded-full border-2 border-white mt-4 z-10",
                            entry.status === "success" ? "bg-emerald-500" : "bg-red-400"
                          )} />

                          {/* Card */}
                          <div className="flex-1 bg-white border border-gray-100 rounded-xl p-3 mb-2 hover:border-gray-200 transition-colors">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="text-base leading-none">{entry.templateIcon}</span>
                                <div className="min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">{entry.templateName}</p>
                                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                    <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                                      {destMeta.icon} {destMeta.label}
                                    </span>
                                    <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-mono uppercase">
                                      {entry.format}
                                    </span>
                                    <span className="text-[10px] text-gray-400">
                                      {entry.recordCount} records · {entry.fileSizeKB}KB
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex-shrink-0 flex flex-col items-end gap-1">
                                <span className="text-[10px] text-gray-400">{relTime}</span>
                                {entry.status === "success"
                                  ? <CheckCircle size={14} className="text-emerald-500" />
                                  : <XCircle size={14} className="text-red-400" />}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50 flex-shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Sparkles size={12} className="text-amber-400" />
            <span>{Object.values(connections).filter(c => c?.connected).length} service{Object.values(connections).filter(c => c?.connected).length !== 1 ? "s" : ""} connected</span>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </>
  );
}
