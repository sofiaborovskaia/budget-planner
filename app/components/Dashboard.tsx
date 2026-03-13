"use client";

import { DataCard } from "./DataCard";
import { BudgetDonutChart } from "./BudgetDonutChart";
import { BudgetBurst } from "./BudgetBurst";
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Donut Chart Section */}
      <BudgetDonutChart
        income={data.income}
        spent={data.spent}
        fixedCosts={data.fixedCosts}
        nonNegotiables={data.nonNegotiables}
        remainingToSpend={data.remainingToSpend}
      />

      {/* Daily Budget */}
      <BudgetBurst value={formatCurrency(data.dailyBudget)} />
    </div>
  );
}
