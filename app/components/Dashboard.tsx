"use client";

import { DataCard } from "./DataCard";
import type { DashboardData } from "@/types/ui";

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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          icon="💸"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Money Spent This Month */}
        <DataCard
          label="Money Spent This Month"
          value={formatCurrency(data.spent)}
        />

        {/* Fixed */}
        <DataCard
          label="Fixed Costs"
          value={formatCurrency(data.fixedCosts)}
          icon="🔒"
        />

        {/* This month Non-Negotiables */}
        <DataCard
          label="Non-Negotiables"
          value={formatCurrency(data.nonNegotiables)}
          icon="🔒"
        />
      </div>
    </div>
  );
}
