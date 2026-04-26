"use client";

import { useState, useEffect } from "react";
import { Button } from "@/app/components/ui/Button";
import { TableHeaderAction } from "@/app/components/ui/TableHeaderAction";
import { ITEMS_PER_PAGE } from "@/lib/constants";
import type { TableColumn } from "@/types/ui";
import styles from "./DataTable.module.css";

interface DataTableProps<T extends { id: string }> {
  data: T[];
  columns: TableColumn<T>[];
  title?: string;
  subtitle?: React.ReactNode;
  onAdd?: () => void;
  onEdit?: (item: T, field: keyof T, value: any) => void;
  onDelete?: (item: T) => void;
  addButtonText?: string;
  emptyMessage?: string;
  autoFocusItemId?: string | null;
  autoFocusField?: keyof T;
  itemLabel?: string;
  onEditingChange?: (itemId: string | null) => void; // Notify parent when editing starts/stops
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  title,
  subtitle,
  onAdd,
  onEdit,
  onDelete,
  addButtonText = "Add Item",
  emptyMessage = "No items found",
  autoFocusItemId,
  autoFocusField,
  itemLabel = "item",
  onEditingChange,
}: DataTableProps<T>) {
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [editingCell, setEditingCell] = useState<{
    id: string;
    field: keyof T;
  } | null>(null);

  // Notify parent when editing state changes
  useEffect(() => {
    onEditingChange?.(editingCell?.id ?? null);
  }, [editingCell, onEditingChange]);

  // Pagination logic
  const hasHiddenItems = data.length > visibleCount;
  const hiddenCount = data.length - visibleCount;
  const visibleData = hasHiddenItems ? data.slice(-visibleCount) : data;

  const showMoreItems = () => {
    setVisibleCount((prev) => prev + ITEMS_PER_PAGE);
  };

  // Auto-focus new items
  useEffect(() => {
    if (autoFocusItemId && autoFocusField) {
      setEditingCell({ id: autoFocusItemId, field: autoFocusField });
    }
  }, [autoFocusItemId, autoFocusField]);

  const formatValue = (value: any, type: TableColumn<T>["type"]) => {
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

  const handleCellEdit = (item: T, field: keyof T, value: any) => {
    if (onEdit) {
      // Convert value based on column type
      const column = columns.find((col) => col.key === field);
      let convertedValue = value;

      if (column?.type === "number" || column?.type === "currency") {
        convertedValue = Number(value);
      } else if (column?.type === "boolean") {
        convertedValue = Boolean(value);
      }

      onEdit(item, field, convertedValue);
    }
    setEditingCell(null);
  };

  const renderCell = (item: T, column: TableColumn<T>) => {
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
                {onDelete && (
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
                    colSpan={columns.length + (onDelete ? 1 : 0)}
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
              {data.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + (onDelete ? 1 : 0)}
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
                    {onDelete && (
                      <td className={styles.tableCell}>
                        <button
                          onClick={() => onDelete(item)}
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
                    const total = data.reduce((sum, item) => {
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
            {onAdd && (
              <Button
                onClick={onAdd}
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
