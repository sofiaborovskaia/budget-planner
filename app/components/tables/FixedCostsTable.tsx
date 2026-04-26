"use client";

import { useState, useEffect } from "react";
import { DataTable } from "@/app/components/ui/DataTable";
import { createLineItem, deleteLineItem, updateLineItem } from "@/lib/actions";
import { CATEGORY } from "@/lib/constants";
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
  const [pendingItemId, setPendingItemId] = useState<string | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  // Map temp IDs to real database IDs for updates during editing
  const [tempToRealIdMap, setTempToRealIdMap] = useState<Map<string, string>>(
    new Map(),
  );

  // When editing stops, apply deferred ID updates and clean up mapping
  useEffect(() => {
    if (editingItemId === null && tempToRealIdMap.size > 0) {
      setFixedCosts((prev) =>
        prev.map((c) => {
          const realId = tempToRealIdMap.get(c.id);
          return realId ? { ...c, id: realId } : c;
        }),
      );
      setTempToRealIdMap(new Map());
    }
  }, [editingItemId, tempToRealIdMap]);

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
    },
    {
      key: "paid",
      label: "Paid",
      type: "boolean",
      editable: !inherited,
    },
  ];

  const handleAdd = async () => {
    const tempId = `temp-${Date.now()}`;
    const newItem: BudgetLineItem = {
      id: tempId,
      title: "",
      amount: 0,
      paid: false,
      periodId: tempId,
    };
    setFixedCosts((prev) => [...prev, newItem]);
    setPendingItemId(tempId);
  };

  const handleEdit = async (
    item: BudgetLineItem,
    field: keyof BudgetLineItem,
    value: any,
  ) => {
    const isPending = item.id === pendingItemId;

    if (isPending && field === "title") {
      // If title is empty, remove the item
      if (!value || value.trim() === "") {
        setFixedCosts((prev) => prev.filter((c) => c.id !== item.id));
        setPendingItemId(null);
        return;
      }

      // Optimistically update UI immediately with the title
      setFixedCosts((prev) =>
        prev.map((c) => (c.id === item.id ? { ...c, title: value } : c)),
      );

      // Then save to DB in the background
      const realId = await createLineItem(periodKey, CATEGORY.FIXED_COST, {
        title: value,
        amount: item.amount,
        paid: item.paid,
      });

      // Store mapping from temp ID to real ID
      setTempToRealIdMap((prev) => new Map(prev).set(item.id, realId));

      // Only update ID if user is not currently editing this item
      // This prevents focus loss when user quickly edits fields after creating
      setFixedCosts((prev) =>
        prev.map((c) =>
          c.id === item.id && editingItemId !== item.id
            ? { ...c, id: realId }
            : c,
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
    setFixedCosts(
      fixedCosts.map((cost) =>
        cost.id === item.id ? { ...cost, [field]: value } : cost,
      ),
    );

    // Persist to DB via Server Action
    // Use the real ID from mapping if item still has temp ID
    const dbId = tempToRealIdMap.get(item.id) || item.id;
    const canUpdate = !isPending && !dbId.startsWith("temp-");

    if (
      canUpdate &&
      (field === "paid" || field === "title" || field === "amount")
    ) {
      updateLineItem(dbId, { [field]: value });
    }
  };

  const handleDelete = (item: BudgetLineItem) => {
    // 1. Remove from local state immediately
    setFixedCosts((prev) => prev.filter((c) => c.id !== item.id));
    // 2. Delete from DB (skip temp ids that were never saved)
    if (!item.id.startsWith("temp-")) deleteLineItem(item.id);
  };

  return (
    <DataTable
      title="Fixed Costs"
      subtitle={
        inherited
          ? "Carried over from last period. Set your salary above to start this period and edit these."
          : "Recurring monthly expenses like rent, utilities, and subscriptions. Mark them as paid to see what's outstanding."
      }
      data={fixedCosts}
      columns={columns}
      onAdd={inherited ? undefined : handleAdd}
      onEdit={inherited ? undefined : handleEdit}
      onDelete={inherited ? undefined : handleDelete}
      addButtonText="Add Fixed Cost"
      emptyMessage="No fixed costs added yet. Click 'Add Fixed Cost' to get started."
      autoFocusItemId={pendingItemId}
      autoFocusField="title"
      itemLabel="fixed cost"
      onEditingChange={setEditingItemId}
    />
  );
}
