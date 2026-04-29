"use client";

import { DataTable } from "@/app/components/ui/DataTable";
import { CATEGORY } from "@/lib/constants";
import type { PeriodKey } from "@/types/actions";
import type { BudgetLineItem } from "@/types/domain";
import type { TableColumn } from "@/types/ui";

interface ExpensesTableProps {
  periodKey: PeriodKey;
  initialItems: BudgetLineItem[];
}

export function ExpensesTable({ periodKey, initialItems }: ExpensesTableProps) {
  const columns: TableColumn<BudgetLineItem>[] = [
    {
      key: "title",
      label: "Expense",
      type: "text",
      editable: true,
    },
    {
      key: "amount",
      label: "Amount",
      type: "currency",
      editable: true,
    },
    // Note: "paid" column exists in data but is hidden from UI
  ];

  return (
    <DataTable
      title="This Month's Expenses"
      subtitle="Track your daily spending and purchases."
      initialData={initialItems}
      columns={columns}
      periodKey={periodKey}
      category={CATEGORY.EXPENSE}
      addButtonText="Add Expense"
      emptyMessage="No expenses recorded yet. Click 'Add Expense' to start tracking your spending."
      itemLabel="expense"
    />
  );
}
