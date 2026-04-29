"use client";

import { DataTable } from "@/app/components/ui/DataTable";
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

  return (
    <DataTable
      title="Fixed Costs"
      subtitle={
        inherited
          ? "Carried over from last period. Set your salary above to start this period and edit these."
          : "Recurring monthly expenses like rent, utilities, and subscriptions. Mark them as paid to see what's outstanding."
      }
      initialData={initialItems}
      columns={columns}
      periodKey={periodKey}
      category={CATEGORY.FIXED_COST}
      addButtonText="Add Fixed Cost"
      emptyMessage="No fixed costs added yet. Click 'Add Fixed Cost' to get started."
      itemLabel="fixed cost"
      readOnly={inherited}
    />
  );
}
