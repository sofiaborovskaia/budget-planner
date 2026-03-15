"use client";

import { useState } from "react";
import { upsertIncome } from "@/lib/actions";
import type { PeriodKey } from "@/types/actions";
import { PencilIcon } from "./icons";
import styles from "./SalaryInput.module.css";
import { Button } from "./ui/Button";

interface SalaryInputProps {
  periodKey: PeriodKey;
  initialValue?: number;
  /** False when the period has no DB row yet — shows a "start budgeting" prompt. */
  periodExists?: boolean;
}

export function SalaryInput({
  periodKey,
  initialValue = 0,
  periodExists = true,
}: SalaryInputProps) {
  const [salary, setSalary] = useState(initialValue);
  const [isEditing, setIsEditing] = useState(false);

  const commit = (value: number) => {
    setSalary(value);
    setIsEditing(false);
    upsertIncome(periodKey, value);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "EUR",
    }).format(value);
  };

  // When the period doesn't exist yet, show a prominent "start budgeting" prompt.
  if (!periodExists && !isEditing) {
    return (
      <div className={styles.wrapper}>
        <div>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Add your salary to start budgeting
              </h3>
              <p className="text-sm text-gray-500 mt-0.5">
                You can change it at any moment later
              </p>
            </div>
            <Button onClick={() => setIsEditing(true)}>Set Button →</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div>
        <h3 className="text-2xl">Income</h3>
        <p className="text-sm">Your salary and other income sources</p>
      </div>

      {/* <div className="flex items-center gap-4"> */}
      {/* Editing */}
      {isEditing && (
        <div className={styles.salaryInputWrapper}>
          <span>€</span>
          <input
            className={styles.salaryInput}
            type="number"
            defaultValue={salary}
            onBlur={(e) => commit(Number(e.target.value) || 0)}
            onKeyDown={(e) => {
              if (e.key === "Enter")
                commit(Number((e.target as HTMLInputElement).value) || 0);
              if (e.key === "Escape") {
                setSalary(initialValue ?? 0);
                setIsEditing(false);
              }
            }}
            autoFocus
          />
        </div>
      )}
      {/* Default (not editing) */}
      {!isEditing && (
        <button
          onClick={() => setIsEditing(true)}
          className={styles.salaryButton}
          title="Click to edit salary"
        >
          {formatCurrency(salary)}
          <PencilIcon className={`w-3 h-3 ${styles.pencilIcon}`} />
        </button>
      )}
      {/* </div> */}
    </div>
  );
}
