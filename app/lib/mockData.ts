import type { DashboardData, Period } from "@/types";
import type { BudgetLineItem } from "@/types/costs";
import { formatDate } from "@/app/lib/period";

/**
 * Generate mock dashboard data for a given period
 */
export function getMockDashboardData(period: Period): DashboardData {
  return {
    monthName: period.monthName,
    periodStartDate: formatDate(period.startDate),
    spent: 450.75,
    fixedCosts: 1200,
    nonNegotiables: 500,
    remainingToSpend: 2349.25,
    dailyBudget: 85.5,
  };
}

/**
 * Generate mock fixed costs data for a given period
 */
export function getMockFixedCosts(periodId: string): BudgetLineItem[] {
  return [
    {
      id: "1",
      title: "Rent",
      amount: 1200,
      paid: true,
      periodId,
    },
    {
      id: "2",
      title: "Internet",
      amount: 80,
      paid: false,
      periodId,
    },
    {
      id: "3",
      title: "Phone",
      amount: 45,
      paid: true,
      periodId,
    },
    {
      id: "4",
      title: "Insurance",
      amount: 150,
      paid: false,
      periodId,
    },
  ];
}

/**
 * Generate mock non-negotiables data for a given period
 */
export function getMockNonNegotiables(periodId: string): BudgetLineItem[] {
  return [
    {
      id: "1",
      title: "Groceries",
      amount: 300,
      paid: true,
      periodId,
    },
    {
      id: "2",
      title: "Transportation",
      amount: 120,
      paid: false,
      periodId,
    },
    {
      id: "3",
      title: "Medicine",
      amount: 80,
      paid: true,
      periodId,
    },
  ];
}
