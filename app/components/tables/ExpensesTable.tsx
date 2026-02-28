"use client";

import { useState } from "react";
import { LineItemCategory } from "@prisma/client";
import { DataTable } from "@/app/components/ui/DataTable";
import { createLineItem, deleteLineItem, updateLineItem } from "@/lib/actions";
import type { BudgetLineItem } from "@/types/domain";
import type { TableColumn } from "@/types/ui";

interface ExpensesTableProps {
  periodId: string;
  initialItems: BudgetLineItem[];
}

export function ExpensesTable({ periodId, initialItems }: ExpensesTableProps) {
  const [expenses, setExpenses] = useState<BudgetLineItem[]>(initialItems);

  const columns: TableColumn<BudgetLineItem>[] = [
    {
      key: "title",
      label: "Expense",
      type: "text",
      editable: true,
      width: "60%",
    },
    {
      key: "amount",
      label: "Amount",
      type: "currency",
      editable: true,
      width: "40%",
    },
    // Note: "paid" column exists in data but is hidden from UI
  ];

  const handleAdd = async () => {
    const tempId = `temp-${Date.now()}`;
    const newItem: BudgetLineItem = {
      id: tempId,
      title: "New Expense",
      amount: 0,
      paid: true,
      periodId,
    };
    setExpenses((prev) => [...prev, newItem]);

    const realId = await createLineItem(periodId, LineItemCategory.EXPENSE, {
      title: newItem.title,
      amount: newItem.amount,
      paid: newItem.paid,
    });
    setExpenses((prev) =>
      prev.map((e) => (e.id === tempId ? { ...e, id: realId } : e)),
    );
  };

  const handleEdit = (
    item: BudgetLineItem,
    field: keyof BudgetLineItem,
    value: any,
  ) => {
    // 1. Update local state immediately so the UI feels instant
    setExpenses(
      expenses.map((expense) =>
        expense.id === item.id ? { ...expense, [field]: value } : expense,
      ),
    );

    // 2. Persist to DB via Server Action
    if (field === "title" || field === "amount") {
      updateLineItem(item.id, { [field]: value });
    }
  };

  const handleDelete = (item: BudgetLineItem) => {
    setExpenses((prev) => prev.filter((e) => e.id !== item.id));
    if (!item.id.startsWith("temp-")) deleteLineItem(item.id);
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          This Month's Expenses
        </h2>
        <p className="text-gray-600">
          Track your daily spending and purchases for this period.
        </p>
      </div>

      <DataTable
        data={expenses}
        columns={columns}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        addButtonText="Add Expense"
        emptyMessage="No expenses recorded yet. Click 'Add Expense' to start tracking your spending."
      />
    </div>
  );
}
