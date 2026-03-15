"use client";

import { PieChart, Pie, ResponsiveContainer, Tooltip } from "recharts";
import styles from "./BudgetDonutChart.module.css";
import { useState, useEffect } from "react";

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

  // Detect mobile for legend vs labels
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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
    const { cx, cy, midAngle, outerRadius, innerRadius, value, name } = props;

    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 20; // Start point for the line
    const x1 = cx + outerRadius * Math.cos(-midAngle * RADIAN); // Point on pie edge
    const y1 = cy + outerRadius * Math.sin(-midAngle * RADIAN);

    const x2 = cx + radius * Math.cos(-midAngle * RADIAN); // Diagonal end point
    const y2 = cy + radius * Math.sin(-midAngle * RADIAN);

    // Horizontal line extension
    const horizontalLength = 30;
    const isRightSide = midAngle < 90 || midAngle > 270;
    const x3 = x2 + (isRightSide ? horizontalLength : -horizontalLength);
    const y3 = y2;

    // Text position (a bit past the horizontal line)
    const textX = x3 + (isRightSide ? 5 : -5);
    const textY = y3;

    const textAnchor = isRightSide ? "start" : "end";

    return (
      <g>
        {/* L-shaped line */}
        <path
          d={`M ${x1},${y1} L ${x2},${y2} L ${x3},${y3}`}
          stroke="black"
          strokeWidth="1"
          fill="none"
        />

        {/* Text */}
        <text
          x={textX}
          y={textY}
          fill="black"
          textAnchor={textAnchor}
          dominantBaseline="central"
          fontSize="20"
        >
          <tspan x={textX} dy="0" fill="#666" fontSize="16">
            {name}
          </tspan>
          <tspan
            x={textX}
            dy="1em"
            fontSize="32"
            fontFamily="var(--font-instrument-serif)"
          >
            {formatCurrency(value)}
          </tspan>
        </text>
      </g>
    );
  };

  return (
    <div className={styles.wrapper}>
      <h3 className={styles.title}>Budget Breakdown</h3>
      <ResponsiveContainer width="100%" height={isMobile ? 250 : 450}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={100}
            dataKey="value"
            label={!isMobile ? renderLabel : false}
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

      {/* Legend for mobile */}
      {isMobile && (
        <div style={{ marginTop: "1rem" }}>
          {data.map((item, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "0.5rem",
                fontSize: "14px",
              }}
            >
              <div
                style={{
                  width: "16px",
                  height: "16px",
                  backgroundColor: item.fill,
                  marginRight: "8px",
                  borderRadius: "2px",
                }}
              />
              <span style={{ marginRight: "8px", color: "#666" }}>
                {item.name}:
              </span>
              <span style={{ fontWeight: "600" }}>
                {formatCurrency(item.value)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
