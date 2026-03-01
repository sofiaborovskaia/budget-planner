"use server";

import { LineItemCategory } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

/**
 * Ensures a period row exists in the DB for the given user + start date.
 * Called automatically before any line item or income write — the user
 * never needs to explicitly "create" a period.
 *
 * Returns the period's UUID.
 */
export async function ensurePeriod(
  startDate: Date,
  endDate: Date,
  name: string,
): Promise<string> {
  const user = await getCurrentUser();

  const existing = await prisma.period.findFirst({
    where: { userId: user.id, startDate },
  });

  if (existing) return existing.id;

  const created = await prisma.period.create({
    data: {
      userId: user.id,
      startDate,
      endDate,
      name,
    },
  });

  // Copy fixed costs from the most recent period before this one.
  const prevPeriod = await prisma.period.findFirst({
    where: { userId: user.id, startDate: { lt: startDate } },
    orderBy: { startDate: "desc" },
    include: {
      lineItems: { where: { category: LineItemCategory.FIXED_COST } },
    },
  });

  if (prevPeriod && prevPeriod.lineItems.length > 0) {
    await prisma.lineItem.createMany({
      data: prevPeriod.lineItems.map((item) => ({
        userId: user.id,
        periodId: created.id,
        category: item.category,
        title: item.title,
        amount: item.amount,
        paid: false,
      })),
    });
  }

  return created.id;
}
