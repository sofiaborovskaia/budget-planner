"use client";

import { useState } from "react";
import { DataTable } from "@/app/components/ui/DataTable";
import { updateLineItem } from "@/lib/actions";
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

  const handleAdd = () => {
    const newId = (nonNegotiables.length + 1).toString();
    const newNonNegotiable: BudgetLineItem = {
      id: newId,
      title: "New Non-Negotiable",
      amount: 0,
      paid: false,
      periodId,
    };
    setNonNegotiables([...nonNegotiables, newNonNegotiable]);
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
    setNonNegotiables(nonNegotiables.filter((item_) => item_.id !== item.id));
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
