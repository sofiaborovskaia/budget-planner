"use client";

import { useState } from "react";
import { LineItemCategory } from "@prisma/client";
import { DataTable } from "@/app/components/ui/DataTable";
import { createLineItem, deleteLineItem, updateLineItem } from "@/lib/actions";
import type { BudgetLineItem } from "@/types/domain";
import type { TableColumn } from "@/types/ui";

interface NonNegotiablesTableProps {
  periodId: string;
  initialItems: BudgetLineItem[];
}

export function NonNegotiablesTable({
  periodId,
  initialItems,
}: NonNegotiablesTableProps) {
  const [nonNegotiables, setNonNegotiables] =
    useState<BudgetLineItem[]>(initialItems);

  const columns: TableColumn<BudgetLineItem>[] = [
    {
      key: "title",
      label: "Non-Negotiable",
      type: "text",
      editable: true,
      width: "40%",
    },
    {
      key: "amount",
      label: "Amount",
      type: "currency",
      editable: true,
      width: "30%",
    },
    {
      key: "paid",
      label: "Paid",
      type: "boolean",
      editable: true,
      width: "20%",
    },
  ];

  const handleAdd = async () => {
    const tempId = `temp-${Date.now()}`;
    const newItem: BudgetLineItem = {
      id: tempId,
      title: "New Non-Negotiable",
      amount: 0,
      paid: false,
      periodId,
    };
    setNonNegotiables((prev) => [...prev, newItem]);

    const realId = await createLineItem(
      periodId,
      LineItemCategory.NON_NEGOTIABLE,
      { title: newItem.title, amount: newItem.amount, paid: newItem.paid },
    );
    setNonNegotiables((prev) =>
      prev.map((i) => (i.id === tempId ? { ...i, id: realId } : i)),
    );
  };

  const handleEdit = (
    item: BudgetLineItem,
    field: keyof BudgetLineItem,
    value: any,
  ) => {
    // 1. Update local state immediately so the UI feels instant
    setNonNegotiables(
      nonNegotiables.map((item_) =>
        item_.id === item.id ? { ...item_, [field]: value } : item_,
      ),
    );

    // 2. Persist to DB via Server Action
    if (field === "paid" || field === "title" || field === "amount") {
      updateLineItem(item.id, { [field]: value });
    }
  };

  const handleDelete = (item: BudgetLineItem) => {
    setNonNegotiables((prev) => prev.filter((i) => i.id !== item.id));
    if (!item.id.startsWith("temp-")) deleteLineItem(item.id);
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Non-Negotiables
        </h2>
        <p className="text-gray-600">
          Essential expenses for this period that vary month to month.
        </p>
      </div>

      <DataTable
        data={nonNegotiables}
        columns={columns}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        addButtonText="Add Non-Negotiable"
        emptyMessage="No non-negotiables added yet. Click 'Add Non-Negotiable' to get started."
      />
    </div>
  );
}
