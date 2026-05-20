"use client";

import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Modal from "@/components/ui/Modal";
import ExpenseForm from "@/components/expenses/ExpenseForm";
import { useExpensesContext } from "./providers";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const { addExpense, saveError } = useExpensesContext();

  return (
    <>
      <Navbar onAddExpense={() => setShowAddModal(true)} />
      {saveError && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-2.5 text-center">
          <p className="text-sm text-red-700 font-medium">
            ⚠️ Unable to save — your browser storage is full. Export your data to avoid losing it.
          </p>
        </div>
      )}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Expense"
      >
        <ExpenseForm
          onSubmit={(data) => {
            addExpense(data);
            setShowAddModal(false);
          }}
          onCancel={() => setShowAddModal(false)}
        />
      </Modal>
    </>
  );
}
