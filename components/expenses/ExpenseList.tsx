"use client";

import { useState } from "react";
import { Trash2, Download, Plus } from "lucide-react";
import { Expense, ExpenseFormData } from "@/types/expense";
import { exportToCSV } from "@/lib/exportUtils";
import ExpenseItem from "./ExpenseItem";
import ExpenseFiltersBar from "./ExpenseFilters";
import Modal from "@/components/ui/Modal";
import ExpenseForm from "./ExpenseForm";
import Button from "@/components/ui/Button";
import { ExpenseFilters } from "@/types/expense";

interface ExpenseListProps {
  expenses: Expense[];
  filteredExpenses: Expense[];
  filters: ExpenseFilters;
  onFilterChange: (f: ExpenseFilters) => void;
  onAdd: (data: ExpenseFormData) => void;
  onEdit: (id: string, data: ExpenseFormData) => void;
  onDelete: (id: string) => void;
  onDeleteMultiple: (ids: string[]) => void;
}

export default function ExpenseList({
  expenses,
  filteredExpenses,
  filters,
  onFilterChange,
  onAdd,
  onEdit,
  onDelete,
  onDeleteMultiple,
}: ExpenseListProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selectedIds.size === filteredExpenses.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredExpenses.map((e) => e.id)));
    }
  }

  function handleDeleteSelected() {
    onDeleteMultiple(Array.from(selectedIds));
    setSelectedIds(new Set());
  }

  function handleAdd(data: ExpenseFormData) {
    onAdd(data);
    setShowAddModal(false);
  }

  function handleEdit(data: ExpenseFormData) {
    if (editingExpense) {
      onEdit(editingExpense.id, data);
      setEditingExpense(null);
    }
  }

  function clearFilters() {
    onFilterChange({ search: "", category: "All", dateFrom: "", dateTo: "" });
  }

  const sortedExpenses = [...filteredExpenses].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">All Expenses</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {expenses.length} total expense{expenses.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportToCSV(filteredExpenses)}
            title="Export filtered expenses to CSV"
          >
            <Download size={15} />
            Export CSV
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowAddModal(true)}
          >
            <Plus size={15} />
            Add Expense
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-4">
        <ExpenseFiltersBar
          filters={filters}
          onChange={onFilterChange}
          onClear={clearFilters}
          resultCount={filteredExpenses.length}
        />

        {selectedIds.size > 0 && (
          <div className="flex items-center justify-between px-4 py-2.5 bg-blue-50 rounded-xl border border-blue-200">
            <span className="text-sm text-blue-700 font-medium">
              {selectedIds.size} selected
            </span>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDeleteSelected}
            >
              <Trash2 size={14} />
              Delete Selected
            </Button>
          </div>
        )}

        {sortedExpenses.length > 0 ? (
          <div className="space-y-1.5">
            <div className="flex items-center gap-3 px-4 py-1">
              <input
                type="checkbox"
                checked={
                  filteredExpenses.length > 0 &&
                  selectedIds.size === filteredExpenses.length
                }
                onChange={toggleSelectAll}
                className="w-4 h-4 rounded text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer"
              />
              <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                Select all
              </span>
            </div>
            {sortedExpenses.map((expense) => (
              <ExpenseItem
                key={expense.id}
                expense={expense}
                onEdit={setEditingExpense}
                onDelete={onDelete}
                isSelected={selectedIds.has(expense.id)}
                onToggleSelect={toggleSelect}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="text-5xl mb-4">💸</div>
            <p className="text-gray-900 font-medium">No expenses found</p>
            <p className="text-gray-500 text-sm mt-1">
              {expenses.length === 0
                ? "Add your first expense to get started"
                : "Try adjusting your filters"}
            </p>
            {expenses.length === 0 && (
              <Button
                variant="primary"
                size="sm"
                className="mt-4"
                onClick={() => setShowAddModal(true)}
              >
                <Plus size={15} />
                Add First Expense
              </Button>
            )}
          </div>
        )}
      </div>

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Expense"
      >
        <ExpenseForm
          onSubmit={handleAdd}
          onCancel={() => setShowAddModal(false)}
        />
      </Modal>

      <Modal
        isOpen={!!editingExpense}
        onClose={() => setEditingExpense(null)}
        title="Edit Expense"
      >
        {editingExpense && (
          <ExpenseForm
            onSubmit={handleEdit}
            onCancel={() => setEditingExpense(null)}
            initialData={editingExpense}
            isEditing
          />
        )}
      </Modal>
    </div>
  );
}
