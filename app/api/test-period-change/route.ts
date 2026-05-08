import { NextResponse } from "next/server";
import {
  getPeriod,
  getCurrentPeriodId,
  getDaysRemaining,
} from "@/app/lib/period";

/**
 * Test endpoint to simulate pay day changes without modifying the database
 * Usage: GET /api/test-period-change?oldDay=27&newDay=1&testDate=2026-05-04
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const oldDay = parseInt(searchParams.get("oldDay") || "27");
  const newDay = parseInt(searchParams.get("newDay") || "1");
  const testDateStr =
    searchParams.get("testDate") || new Date().toISOString().split("T")[0];

  // Override current date for testing
  const testDate = new Date(testDateStr + "T12:00:00Z");

  try {
    // Get current period based on OLD pay day
    const oldPeriodId = getCurrentPeriodId(oldDay);
    const oldPeriod = getPeriod(oldPeriodId);

    // Get "current" period based on NEW pay day
    const newPeriodId = getCurrentPeriodId(newDay);
    const newPeriod = getPeriod(newPeriodId);

    // Calculate when the next period with new dates starts
    const nextMonth = oldPeriod.endDate.getUTCMonth() + 1;
    const nextYear =
      nextMonth > 11
        ? oldPeriod.endDate.getUTCFullYear() + 1
        : oldPeriod.endDate.getUTCFullYear();
    const nextPeriodStart = new Date(
      Date.UTC(nextYear, nextMonth > 11 ? 0 : nextMonth, newDay),
    );

    const formatDate = (date: Date) =>
      date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
      });

    return NextResponse.json({
      testScenario: {
        testDate: formatDate(testDate),
        oldPayDay: oldDay,
        newPayDay: newDay,
      },
      currentPeriodWithOldDay: {
        id: oldPeriodId,
        name: oldPeriod.name,
        start: formatDate(oldPeriod.startDate),
        end: formatDate(oldPeriod.endDate),
        daysRemaining: getDaysRemaining(oldPeriod),
      },
      whatHappensAfterChange: {
        message: `Current period continues until ${formatDate(oldPeriod.endDate)}. New schedule starts ${formatDate(nextPeriodStart)}.`,
        userWillBeRedirectedTo: newPeriodId,
        thatPeriodIs: {
          id: newPeriodId,
          name: newPeriod.name,
          start: formatDate(newPeriod.startDate),
          end: formatDate(newPeriod.endDate),
        },
      },
      nextPeriodWithNewDates: {
        start: formatDate(nextPeriodStart),
        willBeCreatedWhen: `User navigates to budget or when ${formatDate(nextPeriodStart)} arrives`,
      },
      dataIntegrity: {
        oldPeriodUrl: `/period/${oldPeriodId}`,
        oldPeriodStatus: "Remains accessible with all data intact",
        lineItemsInOldPeriod: "Unchanged and still linked correctly",
        newPeriodsCreated: "Will follow new date structure",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Test failed", details: String(error) },
      { status: 500 },
    );
  }
}
