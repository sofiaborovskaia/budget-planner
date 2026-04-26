"use client";

import { useState } from "react";
import { DataTable } from "@/app/components/ui/DataTable";
import { TableHeaderAction } from "@/app/components/ui/TableHeaderAction";
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
  const [visibleCount, setVisibleCount] = useState(8);

  const ITEMS_PER_PAGE = 8;
  const hasHiddenItems = fixedCosts.length > visibleCount;
  const hiddenCount = fixedCosts.length - visibleCount;
  const visibleFixedCosts = hasHiddenItems
    ? fixedCosts.slice(-visibleCount)
    : fixedCosts;

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

      // Update with real database ID
      setFixedCosts((prev) =>
        prev.map((c) => (c.id === item.id ? { ...c, id: realId } : c)),
      );
      setPendingItemId(null);
      return;
    }

    // Regular edit for existing items
    setFixedCosts(
      fixedCosts.map((cost) =>
        cost.id === item.id ? { ...cost, [field]: value } : cost,
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
    // 1. Remove from local state immediately
    setFixedCosts((prev) => prev.filter((c) => c.id !== item.id));
    // 2. Delete from DB (skip temp ids that were never saved)
    if (!item.id.startsWith("temp-")) deleteLineItem(item.id);
  };

  const showMoreItems = () => {
    setVisibleCount((prev) => prev + ITEMS_PER_PAGE);
  };

  return (
    <DataTable
      title="Fixed Costs"
      subtitle={
        inherited
          ? "Carried over from last period. Set your salary above to start this period and edit these."
          : "Recurring monthly expenses like rent, utilities, and subscriptions. Mark them as paid to see what's outstanding."
      }
      data={visibleFixedCosts}
      columns={columns}
      onAdd={inherited ? undefined : handleAdd}
      onEdit={inherited ? undefined : handleEdit}
      onDelete={inherited ? undefined : handleDelete}
      addButtonText="Add Fixed Cost"
      emptyMessage="No fixed costs added yet. Click 'Add Fixed Cost' to get started."
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
