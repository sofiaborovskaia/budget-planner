"use client";

import Link from "next/link";
import { ButtonLink } from "@/app/components/ui";

interface PeriodNavigationProps {
  currentPeriodId: string;
  actualCurrentPeriodId: string;
  previousPeriodId: string | null;
  nextPeriodId: string | null;
  startDay: number;
  prevDisabled: boolean;
  nextDisabled: boolean;
}

export function PeriodNavigation({
  currentPeriodId,
  actualCurrentPeriodId,
  previousPeriodId,
  nextPeriodId,
  startDay,
  prevDisabled,
  nextDisabled,
}: PeriodNavigationProps) {
  const isCurrentPeriod = currentPeriodId === actualCurrentPeriodId;

  return (
    <div className="flex items-center justify-between mb-8">
      {/* Previous Period */}
      {prevDisabled || !previousPeriodId ? (
        <span className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white shadow text-gray-300 cursor-not-allowed select-none">
          <span className="text-xl">←</span>
          <span className="font-medium">Previous</span>
        </span>
      ) : (
        <Link
          href={`/period/${previousPeriodId}`}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white shadow hover:shadow-md transition-shadow text-gray-700 hover:text-dark"
        >
          <span className="text-xl">←</span>
          <span className="font-medium">Previous</span>
        </Link>
      )}

      {/* Current Period Button (only show if not already on current) */}
      {!isCurrentPeriod && (
        <ButtonLink
          href={`/period/${actualCurrentPeriodId}`}
          variant="primary"
          size="md"
        >
          Back to Current Period
        </ButtonLink>
      )}

      {/* Next Period */}
      {nextDisabled || !nextPeriodId ? (
        <span className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white shadow text-gray-300 cursor-not-allowed select-none">
          <span className="font-medium">Next</span>
          <span className="text-xl">→</span>
        </span>
      ) : (
        <Link
          href={`/period/${nextPeriodId}`}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white shadow hover:shadow-md transition-shadow text-gray-700 hover:text-dark"
        >
          <span className="font-medium">Next</span>
          <span className="text-xl">→</span>
        </Link>
      )}
    </div>
  );
}
