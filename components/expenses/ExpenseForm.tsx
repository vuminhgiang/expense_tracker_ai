"use client";

import { useState, useEffect } from "react";
import { Expense, ExpenseFormData } from "@/types/expense";
import { Category } from "@/types/expense";
import { CATEGORIES, CATEGORY_ICONS } from "@/lib/constants";
import Button from "@/components/ui/Button";

interface ExpenseFormProps {
  onSubmit: (data: ExpenseFormData) => void;
  onCancel: () => void;
  initialData?: Expense;
  isEditing?: boolean;
}

interface FormErrors {
  date?: string;
  amount?: string;
  category?: string;
  description?: string;
}

export default function ExpenseForm({
  onSubmit,
  onCancel,
  initialData,
  isEditing = false,
}: ExpenseFormProps) {
  const today = new Date().toISOString().split("T")[0];

  const [formData, setFormData] = useState<ExpenseFormData>({
    date: initialData?.date ?? today,
    amount: initialData ? String(initialData.amount) : "",
    category: initialData?.category ?? "Food",
    description: initialData?.description ?? "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        date: initialData.date,
        amount: String(initialData.amount),
        category: initialData.category,
        description: initialData.description,
      });
    }
  }, [initialData]);

  function validate(): FormErrors {
    const errs: FormErrors = {};
    if (!formData.date) errs.date = "Date is required";
    if (!formData.amount) {
      errs.amount = "Amount is required";
    } else {
      const val = parseFloat(formData.amount);
      if (isNaN(val) || val <= 0) errs.amount = "Amount must be a positive number";
      if (val > 1_000_000) errs.amount = "Amount seems too large";
    }
    if (!formData.description.trim()) {
      errs.description = "Description is required";
    } else if (formData.description.trim().length < 2) {
      errs.description = "Description must be at least 2 characters";
    } else if (formData.description.trim().length > 200) {
      errs.description = "Description must be under 200 characters";
    }
    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 150));
    onSubmit(formData);
    setIsSubmitting(false);
  }

  function handleChange(field: keyof ExpenseFormData, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={formData.date}
            max={today}
            onChange={(e) => handleChange("date", e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
              errors.date ? "border-red-400 bg-red-50" : "border-gray-300 hover:border-gray-400"
            }`}
          />
          {errors.date && <p className="mt-1 text-xs text-red-500">{errors.date}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Amount (USD) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
            <input
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => handleChange("amount", e.target.value)}
              className={`w-full pl-7 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                errors.amount ? "border-red-400 bg-red-50" : "border-gray-300 hover:border-gray-400"
              }`}
            />
          </div>
          {errors.amount && <p className="mt-1 text-xs text-red-500">{errors.amount}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Category <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-3 gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => handleChange("category", cat)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border transition-all duration-150 ${
                formData.category === cat
                  ? "border-blue-500 bg-blue-50 text-blue-700 font-medium"
                  : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              <span>{CATEGORY_ICONS[cat as Category]}</span>
              <span>{cat}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          rows={3}
          placeholder="What did you spend on?"
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-none ${
            errors.description ? "border-red-400 bg-red-50" : "border-gray-300 hover:border-gray-400"
          }`}
        />
        <div className="flex justify-between mt-1">
          {errors.description ? (
            <p className="text-xs text-red-500">{errors.description}</p>
          ) : (
            <span />
          )}
          <span className="text-xs text-gray-400">{formData.description.length}/200</span>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          type="submit"
          variant="primary"
          loading={isSubmitting}
          className="flex-1"
        >
          {isEditing ? "Update Expense" : "Add Expense"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
