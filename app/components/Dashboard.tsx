"use client";

import { DataCard } from "./DataCard";

interface DashboardData {
  monthName: string;
  periodStartDate: string;
  spent: number;
  fixedCosts: number;
  remainingToSpend: number;
  dailyBudget: number;
}

interface DashboardProps {
  data: DashboardData;
}

export function Dashboard({ data }: DashboardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "EUR",
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          {data.monthName}
        </h1>
        <p className="text-gray-600">Budget Overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Period Start Date */}
        <DataCard
          label="Period Started"
          value={data.periodStartDate}
          icon="📌"
        />

        {/* Money Spent This Month */}
        <DataCard
          label="Money Spent This Month"
          value={formatCurrency(data.spent)}
          icon="💸"
        />

        {/* Fixed & Non-Negotiables */}
        <DataCard
          label="Fixed Costs"
          value={formatCurrency(data.fixedCosts)}
          icon="🔒"
        />

        {/* Money Left To Spend */}
        <DataCard
          label="Remaining to Spend"
          value={formatCurrency(data.remainingToSpend)}
          icon="💰"
        />

        {/* Daily Budget */}
        <DataCard
          label="Budget per Day"
          value={formatCurrency(data.dailyBudget)}
          icon="📊"
        />
      </div>
    </div>
  );
}
