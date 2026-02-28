"use client";

import { useState } from "react";
import { DataTable } from "@/app/components/ui/DataTable";
import type { BudgetLineItem } from "@/types/domain";
import type { TableColumn } from "@/types/ui";

interface FixedCostsTableProps {
  periodId: string;
  initialItems: BudgetLineItem[];
}

export function FixedCostsTable({
  periodId,
  initialItems,
}: FixedCostsTableProps) {
  const [fixedCosts, setFixedCosts] = useState<BudgetLineItem[]>(initialItems);

  const columns: TableColumn<BudgetLineItem>[] = [
    {
      key: "title",
      label: "Title",
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
    const newId = (fixedCosts.length + 1).toString();
    const newFixedCost: BudgetLineItem = {
      id: newId,
      title: "New Fixed Cost",
      amount: 0,
      paid: false,
      periodId,
    };
    setFixedCosts([...fixedCosts, newFixedCost]);
  };

  const handleEdit = (
    item: BudgetLineItem,
    field: keyof BudgetLineItem,
    value: any,
  ) => {
    setFixedCosts(
      fixedCosts.map((cost) =>
        cost.id === item.id ? { ...cost, [field]: value } : cost,
      ),
    );
  };

  const handleDelete = (item: BudgetLineItem) => {
    setFixedCosts(fixedCosts.filter((cost) => cost.id !== item.id));
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Fixed Costs</h2>

      <DataTable
        data={fixedCosts}
        columns={columns}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        addButtonText="Add Fixed Cost"
        emptyMessage="No fixed costs added yet. Click 'Add Fixed Cost' to get started."
      />
    </div>
  );
}
