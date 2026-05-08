/**
 * Shared period calculation logic for bridge periods and regular periods.
 * Used by both the preview API and the period page to ensure consistency.
 */

import { getPeriodId } from "@/app/lib/period";

/**
 * Get the actual day for a given month, clamping to the last day if needed.
 * This allows day 31 to work in all months (becomes 30, 29, or 28 as appropriate).
 */
function getActualDay(year: number, month: number, targetDay: number): number {
  // Get the last day of the target month
  const lastDayOfMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  // Return the smaller of targetDay or lastDayOfMonth
  return Math.min(targetDay, lastDayOfMonth);
}

interface PeriodDates {
  startDate: Date;
  endDate: Date;
  periodId: string;
}

/**
 * Calculate the next period after a given end date, accounting for bridge periods.
 *
 * This creates a bridge period if the new startDay would skip days:
 * - Bridge starts: day after previousPeriodEnd
 * - Bridge ends: day before first regular period with newStartDay
 *
 * @param previousPeriodEnd - The end date of the previous period
 * @param newStartDay - The target start day for regular periods (1-31)
 * @returns Period dates and ID for the next period
 */
export function calculateNextPeriod(
  previousPeriodEnd: Date,
  newStartDay: number,
): PeriodDates {
  // Next period starts the day after previous period ends
  const nextPeriodStart = new Date(previousPeriodEnd);
  nextPeriodStart.setUTCDate(nextPeriodStart.getUTCDate() + 1);

  // Find when the bridge period should end (day before next regular period starts)
  // Periods end on day (newStartDay - 1), so find that day directly
  const endDay = newStartDay - 1;

  // Try to find the end day in the same month as the bridge period starts
  let targetYear = nextPeriodStart.getUTCFullYear();
  let targetMonth = nextPeriodStart.getUTCMonth();
  let actualEndDay = getActualDay(targetYear, targetMonth, endDay);

  let nextPeriodEnd = new Date(Date.UTC(targetYear, targetMonth, actualEndDay));

  // If that date is before the bridge period start, try next month
  if (nextPeriodEnd < nextPeriodStart) {
    targetMonth = targetMonth + 1;
    if (targetMonth > 11) {
      targetMonth = 0;
      targetYear++;
    }
    actualEndDay = getActualDay(targetYear, targetMonth, endDay);
    nextPeriodEnd = new Date(Date.UTC(targetYear, targetMonth, actualEndDay));
  }

  return {
    startDate: nextPeriodStart,
    endDate: nextPeriodEnd,
    periodId: getPeriodId(nextPeriodStart),
  };
}

/**
 * Calculate the period after a bridge period (the first regular period with new schedule).
 *
 * @param bridgePeriodEnd - The end date of the bridge period
 * @param newStartDay - The start day for regular periods (1-31)
 * @returns Period dates and ID for the following regular period
 */
export function calculateFollowingPeriod(
  bridgePeriodEnd: Date,
  newStartDay: number,
): PeriodDates {
  // Following period starts the day after bridge ends
  const followingStart = new Date(bridgePeriodEnd);
  followingStart.setUTCDate(followingStart.getUTCDate() + 1);

  // Calculate end date (day newStartDay - 1 of next month)
  const endDay = newStartDay - 1;
  let followingMonth = followingStart.getUTCMonth() + 1;
  let followingYear = followingStart.getUTCFullYear();

  if (followingMonth > 11) {
    followingMonth = 0;
    followingYear++;
  }

  const followingActualEndDay = getActualDay(
    followingYear,
    followingMonth,
    endDay,
  );
  const followingEnd = new Date(
    Date.UTC(followingYear, followingMonth, followingActualEndDay),
  );

  return {
    startDate: followingStart,
    endDate: followingEnd,
    periodId: getPeriodId(followingStart),
  };
}
