"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function updateUserProfile(
  name: string,
  email: string,
): Promise<void> {
  const user = await getCurrentUser();

  await prisma.user.update({
    where: { id: user.id },
    data: { name, email },
  });

  revalidatePath("/profile");
}

export async function getUserProfile() {
  const user = await getCurrentUser();

  return {
    name: user.name,
    email: user.email,
    startDay: user.settings?.startDay ?? 1,
  };
}
