"use client";

import { PieChart, Pie, ResponsiveContainer, Tooltip } from "recharts";

interface BudgetDonutChartProps {
  income: number;
  spent: number;
  fixedCosts: number;
  nonNegotiables: number;
  remainingToSpend: number;
}

const COLORS = {
  spent: "var(--orange)",
  fixedCosts: "var(--pink)",
  nonNegotiables: "brown",
  remaining: "black",
};

export function BudgetDonutChart({
  income,
  spent,
  fixedCosts,
  nonNegotiables,
  remainingToSpend,
}: BudgetDonutChartProps) {
  const dataRaw = [
    { name: "Daily Expenses", value: spent, fill: COLORS.spent },
    { name: "Fixed Costs", value: fixedCosts, fill: COLORS.fixedCosts },
    {
      name: "Non-Negotiables",
      value: nonNegotiables,
      fill: COLORS.nonNegotiables,
    },
    {
      name: "Remaining",
      value: Math.max(0, remainingToSpend),
      fill: COLORS.remaining,
    },
  ];
  const data = dataRaw.filter((item) => item.value > 0); // Only show categories with values

  const total = income;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const percentage = ((payload[0].value / total) * 100).toFixed(0);
      return (
        <div
          style={{
            backgroundColor: "var(--off-white)",
            padding: "8px 12px",
            borderRadius: "4px",
            fontSize: "14px",
          }}
        >
          {percentage}%
        </div>
      );
    }
    return null;
  };

  const renderLabel = (props: any) => {
    const { cx, cy, midAngle, outerRadius, value, name } = props;
    const radius = outerRadius + 65;
    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));

    return (
      <text
        x={x}
        y={y}
        fill="black"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="20"
      >
        <tspan x={x} dy="0" fill="#666" fontSize="16">
          {name}
        </tspan>
        <tspan
          x={x}
          dy="1em"
          fontSize="32"
          fontFamily="var(--font-instrument-serif)"
        >
          {formatCurrency(value)}
        </tspan>
      </text>
    );
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow">
      <h3 className="text-xl font-semibold mb-4">Budget Breakdown</h3>
      <ResponsiveContainer width="100%" height={400}>
        <PieChart margin={{ top: 40, right: 40, bottom: 40, left: 40 }}>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
            label={renderLabel}
            labelLine={false}
          />
          <Tooltip content={<CustomTooltip />} isAnimationActive={false} />
          <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
            <tspan x="50%" dy="-1em" fontSize="16" fill="#666">
              Income
            </tspan>
            <tspan
              x="50%"
              dy="1em"
              fontSize="28"
              fill="black"
              fontFamily="var(--font-instrument-serif)"
            >
              {formatCurrency(income)}
            </tspan>
          </text>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
