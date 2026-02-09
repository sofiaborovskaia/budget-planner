"use client";

import { useState } from "react";
import { Button } from "@/app/components/Button";
import type { TableColumn } from "@/types/costs";

interface DataTableProps<T extends { id: string }> {
  data: T[];
  columns: TableColumn<T>[];
  onAdd?: () => void;
  onEdit?: (item: T, field: keyof T, value: any) => void;
  onDelete?: (item: T) => void;
  addButtonText?: string;
  emptyMessage?: string;
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  onAdd,
  onEdit,
  onDelete,
  addButtonText = "Add Item",
  emptyMessage = "No items found",
}: DataTableProps<T>) {
  const [editingCell, setEditingCell] = useState<{
    id: string;
    field: keyof T;
  } | null>(null);

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
          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
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
          className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      );
    }

    return (
      <span
        className={`${
          column.editable
            ? "cursor-pointer hover:bg-gray-50 px-2 py-1 rounded"
            : ""
        }`}
        onClick={() =>
          column.editable &&
          column.type !== "boolean" &&
          setEditingCell({ id: item.id, field: column.key })
        }
      >
        {formatValue(value, column.type)}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  style={{ width: column.width }}
                >
                  {column.label}
                </th>
              ))}
              {onDelete && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (onDelete ? 1 : 0)}
                  className="px-6 py-8 text-center text-gray-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  {columns.map((column) => (
                    <td
                      key={String(column.key)}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                    >
                      {renderCell(item, column)}
                    </td>
                  ))}
                  {onDelete && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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
            <Button onClick={onAdd} className="inline-flex items-center gap-2">
              <span className="text-lg">+</span>
              {addButtonText}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
