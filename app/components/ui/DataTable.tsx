"use client";

import { useState, useEffect } from "react";
import { Button } from "@/app/components/ui/Button";
import { TableHeaderAction } from "@/app/components/ui/TableHeaderAction";
import { createLineItem, deleteLineItem, updateLineItem } from "@/lib/actions";
import { ITEMS_PER_PAGE } from "@/lib/constants";
import type { CategoryValue } from "@/lib/constants";
import type { PeriodKey } from "@/types/actions";
import type { BudgetLineItem } from "@/types/domain";
import type { TableColumn } from "@/types/ui";
import styles from "./DataTable.module.css";

interface DataTableProps {
  initialData: BudgetLineItem[];
  columns: TableColumn<BudgetLineItem>[];
  periodKey: PeriodKey;
  category: CategoryValue; // CATEGORY.EXPENSE, CATEGORY.FIXED_COST, etc.
  title?: string;
  subtitle?: React.ReactNode;
  addButtonText?: string;
  emptyMessage?: string;
  itemLabel?: string;
  readOnly?: boolean; // For inherited mode
}

export function DataTable({
  initialData,
  columns,
  periodKey,
  category,
  title,
  subtitle,
  addButtonText = "Add Item",
  emptyMessage = "No items found",
  itemLabel = "item",
  readOnly = false,
}: DataTableProps) {
  // State management
  const [items, setItems] = useState<BudgetLineItem[]>(initialData);
  const [pendingItemId, setPendingItemId] = useState<string | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [tempToRealIdMap, setTempToRealIdMap] = useState<Map<string, string>>(
    new Map(),
  );
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [editingCell, setEditingCell] = useState<{
    id: string;
    field: keyof BudgetLineItem;
  } | null>(null);

  // Track which item is being edited (for preventing focus loss)
  useEffect(() => {
    setEditingItemId(editingCell?.id ?? null);
  }, [editingCell]);

  // When editing stops, apply deferred ID updates and clean up mapping
  useEffect(() => {
    if (editingItemId === null && tempToRealIdMap.size > 0) {
      setItems((prev) =>
        prev.map((item) => {
          const realId = tempToRealIdMap.get(item.id);
          return realId ? { ...item, id: realId } : item;
        }),
      );
      setTempToRealIdMap(new Map());
    }
  }, [editingItemId, tempToRealIdMap]);

  // CRUD Handlers
  const handleAdd = async () => {
    const tempId = `temp-${Date.now()}`;
    const newItem: BudgetLineItem = {
      id: tempId,
      title: "",
      amount: 0,
      paid: false,
      periodId: tempId,
    };
    setItems((prev) => [...prev, newItem]);
    setPendingItemId(tempId);
    // Auto-focus on title field
    setEditingCell({ id: tempId, field: "title" });
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
        setItems((prev) => prev.filter((i) => i.id !== item.id));
        setPendingItemId(null);
        return;
      }

      // Optimistically update UI immediately with the title
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, title: value } : i)),
      );

      // Then save to DB in the background
      const realId = await createLineItem(periodKey, category, {
        title: value,
        amount: item.amount,
        paid: item.paid,
      });

      // Store mapping from temp ID to real ID
      setTempToRealIdMap((prev) => new Map(prev).set(item.id, realId));

      // Only update ID if user is not currently editing this item
      // This prevents focus loss when user quickly edits fields after creating
      setItems((prev) =>
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
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, [field]: value } : i)),
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
    setItems((prev) => prev.filter((i) => i.id !== item.id));
    if (!item.id.startsWith("temp-")) {
      deleteLineItem(item.id);
    }
  };

  // Pagination logic
  const hasHiddenItems = items.length > visibleCount;
  const hiddenCount = items.length - visibleCount;
  const visibleData = hasHiddenItems ? items.slice(-visibleCount) : items;

  const showMoreItems = () => {
    setVisibleCount((prev) => prev + ITEMS_PER_PAGE);
  };

  const formatValue = (
    value: any,
    type: TableColumn<BudgetLineItem>["type"],
  ) => {
    switch (type) {
      case "currency":
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "EUR",
        }).format(Number(value) || 0);
      case "number":
        return Number(value) || 0;
      case "boolean":
        return value ? "✓" : "○";
      default:
        return String(value || "");
    }
  };

  const handleCellEdit = (
    item: BudgetLineItem,
    field: keyof BudgetLineItem,
    value: any,
  ) => {
    // Convert value based on column type
    const column = columns.find((col) => col.key === field);
    let convertedValue = value;

    if (column?.type === "number" || column?.type === "currency") {
      convertedValue = Number(value);
    } else if (column?.type === "boolean") {
      convertedValue = Boolean(value);
    }

    handleEdit(item, field, convertedValue);
    setEditingCell(null);
  };

  const renderCell = (
    item: BudgetLineItem,
    column: TableColumn<BudgetLineItem>,
  ) => {
    const isEditing =
      editingCell?.id === item.id && editingCell?.field === column.key;
    const value = item[column.key];

    if (column.type === "boolean") {
      return (
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(e) => handleCellEdit(item, column.key, e.target.checked)}
          className={styles.checkbox}
          disabled={!column.editable}
        />
      );
    }

    if (isEditing && column.editable) {
      return (
        <input
          type={
            column.type === "number" || column.type === "currency"
              ? "number"
              : "text"
          }
          defaultValue={String(value || "")}
          autoFocus
          onBlur={(e) => handleCellEdit(item, column.key, e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleCellEdit(item, column.key, e.currentTarget.value);
            } else if (e.key === "Escape") {
              setEditingCell(null);
            }
          }}
          className={styles.cellInput}
        />
      );
    }

    // Check if value is empty for text fields
    const isEmpty =
      !value || (typeof value === "string" && value.trim() === "");
    const isTextField = column.type === "text" || !column.type;

    // Build className
    const cellClasses = [
      column.editable && styles.editableCell,
      isEmpty && isTextField && styles.emptyPlaceholder,
    ]
      .filter(Boolean)
      .join(" ");

    // Determine display value
    let displayValue = formatValue(value, column.type);
    if (isEmpty && isTextField) {
      displayValue = "No name";
    }

    return (
      <span
        className={cellClasses}
        onClick={() =>
          column.editable &&
          column.type !== "boolean" &&
          setEditingCell({ id: item.id, field: column.key })
        }
      >
        {displayValue}
      </span>
    );
  };

  return (
    <div className={styles.wrapper}>
      {/* Header Section */}
      {(title || subtitle) && (
        <div className={styles.header}>
          {title && <h2 className={styles.title}>{title}</h2>}
          {subtitle && <div className={styles.subtitle}>{subtitle}</div>}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className={styles.tableHeaderRow}>
              <tr>
                {columns.map((column) => (
                  <th key={String(column.key)} className={styles.tableHeader}>
                    {column.label}
                  </th>
                ))}
                {!readOnly && (
                  <th className={styles.tableHeader}>
                    <span className="visuallyHidden">Actions</span>
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {hasHiddenItems && (
                <tr>
                  <td
                    colSpan={columns.length + (readOnly ? 0 : 1)}
                    className="p-0"
                  >
                    <TableHeaderAction
                      hiddenCount={hiddenCount}
                      onShowMore={showMoreItems}
                      itemLabel={itemLabel}
                    />
                  </td>
                </tr>
              )}
              {items.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + (readOnly ? 0 : 1)}
                    className="px-6 py-8 text-center"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                visibleData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    {columns.map((column) => (
                      <td key={String(column.key)} className={styles.tableCell}>
                        {renderCell(item, column)}
                      </td>
                    ))}
                    {!readOnly && (
                      <td className={styles.tableCell}>
                        <button
                          onClick={() => handleDelete(item)}
                          className="text-sm font-medium cursor-pointer"
                        >
                          🗑️
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer with totals and add button */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
          <div className="flex justify-between items-center">
            {/* Totals */}
            {columns.some(
              (col) => col.type === "currency" || col.type === "number",
            ) && (
              <div className="flex gap-8">
                {columns
                  .filter(
                    (col) => col.type === "currency" || col.type === "number",
                  )
                  .map((column) => {
                    const total = items.reduce((sum, item) => {
                      return sum + (Number(item[column.key]) || 0);
                    }, 0);
                    return (
                      <div
                        key={String(column.key)}
                        className="text-sm font-medium text-gray-700"
                      >
                        {column.label} Total: {formatValue(total, column.type)}
                      </div>
                    );
                  })}
              </div>
            )}

            {/* Add Button */}
            {!readOnly && (
              <Button
                onClick={handleAdd}
                className="inline-flex items-center gap-2"
              >
                <span className="text-lg">+</span>
                {addButtonText}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
