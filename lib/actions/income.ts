"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { getPeriodId } from "@/app/lib/period";
import type { PeriodKey } from "@/types/actions";
import { ensurePeriod } from "./periods";

export async function upsertIncome(
  period: PeriodKey,
  amount: number,
): Promise<void> {
  const user = await getCurrentUser();

  // Get or create the period row, returning its UUID
  const periodId = await ensurePeriod(
    new Date(period.startDate),
    new Date(period.endDate),
    period.name,
  );

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

  // Revalidate the specific period page
  const periodPath = getPeriodId(new Date(period.startDate));
  revalidatePath(`/period/${periodPath}`);
}
