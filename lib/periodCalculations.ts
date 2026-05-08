/**
 * Shared period calculation logic for bridge periods and regular periods.
 * Used by both the preview API and the period page to ensure consistency.
 */

import { getPeriodId } from "@/app/lib/period";

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

  // Find the first occurrence of newStartDay AFTER the previous period ends
  // Try newStartDay in the same month as previous period end
  let firstRegularPeriodStart = new Date(
    Date.UTC(
      previousPeriodEnd.getUTCFullYear(),
      previousPeriodEnd.getUTCMonth(),
      newStartDay,
    ),
  );

  // If that date is before or equal to previous period end, go to next month
  if (firstRegularPeriodStart <= previousPeriodEnd) {
    const nextMonth = previousPeriodEnd.getUTCMonth() + 1;
    const nextYear =
      nextMonth > 11
        ? previousPeriodEnd.getUTCFullYear() + 1
        : previousPeriodEnd.getUTCFullYear();
    firstRegularPeriodStart = new Date(
      Date.UTC(nextYear, nextMonth > 11 ? 0 : nextMonth, newStartDay),
    );
  }

  // Bridge period ends the day before first regular period starts
  const nextPeriodEnd = new Date(firstRegularPeriodStart);
  nextPeriodEnd.setUTCDate(nextPeriodEnd.getUTCDate() - 1);

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

  // Calculate end date (day before next occurrence of newStartDay)
  const followingMonth = followingStart.getUTCMonth() + 1;
  const followingYear =
    followingMonth > 11
      ? followingStart.getUTCFullYear() + 1
      : followingStart.getUTCFullYear();
  const nextRegularStart = new Date(
    Date.UTC(
      followingYear,
      followingMonth > 11 ? 0 : followingMonth,
      newStartDay,
    ),
  );
  const followingEnd = new Date(nextRegularStart);
  followingEnd.setUTCDate(followingEnd.getUTCDate() - 1);

  return {
    startDate: followingStart,
    endDate: followingEnd,
    periodId: getPeriodId(followingStart),
  };
}
