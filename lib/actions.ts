"use server";

import { LineItemCategory } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { prisma } from "./prisma";
import { getCurrentUser } from "./session";

/**
 * Update any fields on a line item.
 * Accepts a partial object — only the fields you pass will be changed.
 * The userId check ensures a user can never update another user's data.
 */
export async function updateLineItem(
  lineItemId: string,
  data: { title?: string; amount?: number; paid?: boolean },
): Promise<void> {
  const user = await getCurrentUser();

  await prisma.lineItem.update({
    where: {
      id: lineItemId,
      userId: user.id, // security: scoped to current user
    },
    data,
  });

  revalidatePath("/");
}

/**
 * Create a new line item and return its DB id.
 * We return the id so the client can replace its temporary local id
 * with the real UUID — ensuring edits/deletes on the new row work correctly.
 */
export async function createLineItem(
  periodId: string,
  category: LineItemCategory,
  data: { title: string; amount: number; paid: boolean },
): Promise<string> {
  const user = await getCurrentUser();

  const item = await prisma.lineItem.create({
    data: {
      userId: user.id,
      periodId,
      category,
      ...data,
    },
  });

  revalidatePath("/");
  return item.id;
}

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

export async function deleteLineItem(lineItemId: string): Promise<void> {
  const user = await getCurrentUser();

  await prisma.lineItem.delete({
    where: {
      id: lineItemId,
      userId: user.id, // security: scoped to current user
    },
  });

  revalidatePath("/");
}
