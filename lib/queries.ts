import { LineItemCategory } from "@prisma/client";

import type { BudgetLineItem } from "@/types/domain";
import { prisma } from "./prisma";
import {
  getPeriodId,
  getNextPeriodId,
  getCurrentPeriodId,
} from "@/app/lib/period";

/**
 * Look up a period in the database by user + start date (periodId string).
 * Returns null if the period hasn't been created yet (e.g. a future period).
 * All line-item / income queries below require the returned DB id (UUID).
 */
export async function getPeriodFromDb(userId: string, periodId: string) {
  // periodId is already in YYYY-MM-DD format, use it directly
  const periods = await prisma.$queryRaw<
    Array<{
      id: string;
      userId: string;
      startDate: Date;
      endDate: Date;
      name: string | null;
      createdAt: Date;
      updatedAt: Date;
    }>
  >`
    SELECT * FROM "Period" 
    WHERE "userId" = ${userId}::uuid 
    AND "startDate"::date = ${periodId}::date
    LIMIT 1
  `;

  return periods[0] || null;
}

/**
 * Fetch all line items for a period, filtered by category.
 * Always scoped to userId — never returns another user's data.
 */
export async function getLineItemsByCategory(
  userId: string,
  periodId: string, // DB UUID
  category: LineItemCategory,
): Promise<BudgetLineItem[]> {
  const items = await prisma.lineItem.findMany({
    where: { userId, periodId, category },
    orderBy: { createdAt: "asc" },
  });

  return items.map((item) => ({
    id: item.id,
    userId: item.userId,
    periodId: item.periodId,
    title: item.title,
    amount: item.amount.toNumber(), // Prisma Decimal → number
    paid: item.paid,
    category: item.category, // Already correct type from Prisma
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }));
}

/**
 * Fetch fixed costs from the period immediately before `currentStartDate`.
 * Used to show a read-only preview on new (not-yet-created) periods so the
 * user can see their recurring fixed costs before entering any data.
 */
export async function getPreviousPeriodFixedCosts(
  userId: string,
  currentStartDate: Date,
): Promise<BudgetLineItem[]> {
  const prevPeriod = await prisma.period.findFirst({
    where: { userId, startDate: { lt: currentStartDate } },
    orderBy: { startDate: "desc" },
  });

  if (!prevPeriod) return [];
  return getLineItemsByCategory(
    userId,
    prevPeriod.id,
    LineItemCategory.FIXED_COST,
  );
}

/**
 * Return the earliest and latest period start dates for a user.
 * Used to bound the prev/next navigation arrows.
 * Returns nulls if the user has no periods yet.
 */
export async function getUserPeriodBounds(
  userId: string,
): Promise<{ minStart: Date | null; maxStart: Date | null }> {
  const [min, max] = await Promise.all([
    prisma.period.findFirst({
      where: { userId },
      orderBy: { startDate: "asc" },
      select: { startDate: true },
    }),
    prisma.period.findFirst({
      where: { userId },
      orderBy: { startDate: "desc" },
      select: { startDate: true },
    }),
  ]);
  return { minStart: min?.startDate ?? null, maxStart: max?.startDate ?? null };
}

/**
 * Sum all income records for a period.
 * Always scoped to userId.
 */
export async function getIncomeTotal(
  userId: string,
  periodId: string, // DB UUID
): Promise<number> {
  const result = await prisma.income.aggregate({
    where: { userId, periodId },
    _sum: { amount: true },
  });
  return result._sum.amount?.toNumber() ?? 0;
}

/**
 * Get the actual previous period from database by querying for the most recent
 * period before the current one. This handles pay day changes correctly - if the
 * user changed from 27th to 2nd, this will still find their old 27th-based periods.
 * Falls back to null if no previous period exists.
 */
export async function getActualPreviousPeriodId(
  userId: string,
  currentPeriodId: string,
): Promise<string | null> {
  const currentPeriod = await getPeriodFromDb(userId, currentPeriodId);

  if (!currentPeriod) {
    // Current period doesn't exist in DB yet (future period)
    // Look for the most recent period that does exist
    const latestPeriod = await prisma.period.findFirst({
      where: { userId },
      orderBy: { startDate: "desc" },
      select: { startDate: true },
    });

    if (!latestPeriod) return null;

    // Return the latest actual period if it's before the current one
    const latestId = getPeriodId(latestPeriod.startDate);
    return latestId < currentPeriodId ? latestId : null;
  }

  // Find the most recent period before this one
  const prevPeriod = await prisma.period.findFirst({
    where: {
      userId,
      startDate: { lt: currentPeriod.startDate },
    },
    orderBy: { startDate: "desc" },
    select: { startDate: true },
  });

  return prevPeriod ? getPeriodId(prevPeriod.startDate) : null;
}

/**
 * Get the actual next period from database by querying for the earliest
 * period after the current one. This handles pay day changes correctly.
 * Falls back to calculation-based ID if no next period exists yet.
 */
export async function getActualNextPeriodId(
  userId: string,
  currentPeriodId: string,
  currentStartDay: number,
): Promise<string | null> {
  const currentPeriod = await getPeriodFromDb(userId, currentPeriodId);

  if (!currentPeriod) {
    // Current period doesn't exist yet - use calculation
    return getNextPeriodId(currentPeriodId);
  }

  // Find the next period after this one
  const nextPeriod = await prisma.period.findFirst({
    where: {
      userId,
      startDate: { gt: currentPeriod.startDate },
    },
    orderBy: { startDate: "asc" },
    select: { startDate: true },
  });

  // If no next period exists in DB, calculate based on current settings
  // IMPORTANT: Use the user's current startDay, not the day from currentPeriodId
  // This handles pay day changes and creates "bridge periods" to avoid gaps
  if (!nextPeriod) {
    // Return period that starts day after current period ends
    // This creates a bridge period until the first regular period with new startDay
    const dayAfterEnd = new Date(currentPeriod.endDate);
    dayAfterEnd.setUTCDate(dayAfterEnd.getUTCDate() + 1);
    return getPeriodId(dayAfterEnd);
  }

  return getPeriodId(nextPeriod.startDate);
}

/**
 * Get the actual current period ID by finding the period in the database
 * that contains today's date. This is critical for handling pay day changes:
 * if a user changes from 27th to 2nd on May 5, their current period is still
 * April 27 - May 26 (not May 2), because the change only affects future periods.
 *
 * Falls back to calculation only if no period contains today.
 */
export async function getActualCurrentPeriodId(
  userId: string,
  startDay: number,
): Promise<string> {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  // Find the period that contains today's date
  const currentPeriod = await prisma.period.findFirst({
    where: {
      userId,
      startDate: { lte: today },
      endDate: { gte: today },
    },
    orderBy: { startDate: "desc" },
    select: { startDate: true },
  });

  if (currentPeriod) {
    return getPeriodId(currentPeriod.startDate);
  }

  // No period contains today - fall back to calculation
  // This happens for new users or if they're ahead of their last created period
  return getCurrentPeriodId(startDay);
}
