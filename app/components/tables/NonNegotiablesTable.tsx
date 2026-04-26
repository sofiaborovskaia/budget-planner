"use client";

import { useState } from "react";
import { DataTable } from "@/app/components/ui/DataTable";
import { TableHeaderAction } from "@/app/components/ui/TableHeaderAction";
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
  const [visibleCount, setVisibleCount] = useState(8);

  const ITEMS_PER_PAGE = 8;
  const hasHiddenItems = nonNegotiables.length > visibleCount;
  const hiddenCount = nonNegotiables.length - visibleCount;
  const visibleNonNegotiables = hasHiddenItems
    ? nonNegotiables.slice(-visibleCount)
    : nonNegotiables;

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

      // Update with real database ID
      setNonNegotiables((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, id: realId } : i)),
      );
      setPendingItemId(null);
      return;
    }

    // Regular edit for existing items
    setNonNegotiables(
      nonNegotiables.map((item_) =>
        item_.id === item.id ? { ...item_, [field]: value } : item_,
      ),
    );

    // Persist to DB via Server Action (only for non-pending items)
    if (
      !isPending &&
      (field === "paid" || field === "title" || field === "amount")
    ) {
      updateLineItem(item.id, { [field]: value });
    }
  };

  const handleDelete = (item: BudgetLineItem) => {
    setNonNegotiables((prev) => prev.filter((i) => i.id !== item.id));
    if (!item.id.startsWith("temp-")) deleteLineItem(item.id);
  };

  const showMoreItems = () => {
    setVisibleCount((prev) => prev + ITEMS_PER_PAGE);
  };

  return (
    <DataTable
      title="Non-Negotiables"
      subtitle="Essential expenses for this period that vary month to month."
      data={visibleNonNegotiables}
      columns={columns}
      onAdd={handleAdd}
      onEdit={handleEdit}
      onDelete={handleDelete}
      addButtonText="Add Non-Negotiable"
      emptyMessage="No non-negotiables added yet. Click 'Add Non-Negotiable' to get started."
      autoFocusItemId={pendingItemId}
      autoFocusField="title"
      headerAction={
        hasHiddenItems ? (
          <TableHeaderAction
            hiddenCount={hiddenCount}
            onShowMore={showMoreItems}
            itemLabel="item"
          />
        ) : undefined
      }
    />
  );
}
