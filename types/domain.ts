/**
 * Domain models used across backend and frontend.
 */
export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: Date;
}

/**
 * Budget period representing a pay cycle.
 */
export interface Period {
  id: string; // Todo: change to UUID
  name: string;
  startDate: Date;
  endDate: Date;
  lengthInDays: number; // Auto-calculated
}

/**
 * Generic budget line item (used for fixed costs, non-negotiables, etc.).
 */
export interface BudgetLineItem {
  id: string;
  title: string;
  amount: number;
  paid: boolean;
  periodId: string;
}

/**
 * Budget line item types for different categories.
 */
export type BudgetLineItemType =
  | "fixed-costs"
  | "non-negotiables"
  | "variable"
  | "savings";
