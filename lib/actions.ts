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
 * Delete a line item.
 * The userId check ensures a user can never delete another user's data.
 */
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
