"use server";

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
      userId: user.id,
    },
    data,
  });

  revalidatePath("/");
}
