"use client";

import { useState } from "react";
import { Pencil, X, Check, Wallet, TrendingUp } from "lucide-react";
import { useBudget } from "@/hooks/useBudget";
import { getBudgetPercentage, getBudgetStatus, getRemainingBudget } from "@/lib/budget";
import { formatCurrency } from "@/lib/utils";

interface BudgetPanelProps {
  monthlySpending: number;
}

const STATUS_STYLES = {
  safe: {
    bar: "bg-emerald-500",
    text: "text-emerald-700",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    label: "On track",
  },
  warning: {
    bar: "bg-amber-400",
    text: "text-amber-700",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    label: "Heads up",
  },
  danger: {
    bar: "bg-orange-500",
    text: "text-orange-700",
    badge: "bg-orange-50 text-orange-700 border-orange-200",
    label: "Almost there",
  },
  over: {
    bar: "bg-red-500",
    text: "text-red-700",
    badge: "bg-red-50 text-red-700 border-red-200",
    label: "Over budget",
  },
};

export default function BudgetPanel({ monthlySpending }: BudgetPanelProps) {
  const { budget, isLoaded, setBudget, clearBudget } = useBudget();
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [inputError, setInputError] = useState("");

  if (!isLoaded) return null;

  function openEdit() {
    setInputValue(budget ? String(budget.monthly) : "");
    setInputError("");
    setEditing(true);
  }

  function handleSave() {
    const val = parseFloat(inputValue);
    if (!inputValue.trim() || isNaN(val) || val <= 0) {
      setInputError("Enter a positive number");
      return;
    }
    if (val > 1_000_000) {
      setInputError("Amount too large");
      return;
    }
    setBudget(val);
    setEditing(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") setEditing(false);
  }

  if (!budget) {
    return (
      <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-blue-50 rounded-xl">
            <Wallet size={18} className="text-blue-600" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900">Monthly Budget</h3>
            <p className="text-xs text-gray-500">Not set yet</p>
          </div>
        </div>

        {editing ? (
          <div className="space-y-2">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                <input
                  autoFocus
                  type="number"
                  step="0.01"
                  min="1"
                  placeholder="e.g. 1500"
                  value={inputValue}
                  onChange={(e) => { setInputValue(e.target.value); setInputError(""); }}
                  onKeyDown={handleKeyDown}
                  className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={handleSave}
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                title="Save"
              >
                <Check size={16} />
              </button>
              <button
                onClick={() => setEditing(false)}
                className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                title="Cancel"
              >
                <X size={16} />
              </button>
            </div>
            {inputError && <p className="text-xs text-red-500">{inputError}</p>}
          </div>
        ) : (
          <button
            onClick={openEdit}
            className="w-full py-2.5 border-2 border-dashed border-blue-300 rounded-xl text-sm text-blue-600 font-medium hover:bg-blue-50 transition-colors"
          >
            + Set monthly budget
          </button>
        )}
      </div>
    );
  }

  const pct = getBudgetPercentage(monthlySpending, budget.monthly);
  const status = getBudgetStatus(monthlySpending, budget.monthly);
  const remaining = getRemainingBudget(monthlySpending, budget.monthly);
  const styles = STATUS_STYLES[status];
  const clampedPct = Math.min(pct, 100);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-xl">
            <Wallet size={18} className="text-blue-600" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900">Monthly Budget</h3>
            <p className="text-xs text-gray-500">{formatCurrency(budget.monthly)} limit</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${styles.badge}`}>
            {styles.label}
          </span>
          {!editing && (
            <button
              onClick={openEdit}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              title="Edit budget"
            >
              <Pencil size={13} />
            </button>
          )}
        </div>
      </div>

      {editing ? (
        <div className="space-y-2 mb-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
              <input
                autoFocus
                type="number"
                step="0.01"
                min="1"
                value={inputValue}
                onChange={(e) => { setInputValue(e.target.value); setInputError(""); }}
                onKeyDown={handleKeyDown}
                className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={handleSave}
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              title="Save"
            >
              <Check size={16} />
            </button>
            <button
              onClick={() => setEditing(false)}
              className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
              title="Cancel"
            >
              <X size={16} />
            </button>
          </div>
          {inputError && <p className="text-xs text-red-500">{inputError}</p>}
          <button
            onClick={() => { clearBudget(); setEditing(false); }}
            className="text-xs text-gray-400 hover:text-red-500 transition-colors"
          >
            Remove budget
          </button>
        </div>
      ) : null}

      <div className="space-y-3">
        <div className="flex justify-between items-end">
          <span className="text-2xl font-bold text-gray-900">
            {formatCurrency(monthlySpending)}
          </span>
          <span className="text-sm text-gray-500">
            {pct.toFixed(1)}%
          </span>
        </div>

        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${styles.bar}`}
            style={{ width: `${clampedPct}%` }}
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">
            of {formatCurrency(budget.monthly)} budget
          </span>
          <div className={`flex items-center gap-1 text-xs font-medium ${styles.text}`}>
            <TrendingUp size={12} />
            {remaining >= 0
              ? `${formatCurrency(remaining)} left`
              : `${formatCurrency(Math.abs(remaining))} over`}
          </div>
        </div>
      </div>
    </div>
  );
}
