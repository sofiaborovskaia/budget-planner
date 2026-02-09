"use client";

import { useState } from "react";
import { PencilIcon } from "./icons";

interface SalaryInputProps {
  periodId: string;
  initialValue?: number;
  onSalaryChange?: (amount: number) => void;
}

export function SalaryInput({
  periodId,
  initialValue = 3000, // Mock default - will come from previous period in future
  onSalaryChange,
}: SalaryInputProps) {
  const [salary, setSalary] = useState(initialValue);
  const [isEditing, setIsEditing] = useState(false);

  const handleSalaryChange = (newSalary: number) => {
    setSalary(newSalary);
    onSalaryChange?.(newSalary);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "EUR",
    }).format(value);
  };

  return (
    <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6 border border-green-200 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Income for this period
          </h3>
          <p className="text-sm text-gray-600">
            Your salary and other income sources
          </p>
        </div>

        <div className="flex items-center gap-4">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <span className="text-lg font-medium text-gray-700">€</span>
              <input
                type="number"
                value={salary}
                onChange={(e) =>
                  handleSalaryChange(Number(e.target.value) || 0)
                }
                onBlur={() => setIsEditing(false)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") setIsEditing(false);
                  if (e.key === "Escape") {
                    setSalary(initialValue);
                    setIsEditing(false);
                  }
                }}
                autoFocus
                className="text-2xl font-bold text-green-600 bg-white border-2 border-green-300 rounded-lg px-3 py-2 w-32 text-right focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="text-2xl font-bold text-green-600 hover:text-green-700 hover:bg-green-200 rounded-lg px-3 py-2 transition-colors flex items-center gap-2"
              title="Click to edit salary"
            >
              {formatCurrency(salary)}
              <PencilIcon className="w-3 h-3 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
