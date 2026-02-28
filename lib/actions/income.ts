"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

/**
 * Upsert the income total for a period.
 * If an income record already exists for this period, update it.
 * If not, create one. Scoped to the current user.
 */
export async function upsertIncome(
  periodId: string,
  amount: number,
): Promise<void> {
  const user = await getCurrentUser();

  const existing = await prisma.income.findFirst({
    where: { userId: user.id, periodId },
  });

  if (existing) {
    await prisma.income.update({
      where: { id: existing.id },
      data: { amount },
    });
  } else {
    await prisma.income.create({
      data: { userId: user.id, periodId, amount },
    });
  }

  revalidatePath("/");
}
