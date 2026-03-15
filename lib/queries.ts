import { LineItemCategory } from "@prisma/client";

import type { BudgetLineItem } from "@/types/domain";
import { prisma } from "./prisma";

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
