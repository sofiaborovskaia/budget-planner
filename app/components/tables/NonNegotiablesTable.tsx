"use client";

import { DataTable } from "@/app/components/ui/DataTable";
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

  return (
    <DataTable
      title="Non-Negotiables"
      subtitle="Essential expenses for this period that vary month to month."
      initialData={initialItems}
      columns={columns}
      periodKey={periodKey}
      category={CATEGORY.NON_NEGOTIABLE}
      addButtonText="Add Non-Negotiable"
      emptyMessage="No non-negotiables added yet. Click 'Add Non-Negotiable' to get started."
      itemLabel="non-negotiable"
    />
  );
}
