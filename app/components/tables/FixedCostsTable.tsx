"use client";

import { useState } from "react";
import { LineItemCategory } from "@prisma/client";
import { DataTable } from "@/app/components/ui/DataTable";
import { createLineItem, deleteLineItem, updateLineItem } from "@/lib/actions";
import type { PeriodKey } from "@/types/actions";
import type { BudgetLineItem } from "@/types/domain";
import type { TableColumn } from "@/types/ui";

interface FixedCostsTableProps {
  periodKey: PeriodKey;
  initialItems: BudgetLineItem[];
  /** When true, the table shows last period's items as a read-only preview.
   *  Editing is enabled once the user creates the period (by setting their salary). */
  inherited?: boolean;
}

export function FixedCostsTable({
  periodKey,
  initialItems,
  inherited = false,
}: FixedCostsTableProps) {
  const [fixedCosts, setFixedCosts] = useState<BudgetLineItem[]>(initialItems);

  const columns: TableColumn<BudgetLineItem>[] = [
    {
      key: "title",
      label: "Title",
      type: "text",
      editable: !inherited,
      width: "40%",
    },
    {
      key: "amount",
      label: "Amount",
      type: "currency",
      editable: !inherited,
      width: "30%",
    },
    {
      key: "paid",
      label: "Paid",
      type: "boolean",
      editable: !inherited,
      width: "20%",
    },
  ];

  const handleAdd = async () => {
    // 1. Add a temporary item instantly so the UI responds immediately
    const tempId = `temp-${Date.now()}`;
    const newItem: BudgetLineItem = {
      id: tempId,
      title: "New Fixed Cost",
      amount: 0,
      paid: false,
      periodId: tempId,
    };
    setFixedCosts((prev) => [...prev, newItem]);

    // 2. Create in DB and swap the temp id for the real UUID
    const realId = await createLineItem(
      periodKey,
      LineItemCategory.FIXED_COST,
      {
        title: newItem.title,
        amount: newItem.amount,
        paid: newItem.paid,
      },
    );
    setFixedCosts((prev) =>
      prev.map((c) => (c.id === tempId ? { ...c, id: realId } : c)),
    );
  };

  const handleEdit = (
    item: BudgetLineItem,
    field: keyof BudgetLineItem,
    value: any,
  ) => {
    // 1. Update local state immediately so the UI feels instant
    setFixedCosts(
      fixedCosts.map((cost) =>
        cost.id === item.id ? { ...cost, [field]: value } : cost,
      ),
    );

    // 2. Persist to DB via Server Action — only for the editable fields
    if (field === "paid" || field === "title" || field === "amount") {
      updateLineItem(item.id, { [field]: value });
    }
  };

  const handleDelete = (item: BudgetLineItem) => {
    // 1. Remove from local state immediately
    setFixedCosts((prev) => prev.filter((c) => c.id !== item.id));
    // 2. Delete from DB (skip temp ids that were never saved)
    if (!item.id.startsWith("temp-")) deleteLineItem(item.id);
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Fixed Costs</h2>
        {inherited && (
          <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 inline-block">
            Carried over from last period · set your salary above to start this
            period and edit these
          </p>
        )}
      </div>

      <DataTable
        data={fixedCosts}
        columns={columns}
        onAdd={inherited ? undefined : handleAdd}
        onEdit={inherited ? undefined : handleEdit}
        onDelete={inherited ? undefined : handleDelete}
        addButtonText="Add Fixed Cost"
        emptyMessage="No fixed costs added yet. Click 'Add Fixed Cost' to get started."
      />
    </div>
  );
}
