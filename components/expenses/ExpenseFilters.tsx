"use client";

import { Search, X, SlidersHorizontal } from "lucide-react";
import { ExpenseFilters } from "@/types/expense";
import { Category } from "@/types/expense";
import { CATEGORIES } from "@/lib/constants";
import Button from "@/components/ui/Button";

interface ExpenseFiltersProps {
  filters: ExpenseFilters;
  onChange: (filters: ExpenseFilters) => void;
  onClear: () => void;
  resultCount: number;
}

export default function ExpenseFiltersBar({
  filters,
  onChange,
  onClear,
  resultCount,
}: ExpenseFiltersProps) {
  const hasActiveFilters =
    filters.search ||
    filters.category !== "All" ||
    filters.dateFrom ||
    filters.dateTo;

  function update(key: keyof ExpenseFilters, value: string) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search by description or category..."
            value={filters.search}
            onChange={(e) => update("search", e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-gray-400 transition-colors"
          />
          {filters.search && (
            <button
              onClick={() => update("search", "")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <select
          value={filters.category}
          onChange={(e) => update("category", e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-gray-400 transition-colors bg-white"
        >
          <option value="All">All Categories</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={filters.dateFrom}
          onChange={(e) => update("dateFrom", e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-gray-400 transition-colors"
          title="From date"
        />
        <input
          type="date"
          value={filters.dateTo}
          onChange={(e) => update("dateTo", e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-gray-400 transition-colors"
          title="To date"
        />

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onClear}>
            <X size={14} />
            Clear
          </Button>
        )}
      </div>

      {hasActiveFilters && (
        <p className="text-xs text-gray-500">
          Showing {resultCount} expense{resultCount !== 1 ? "s" : ""} matching your filters
        </p>
      )}
    </div>
  );
}
