"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

/**
 * Ensures a period row exists in the DB for the given user + start date.
 * Called automatically before any line item or income write — the user
 * never needs to explicitly "create" a period.
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

  return created.id;
}
