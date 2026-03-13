/**
 * UI/view models used only in the frontend.
 */
export interface DashboardData {
  income: number;
  spent: number;
  fixedCosts: number;
  nonNegotiables: number;
  remainingToSpend: number;
  dailyBudget: number;
}

/**
 * Generic table column configuration.
 */
export interface TableColumn<T> {
  key: keyof T;
  label: string;
  type: "text" | "number" | "boolean" | "currency";
  editable?: boolean;
  width?: string;
}
