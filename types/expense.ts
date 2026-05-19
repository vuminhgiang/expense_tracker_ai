export type Category =
  | "Food"
  | "Transportation"
  | "Entertainment"
  | "Shopping"
  | "Bills"
  | "Other";

export interface Expense {
  id: string;
  date: string; // ISO date string
  amount: number;
  category: Category;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseFormData {
  date: string;
  amount: string;
  category: Category;
  description: string;
}

export interface ExpenseFilters {
  search: string;
  category: Category | "All";
  dateFrom: string;
  dateTo: string;
}

export interface CategorySummary {
  category: Category;
  total: number;
  count: number;
  percentage: number;
}

export interface MonthlySummary {
  month: string;
  total: number;
  count: number;
}
