"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import {
  X,
  Download,
  FileText,
  FileJson,
  File,
  Calendar,
  Tag,
  Eye,
  CheckSquare,
  Square,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Expense, Category } from "@/types/expense";
import { CATEGORIES, CATEGORY_ICONS, CATEGORY_COLORS } from "@/lib/constants";
import { formatDate, formatCurrency } from "@/lib/utils";
import { ExportFormat, exportCSV, exportJSON, exportPDF } from "@/lib/exportUtils";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  expenses: Expense[];
}

const FORMAT_CONFIG: Record<ExportFormat, { label: string; icon: React.ReactNode; description: string; color: string }> = {
  csv: {
    label: "CSV",
    icon: <FileText size={18} />,
    description: "Spreadsheet-compatible",
    color: "text-emerald-600",
  },
  json: {
    label: "JSON",
    icon: <FileJson size={18} />,
    description: "Developer-friendly",
    color: "text-blue-600",
  },
  pdf: {
    label: "PDF",
    icon: <File size={18} />,
    description: "Print-ready report",
    color: "text-rose-600",
  },
};

export default function ExportModal({ isOpen, onClose, expenses }: ExportModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  const today = new Date().toISOString().split("T")[0];
  const [format, setFormat] = useState<ExportFormat>("csv");
  const [filename, setFilename] = useState(`expenses-${today}`);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<Set<Category>>(
    new Set(CATEGORIES)
  );
  const [isExporting, setIsExporting] = useState(false);
  const [exportDone, setExportDone] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setExportDone(false);
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      if (!selectedCategories.has(e.category)) return false;
      if (dateFrom && e.date < dateFrom) return false;
      if (dateTo && e.date > dateTo) return false;
      return true;
    });
  }, [expenses, selectedCategories, dateFrom, dateTo]);

  const totalAmount = useMemo(
    () => filteredExpenses.reduce((s, e) => s + e.amount, 0),
    [filteredExpenses]
  );

  const previewRows = useMemo(
    () =>
      [...filteredExpenses]
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 8),
    [filteredExpenses]
  );

  function toggleCategory(cat: Category) {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) {
        next.delete(cat);
      } else {
        next.add(cat);
      }
      return next;
    });
  }

  function toggleAll() {
    setSelectedCategories(
      selectedCategories.size === CATEGORIES.length ? new Set() : new Set(CATEGORIES)
    );
  }

  async function handleExport() {
    if (filteredExpenses.length === 0) return;
    setIsExporting(true);
    await new Promise((r) => setTimeout(r, 600));
    try {
      const name = filename.trim() || `expenses-${today}`;
      if (format === "csv") exportCSV(filteredExpenses, name);
      else if (format === "json") exportJSON(filteredExpenses, name);
      else exportPDF(filteredExpenses, name);
      setExportDone(true);
      setTimeout(() => setExportDone(false), 2500);
    } finally {
      setIsExporting(false);
    }
  }

  if (!isOpen) return null;

  const allSelected = selectedCategories.size === CATEGORIES.length;
  const noneSelected = selectedCategories.size === 0;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
              <Download size={18} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Export Data</h2>
              <p className="text-xs text-gray-500">Configure and preview your export</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body - two columns */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left: Options */}
          <div className="w-72 flex-shrink-0 border-r border-gray-100 overflow-y-auto p-5 space-y-6">

            {/* Format selector */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                <FileText size={12} /> Format
              </label>
              <div className="space-y-2">
                {(Object.entries(FORMAT_CONFIG) as [ExportFormat, typeof FORMAT_CONFIG[ExportFormat]][]).map(
                  ([key, cfg]) => (
                    <button
                      key={key}
                      onClick={() => setFormat(key)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 text-left transition-all",
                        format === key
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      )}
                    >
                      <span className={cn(format === key ? cfg.color : "text-gray-400")}>
                        {cfg.icon}
                      </span>
                      <div>
                        <div className={cn("text-sm font-semibold", format === key ? "text-gray-900" : "text-gray-600")}>
                          {cfg.label}
                        </div>
                        <div className="text-xs text-gray-400">{cfg.description}</div>
                      </div>
                      {format === key && (
                        <div className="ml-auto w-2 h-2 rounded-full bg-blue-500" />
                      )}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Filename */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <File size={12} /> Filename
              </label>
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
                <input
                  type="text"
                  value={filename}
                  onChange={(e) => setFilename(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm outline-none bg-transparent"
                  placeholder="expenses-2024-01-01"
                />
                <span className="px-2 py-2 text-xs text-gray-400 bg-gray-50 border-l border-gray-200">
                  .{format}
                </span>
              </div>
            </div>

            {/* Date range */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                <Calendar size={12} /> Date Range
              </label>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-gray-400 mb-1">From</p>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">To</p>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
                {(dateFrom || dateTo) && (
                  <button
                    onClick={() => { setDateFrom(""); setDateTo(""); }}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Clear range
                  </button>
                )}
              </div>
            </div>

            {/* Categories */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Tag size={12} /> Categories
                </label>
                <button
                  onClick={toggleAll}
                  className="text-xs text-blue-600 hover:underline"
                >
                  {allSelected ? "None" : "All"}
                </button>
              </div>
              <div className="space-y-1.5">
                {CATEGORIES.map((cat) => {
                  const checked = selectedCategories.has(cat);
                  return (
                    <button
                      key={cat}
                      onClick={() => toggleCategory(cat)}
                      className={cn(
                        "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-colors text-sm",
                        checked ? "bg-gray-50" : "opacity-50 hover:opacity-75"
                      )}
                    >
                      <span className={checked ? "text-blue-600" : "text-gray-300"}>
                        {checked ? <CheckSquare size={15} /> : <Square size={15} />}
                      </span>
                      <span className="text-base leading-none">{CATEGORY_ICONS[cat]}</span>
                      <span className="text-gray-700">{cat}</span>
                      <span
                        className="ml-auto text-xs font-medium px-1.5 py-0.5 rounded"
                        style={{
                          backgroundColor: `${CATEGORY_COLORS[cat]}18`,
                          color: CATEGORY_COLORS[cat],
                        }}
                      >
                        {expenses.filter((e) => e.category === cat).length}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Preview */}
          <div className="flex-1 overflow-hidden flex flex-col">
            {/* Summary bar */}
            <div className="px-6 py-4 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-center gap-2 mb-3">
                <Eye size={14} className="text-gray-400" />
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Preview</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-3 border border-blue-100">
                  <p className="text-xs text-blue-600 font-medium mb-0.5">Records</p>
                  <p className="text-2xl font-bold text-blue-700">{filteredExpenses.length}</p>
                  <p className="text-xs text-blue-400">of {expenses.length} total</p>
                </div>
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl p-3 border border-emerald-100">
                  <p className="text-xs text-emerald-600 font-medium mb-0.5">Total</p>
                  <p className="text-xl font-bold text-emerald-700 truncate">{formatCurrency(totalAmount)}</p>
                  <p className="text-xs text-emerald-400">sum of filtered</p>
                </div>
                <div className="bg-gradient-to-br from-violet-50 to-violet-100/50 rounded-xl p-3 border border-violet-100">
                  <p className="text-xs text-violet-600 font-medium mb-0.5">Format</p>
                  <p className="text-2xl font-bold text-violet-700 uppercase">{format}</p>
                  <p className="text-xs text-violet-400">{FORMAT_CONFIG[format].description}</p>
                </div>
              </div>
            </div>

            {/* Preview table */}
            <div className="flex-1 overflow-auto p-6">
              {filteredExpenses.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-400">
                  <AlertCircle size={32} className="text-gray-300" />
                  <p className="text-sm font-medium">No records match your filters</p>
                  <p className="text-xs">Adjust the date range or select more categories</p>
                </div>
              ) : (
                <>
                  <div className="rounded-xl border border-gray-200 overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="text-left px-4 py-2.5 font-semibold text-gray-600 text-xs">Date</th>
                          <th className="text-left px-4 py-2.5 font-semibold text-gray-600 text-xs">Category</th>
                          <th className="text-right px-4 py-2.5 font-semibold text-gray-600 text-xs">Amount</th>
                          <th className="text-left px-4 py-2.5 font-semibold text-gray-600 text-xs">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {previewRows.map((e) => (
                          <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-2.5 text-gray-500 text-xs whitespace-nowrap">
                              {formatDate(e.date)}
                            </td>
                            <td className="px-4 py-2.5">
                              <span
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                                style={{
                                  backgroundColor: `${CATEGORY_COLORS[e.category]}18`,
                                  color: CATEGORY_COLORS[e.category],
                                }}
                              >
                                {CATEGORY_ICONS[e.category]} {e.category}
                              </span>
                            </td>
                            <td className="px-4 py-2.5 text-right font-semibold text-gray-900 tabular-nums">
                              {formatCurrency(e.amount)}
                            </td>
                            <td className="px-4 py-2.5 text-gray-600 max-w-[160px] truncate">
                              {e.description}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {filteredExpenses.length > 8 && (
                    <p className="text-xs text-center text-gray-400 mt-3">
                      Showing 8 of {filteredExpenses.length} records — all records will be exported
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 flex-shrink-0 bg-gray-50/50">
          <div className="text-xs text-gray-400">
            {noneSelected
              ? "Select at least one category"
              : `${filteredExpenses.length} record${filteredExpenses.length !== 1 ? "s" : ""} ready to export`}
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={onClose} disabled={isExporting}>
              Cancel
            </Button>
            <Button
              onClick={handleExport}
              disabled={filteredExpenses.length === 0 || isExporting}
              loading={isExporting}
              className={cn(
                "min-w-[130px] transition-all",
                exportDone && "bg-emerald-600 hover:bg-emerald-700"
              )}
            >
              {exportDone ? (
                "Downloaded!"
              ) : isExporting ? (
                "Exporting..."
              ) : (
                <>
                  <Download size={15} />
                  Export {format.toUpperCase()}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
