import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getPeriodId } from "@/app/lib/period";
import {
  calculateNextPeriod,
  calculateFollowingPeriod,
} from "@/lib/periodCalculations";

/**
 * API endpoint to preview what the next period will be with new start day settings.
 * This checks the database for the user's most recent period and calculates when
 * the next period with the new dates will start.
 *
 * Usage: GET /api/preview-next-period?newDay=2
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const newDay = parseInt(searchParams.get("newDay") || "1");

  if (newDay < 1 || newDay > 31) {
    return NextResponse.json(
      { error: "Invalid day. Must be between 1 and 31." },
      { status: 400 },
    );
  }

  try {
    const user = await getCurrentUser();

    // Find the user's most recent period in the database
    const latestPeriod = await prisma.period.findFirst({
      where: { userId: user.id },
      orderBy: { startDate: "desc" },
      select: { startDate: true, endDate: true, name: true },
    });

    if (!latestPeriod) {
      // No periods exist yet - calculate from today
      const today = new Date();
      const currentMonth = today.getUTCMonth();
      const currentYear = today.getUTCFullYear();

      // Start from the new day in current month, or next month if we're past it
      const dayOfMonth = today.getUTCDate();
      const startMonth = dayOfMonth >= newDay ? currentMonth + 1 : currentMonth;
      const startYear = startMonth > 11 ? currentYear + 1 : currentYear;

      const nextPeriodStart = new Date(
        Date.UTC(startYear, startMonth > 11 ? 0 : startMonth, newDay),
      );

      // Calculate end date (day before next period starts)
      const followingMonth = nextPeriodStart.getUTCMonth() + 1;
      const followingYear =
        followingMonth > 11
          ? nextPeriodStart.getUTCFullYear() + 1
          : nextPeriodStart.getUTCFullYear();
      const followingPeriodStart = new Date(
        Date.UTC(
          followingYear,
          followingMonth > 11 ? 0 : followingMonth,
          newDay,
        ),
      );
      const nextPeriodEnd = new Date(followingPeriodStart);
      nextPeriodEnd.setUTCDate(nextPeriodEnd.getUTCDate() - 1);

      return NextResponse.json({
        periodId: getPeriodId(nextPeriodStart),
        startDate: nextPeriodStart.toISOString(),
        endDate: nextPeriodEnd.toISOString(),
        currentPeriodId: null,
        isNewUser: true,
      });
    }

    // Calculate next period starting after the most recent period ends
    const nextPeriod = calculateNextPeriod(latestPeriod.endDate, newDay);
    const followingPeriod = calculateFollowingPeriod(
      nextPeriod.endDate,
      newDay,
    );

    return NextResponse.json({
      periodId: nextPeriod.periodId,
      startDate: nextPeriod.startDate.toISOString(),
      endDate: nextPeriod.endDate.toISOString(),
      followingPeriodId: followingPeriod.periodId,
      followingStartDate: followingPeriod.startDate.toISOString(),
      followingEndDate: followingPeriod.endDate.toISOString(),
      currentPeriodId: getPeriodId(latestPeriod.startDate),
      isNewUser: false,
    });
  } catch (error) {
    console.error("Error previewing next period:", error);
    return NextResponse.json(
      { error: "Failed to preview next period" },
      { status: 500 },
    );
  }
}
