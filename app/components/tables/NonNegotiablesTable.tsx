"use client";

import { useState, useEffect } from "react";
import { DataTable } from "@/app/components/ui/DataTable";
import { createLineItem, deleteLineItem, updateLineItem } from "@/lib/actions";
import { CATEGORY } from "@/lib/constants";
import type { PeriodKey } from "@/types/actions";
import type { BudgetLineItem } from "@/types/domain";
import type { TableColumn } from "@/types/ui";

interface NonNegotiablesTableProps {
  periodKey: PeriodKey;
  initialItems: BudgetLineItem[];
}

export function NonNegotiablesTable({
  periodKey,
  initialItems,
}: NonNegotiablesTableProps) {
  const [nonNegotiables, setNonNegotiables] =
    useState<BudgetLineItem[]>(initialItems);
  const [pendingItemId, setPendingItemId] = useState<string | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  // Map temp IDs to real database IDs for updates during editing
  const [tempToRealIdMap, setTempToRealIdMap] = useState<Map<string, string>>(
    new Map(),
  );

  // When editing stops, apply deferred ID updates and clean up mapping
  useEffect(() => {
    if (editingItemId === null && tempToRealIdMap.size > 0) {
      setNonNegotiables((prev) =>
        prev.map((n) => {
          const realId = tempToRealIdMap.get(n.id);
          return realId ? { ...n, id: realId } : n;
        }),
      );
      setTempToRealIdMap(new Map());
    }
  }, [editingItemId, tempToRealIdMap]);

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
    },
    {
      key: "paid",
      label: "Paid",
      type: "boolean",
      editable: true,
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
    setNonNegotiables((prev) => [...prev, newItem]);
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
        setNonNegotiables((prev) => prev.filter((i) => i.id !== item.id));
        setPendingItemId(null);
        return;
      }

      // Optimistically update UI immediately with the title
      setNonNegotiables((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, title: value } : i)),
      );

      // Then save to DB in the background
      const realId = await createLineItem(periodKey, CATEGORY.NON_NEGOTIABLE, {
        title: value,
        amount: item.amount,
        paid: item.paid,
      });

      // Store mapping from temp ID to real ID
      setTempToRealIdMap((prev) => new Map(prev).set(item.id, realId));

      // Only update ID if user is not currently editing this item
      // This prevents focus loss when user quickly edits fields after creating
      setNonNegotiables((prev) =>
        prev.map((i) =>
          i.id === item.id && editingItemId !== item.id
            ? { ...i, id: realId }
            : i,
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
    setNonNegotiables(
      nonNegotiables.map((item_) =>
        item_.id === item.id ? { ...item_, [field]: value } : item_,
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
    setNonNegotiables((prev) => prev.filter((i) => i.id !== item.id));
    if (!item.id.startsWith("temp-")) deleteLineItem(item.id);
  };

  return (
    <DataTable
      title="Non-Negotiables"
      subtitle="Essential expenses for this period that vary month to month."
      data={nonNegotiables}
      columns={columns}
      onAdd={handleAdd}
      onEdit={handleEdit}
      onDelete={handleDelete}
      addButtonText="Add Non-Negotiable"
      emptyMessage="No non-negotiables added yet. Click 'Add Non-Negotiable' to get started."
      autoFocusItemId={pendingItemId}
      autoFocusField="title"
      itemLabel="non-negotiable"
      onEditingChange={setEditingItemId}
    />
  );
}
