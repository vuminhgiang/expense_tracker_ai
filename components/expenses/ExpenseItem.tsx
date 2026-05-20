"use client";

import { useState, useEffect, useRef } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Expense } from "@/types/expense";
import { formatCurrency, formatDate } from "@/lib/utils";
import Badge from "@/components/ui/Badge";

interface ExpenseItemProps {
  expense: Expense;
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
}

export default function ExpenseItem({
  expense,
  onEdit,
  onDelete,
  isSelected,
  onToggleSelect,
}: ExpenseItemProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const confirmTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (confirmTimer.current) clearTimeout(confirmTimer.current);
    };
  }, []);

  function handleDelete() {
    if (confirmDelete) {
      onDelete(expense.id);
    } else {
      setConfirmDelete(true);
      confirmTimer.current = setTimeout(() => setConfirmDelete(false), 3000);
    }
  }

  return (
    <div
      className={`group flex items-center gap-4 px-4 py-3.5 rounded-xl border transition-all duration-150 ${
        isSelected
          ? "border-blue-300 bg-blue-50"
          : "border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm"
      }`}
    >
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => onToggleSelect(expense.id)}
        className="w-4 h-4 rounded text-blue-600 border-gray-300 focus:ring-blue-500 flex-shrink-0 cursor-pointer"
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-gray-900 truncate">
            {expense.description}
          </span>
          <Badge category={expense.category} size="sm" />
        </div>
        <p className="text-xs text-gray-500 mt-0.5">{formatDate(expense.date)}</p>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        <span className="text-sm font-semibold text-gray-900">
          {formatCurrency(expense.amount)}
        </span>

        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(expense)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            title="Edit"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={handleDelete}
            className={`p-1.5 rounded-lg transition-colors ${
              confirmDelete
                ? "text-white bg-red-500 hover:bg-red-600"
                : "text-gray-400 hover:text-red-600 hover:bg-red-50"
            }`}
            title={confirmDelete ? "Click again to confirm" : "Delete"}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
