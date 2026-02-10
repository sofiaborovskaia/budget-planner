/**
 * Domain models used across backend and frontend.
 * TODO: Replace these with Prisma types once the backend is wired up.
 */
export enum PeriodType {
  MONTHLY = "MONTHLY",
  BIWEEKLY = "BIWEEKLY",
  CUSTOM = "CUSTOM",
}

export enum LineItemCategory {
  EXPENSE = "EXPENSE",
  FIXED_COST = "FIXED_COST",
  NON_NEGOTIABLE = "NON_NEGOTIABLE",
}

export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: Date;
  updatedAt?: Date;
  settings?: UserSettings;
  periods?: Period[];
  lineItems?: BudgetLineItem[];
  incomes?: Income[];
}

/**
 * Budget period representing a pay cycle.
 */
export interface Period {
  id: string; // Todo: change to UUID
  userId?: string;
  name?: string;
  startDate: Date;
  endDate: Date;
  lengthInDays: number; // Derived
  createdAt?: Date;
  updatedAt?: Date;
  user?: User;
  lineItems?: BudgetLineItem[];
  incomes?: Income[];
}

/**
 * Generic budget line item (used for fixed costs, non-negotiables, etc.).
 */
export interface BudgetLineItem {
  id: string;
  userId?: string;
  title: string;
  amount: number;
  paid: boolean;
  periodId: string;
  category?: LineItemCategory;
  createdAt?: Date;
  updatedAt?: Date;
  user?: User;
  period?: Period;
}

/**
 * Budget line item types for different categories.
 */
export type BudgetLineItemType = "EXPENSE" | "FIXED_COST" | "NON_NEGOTIABLE";

export interface Income {
  id: string;
  userId?: string;
  periodId: string;
  amount: number;
  createdAt?: Date;
  updatedAt?: Date;
  user?: User;
  period?: Period;
}

export interface UserSettings {
  userId: string;
  periodType: PeriodType;
  startDay?: number;
  createdAt?: Date;
  updatedAt?: Date;
  user?: User;
}
