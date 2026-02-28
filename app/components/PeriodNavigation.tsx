"use client";

import Link from "next/link";
import {
  getPreviousPeriodId,
  getNextPeriodId,
  getCurrentPeriodId,
} from "../lib/period";

interface PeriodNavigationProps {
  currentPeriodId: string;
  startDay: number;
}

export function PeriodNavigation({
  currentPeriodId,
  startDay,
}: PeriodNavigationProps) {
  const previousPeriodId = getPreviousPeriodId(currentPeriodId);
  const nextPeriodId = getNextPeriodId(currentPeriodId);
  const isCurrentPeriod = currentPeriodId === getCurrentPeriodId(startDay);

  return (
    <div className="flex items-center justify-between mb-8">
      {/* Previous Period */}
      <Link
        href={`/period/${previousPeriodId}`}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white shadow hover:shadow-md transition-shadow text-gray-700 hover:text-gray-900"
      >
        <span className="text-xl">←</span>
        <span className="font-medium">Previous</span>
      </Link>

      {/* Current Period Button (only show if not already on current) */}
      {!isCurrentPeriod && (
        <Link
          href={`/period/${getCurrentPeriodId(startDay)}`}
          className="px-6 py-2 rounded-lg bg-blue-500 text-white font-medium shadow hover:bg-blue-600 transition-colors"
        >
          Current Period
        </Link>
      )}

      {/* Next Period */}
      <Link
        href={`/period/${nextPeriodId}`}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white shadow hover:shadow-md transition-shadow text-gray-700 hover:text-gray-900"
      >
        <span className="font-medium">Next</span>
        <span className="text-xl">→</span>
      </Link>
    </div>
  );
}
