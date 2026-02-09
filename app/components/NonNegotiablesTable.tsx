"use client";

import { useState } from "react";
import { DataTable } from "./DataTable";
import { getMockNonNegotiables } from "@/app/lib/mockData";
import type { BudgetLineItem, TableColumn } from "@/types/costs";

interface NonNegotiablesTableProps {
  periodId: string;
}

export function NonNegotiablesTable({ periodId }: NonNegotiablesTableProps) {
  const [nonNegotiables, setNonNegotiables] = useState<BudgetLineItem[]>(
    getMockNonNegotiables(periodId),
  );

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
    setNonNegotiables(
      nonNegotiables.map((item_) =>
        item_.id === item.id ? { ...item_, [field]: value } : item_,
      ),
    );
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
