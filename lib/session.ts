import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "./prisma";

/**
 * Returns the currently authenticated user with their settings.
 *
 * Uses NextAuth session to get the real logged-in user.
 * Redirects to login page if no session exists.
 */
export async function getCurrentUser() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  return prisma.user.findFirstOrThrow({
    where: { email: session.user.email },
    include: { settings: true },
  });
}
