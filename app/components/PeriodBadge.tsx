"use client";

import { useState } from "react";

interface PeriodBadgeProps {
  startDate: string;
  endDate: string;
  daysRemaining: number;
}

export function PeriodBadge({
  startDate: initialStartDate,
  endDate: initialEndDate,
  daysRemaining,
}: PeriodBadgeProps) {
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);
  const [isEditingStart, setIsEditingStart] = useState(false);
  const [isEditingEnd, setIsEditingEnd] = useState(false);

  const handleDateChange = (
    value: string,
    setter: (val: string) => void,
    setEditing: (val: boolean) => void,
  ) => {
    setter(value);
    setEditing(false);
    // TODO: Update period in database
  };

  const renderEditableDate = (
    currentValue: string,
    isEditing: boolean,
    setEditing: (val: boolean) => void,
    setValue: (val: string) => void,
    initialValue: string,
  ) => {
    if (isEditing) {
      return (
        <input
          type="date"
          value={currentValue}
          onChange={(e) => setValue(e.target.value)}
          onBlur={(e) => handleDateChange(e.target.value, setValue, setEditing)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleDateChange(e.currentTarget.value, setValue, setEditing);
            } else if (e.key === "Escape") {
              setValue(initialValue);
              setEditing(false);
            }
          }}
          autoFocus
          className="px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      );
    }

    return (
      <span
        className="cursor-pointer hover:bg-gray-50 px-2 py-1 rounded"
        onClick={() => setEditing(true)}
      >
        {currentValue}
      </span>
    );
  };

  return (
    <div className="mb-6 inline-block px-4 py-2 bg-white rounded-lg shadow-sm">
      <p className="text-sm text-gray-600">
        <span className="font-medium">Start:</span>{" "}
        {renderEditableDate(
          startDate,
          isEditingStart,
          setIsEditingStart,
          setStartDate,
          initialStartDate,
        )}
        <span className="mx-2">•</span>
        <span className="font-medium">End:</span>{" "}
        {renderEditableDate(
          endDate,
          isEditingEnd,
          setIsEditingEnd,
          setEndDate,
          initialEndDate,
        )}
        <span className="mx-2">•</span>
        <span className="font-medium">Days Remaining:</span> {daysRemaining}
      </p>
    </div>
  );
}
