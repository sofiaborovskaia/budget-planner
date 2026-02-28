import { LineItemCategory } from "@prisma/client";

import type { BudgetLineItem } from "@/types/domain";
import { LineItemCategory as DomainLineItemCategory } from "@/types/domain";
import { prisma } from "./prisma";

/**
 * Look up a period in the database by user + start date.
 * Returns null if the period hasn't been created yet (e.g. a future period).
 * All line-item / income queries below require the returned DB id (UUID).
 */
export async function getPeriodFromDb(userId: string, startDate: Date) {
  return prisma.period.findFirst({
    where: { userId, startDate },
  });
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
    category: item.category as unknown as DomainLineItemCategory,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }));
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
