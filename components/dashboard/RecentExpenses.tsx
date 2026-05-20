"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Expense } from "@/types/expense";
import { formatCurrency, formatDate } from "@/lib/utils";
import { CATEGORY_ICONS } from "@/lib/constants";
import Badge from "@/components/ui/Badge";

interface RecentExpensesProps {
  expenses: Expense[];
}

export default function RecentExpenses({ expenses }: RecentExpensesProps) {
  const recent = [...expenses]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Recent Expenses</h3>
          <p className="text-xs text-gray-500 mt-0.5">Last 5 transactions</p>
        </div>
        <Link
          href="/expenses"
          className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 transition-colors"
        >
          View all
          <ArrowRight size={14} />
        </Link>
      </div>

      {recent.length === 0 ? (
        <div className="flex items-center justify-center py-8 text-gray-400">
          <p className="text-sm">No expenses yet</p>
        </div>
      ) : (
        <div className="space-y-1">
          {recent.map((expense) => (
            <div
              key={expense.id}
              className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-base">
                  {CATEGORY_ICONS[expense.category]}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {expense.description}
                  </p>
                  <p className="text-xs text-gray-500">{formatDate(expense.date)}</p>
                </div>
              </div>
              <span className="text-sm font-semibold text-gray-900 ml-3 flex-shrink-0">
                {formatCurrency(expense.amount)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
