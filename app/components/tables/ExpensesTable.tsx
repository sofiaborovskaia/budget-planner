"use client";

import { useState } from "react";
import { DataTable } from "@/app/components/ui/DataTable";
import { createLineItem, deleteLineItem, updateLineItem } from "@/lib/actions";
import { CATEGORY } from "@/lib/constants";
import type { PeriodKey } from "@/types/actions";
import type { BudgetLineItem } from "@/types/domain";
import type { TableColumn } from "@/types/ui";

interface ExpensesTableProps {
  periodKey: PeriodKey;
  initialItems: BudgetLineItem[];
}

export function ExpensesTable({ periodKey, initialItems }: ExpensesTableProps) {
  const [expenses, setExpenses] = useState<BudgetLineItem[]>(initialItems);
  const [pendingItemId, setPendingItemId] = useState<string | null>(null);

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
      title: "",
      amount: 0,
      paid: true,
      periodId: tempId,
    };
    setExpenses((prev) => [...prev, newItem]);
    setPendingItemId(tempId);
  };

  const handleEdit = async (
    item: BudgetLineItem,
    field: keyof BudgetLineItem,
    value: any,
  ) => {
    // Check if this is a pending item and we're editing the title
    const isPending = item.id === pendingItemId;

    if (isPending && field === "title") {
      // If title is empty, remove the item
      if (!value || value.trim() === "") {
        setExpenses((prev) => prev.filter((e) => e.id !== item.id));
        setPendingItemId(null);
        return;
      }

      // Title has content - save to DB
      const realId = await createLineItem(periodKey, CATEGORY.EXPENSE, {
        title: value,
        amount: item.amount,
        paid: item.paid,
      });

      setExpenses((prev) =>
        prev.map((e) =>
          e.id === item.id ? { ...e, id: realId, title: value } : e,
        ),
      );
      setPendingItemId(null);
      return;
    }

    // Regular edit for existing items
    setExpenses(
      expenses.map((expense) =>
        expense.id === item.id ? { ...expense, [field]: value } : expense,
      ),
    );

    // Persist to DB via Server Action (only for non-pending items)
    if (!isPending && (field === "title" || field === "amount")) {
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
        <h2 className="text-2xl mb-2">This Month's Expenses</h2>
        <p className="text-grey">Track your daily spending and purchases.</p>
      </div>

      <DataTable
        data={expenses}
        columns={columns}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        addButtonText="Add Expense"
        emptyMessage="No expenses recorded yet. Click 'Add Expense' to start tracking your spending."
        autoFocusItemId={pendingItemId}
        autoFocusField="title"
      />
    </div>
  );
}
