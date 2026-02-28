import { prisma } from "./prisma";

/**
 * Returns the currently authenticated user with their settings.
 *
 * TODO: Replace this with a real session lookup (e.g. NextAuth `getServerSession`)
 *       once authentication is implemented. This is the single seam to change —
 *       every page/route flows through here, so adding auth is a one-line swap.
 */
export async function getCurrentUser() {
  return prisma.user.findFirstOrThrow({
    where: { email: "sofi.power@example.com" },
    include: { settings: true },
  });
}
