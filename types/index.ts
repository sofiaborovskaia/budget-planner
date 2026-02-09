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
  periodEndDate: string;
  daysRemaining: number;
  spent: number;
  fixedCosts: number;
  nonNegotiables: number;
  remainingToSpend: number;
  dailyBudget: number;
}

/**
 * User budget preferences (for future use)
 */
// export interface UserPreferences {
//   payDay: number; // Day of month (1-31)
//   periodLength: "monthly" | "biweekly" | "weekly" | "custom";
//   currency: string; // ISO currency code
//   locale: string; // Locale for formatting
// }
