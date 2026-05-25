"use client";

import { PlusCircle, BarChart2, Wallet, FileDown } from "lucide-react";
import Button from "@/components/ui/Button";

interface EmptyDashboardProps {
  onAddExpense: () => void;
}

const FEATURES = [
  { icon: BarChart2, label: "Spending charts & insights" },
  { icon: Wallet,   label: "Monthly budget tracking" },
  { icon: FileDown, label: "CSV & PDF export" },
];

export default function EmptyDashboard({ onAddExpense }: EmptyDashboardProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="text-6xl mb-6">💸</div>

      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Welcome to SpendWise
      </h2>
      <p className="text-gray-500 text-sm max-w-sm mb-8">
        Track your expenses, monitor your budget, and get clear insights into
        where your money goes — all in one place.
      </p>

      <Button
        variant="primary"
        onClick={onAddExpense}
        className="gap-2 px-6 py-2.5 text-base mb-10"
      >
        <PlusCircle size={18} />
        Add your first expense
      </Button>

      <div className="flex flex-wrap justify-center gap-4">
        {FEATURES.map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 shadow-sm"
          >
            <Icon size={15} className="text-blue-500 flex-shrink-0" />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}
