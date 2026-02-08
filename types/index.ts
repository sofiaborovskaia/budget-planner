/**
 * Budget period representing a pay cycle
 */
export interface Period {
  id: string; // Format: "2026-02-05" (based on start date)
  startDate: Date;
  endDate: Date;
  lengthInDays: number; // Auto-calculated
  monthName: string;
}

/**
 * Dashboard data structure for displaying budget overview
 */
export interface DashboardData {
  monthName: string;
  periodStartDate: string;
  spent: number;
  fixedCosts: number;
  remainingToSpend: number;
  dailyBudget: number;
}

/**
 * User budget preferences (for future use)
 */
export interface UserPreferences {
  payDay: number; // Day of month (1-31)
  periodLength: "monthly" | "biweekly" | "weekly" | "custom";
  currency: string; // ISO currency code
  locale: string; // Locale for formatting
}

/**
 * Transaction record (for future use)
 */
export interface Transaction {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: Date;
  periodId: string; // Links to Period
  type: "income" | "expense";
}

/**
 * Budget category (for future use)
 */
export interface BudgetCategory {
  id: string;
  name: string;
  budgetedAmount: number;
  spentAmount: number;
  periodId: string;
  isFixed: boolean; // Fixed costs like rent, utilities
}
