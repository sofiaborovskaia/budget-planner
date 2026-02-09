/**
 * Generic budget line item (used for fixed costs, non-negotiables, etc.)
 */
export interface BudgetLineItem {
  id: string;
  title: string;
  amount: number;
  paid: boolean;
  periodId: string;
}

/**
 * Generic table column configuration
 */
export interface TableColumn<T> {
  key: keyof T;
  label: string;
  type: "text" | "number" | "boolean" | "currency";
  editable?: boolean;
  width?: string;
}

/**
 * Table action configuration
 */
export interface TableAction<T> {
  label: string;
  icon?: string;
  onClick: (item: T) => void;
  variant?: "primary" | "secondary" | "danger";
}

/**
 * Budget line item types for different categories
 */
export type BudgetLineItemType =
  | "fixed-costs"
  | "non-negotiables"
  | "variable"
  | "savings";
