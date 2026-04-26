"use client";

import { useState, useEffect } from "react";
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
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  // Map temp IDs to real database IDs for updates during editing
  const [tempToRealIdMap, setTempToRealIdMap] = useState<Map<string, string>>(
    new Map(),
  );

  // When editing stops, apply deferred ID updates and clean up mapping
  useEffect(() => {
    if (editingItemId === null && tempToRealIdMap.size > 0) {
      setExpenses((prev) =>
        prev.map((e) => {
          const realId = tempToRealIdMap.get(e.id);
          return realId ? { ...e, id: realId } : e;
        }),
      );
      setTempToRealIdMap(new Map());
    }
  }, [editingItemId, tempToRealIdMap]);

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

      // Optimistically update UI immediately with the title
      setExpenses((prev) =>
        prev.map((e) => (e.id === item.id ? { ...e, title: value } : e)),
      );

      // Then save to DB in the background
      const realId = await createLineItem(periodKey, CATEGORY.EXPENSE, {
        title: value,
        amount: item.amount,
        paid: item.paid,
      });

      // Store mapping from temp ID to real ID
      setTempToRealIdMap((prev) => new Map(prev).set(item.id, realId));

      // Only update ID if user is not currently editing this item
      // This prevents focus loss when user quickly edits the amount field
      setExpenses((prev) =>
        prev.map((e) =>
          e.id === item.id && editingItemId !== item.id
            ? { ...e, id: realId }
            : e,
        ),
      );

      // Clean up mapping if we applied the ID immediately
      if (editingItemId !== item.id) {
        setTempToRealIdMap((prev) => {
          const next = new Map(prev);
          next.delete(item.id);
          return next;
        });
      }

      setPendingItemId(null);
      return;
    }

    // Regular edit for existing items
    setExpenses(
      expenses.map((expense) =>
        expense.id === item.id ? { ...expense, [field]: value } : expense,
      ),
    );

    // Persist to DB via Server Action
    // Use the real ID from mapping if item still has temp ID
    const dbId = tempToRealIdMap.get(item.id) || item.id;
    const canUpdate = !isPending && !dbId.startsWith("temp-");

    if (canUpdate && (field === "title" || field === "amount")) {
      updateLineItem(dbId, { [field]: value });
    }
  };

  const handleDelete = (item: BudgetLineItem) => {
    setExpenses((prev) => prev.filter((e) => e.id !== item.id));
    if (!item.id.startsWith("temp-")) deleteLineItem(item.id);
  };

  return (
    <DataTable
      title="This Month's Expenses"
      subtitle="Track your daily spending and purchases."
      data={expenses}
      columns={columns}
      onAdd={handleAdd}
      onEdit={handleEdit}
      onDelete={handleDelete}
      addButtonText="Add Expense"
      emptyMessage="No expenses recorded yet. Click 'Add Expense' to start tracking your spending."
      autoFocusItemId={pendingItemId}
      autoFocusField="title"
      itemLabel="expense"
      onEditingChange={setEditingItemId}
    />
  );
}
