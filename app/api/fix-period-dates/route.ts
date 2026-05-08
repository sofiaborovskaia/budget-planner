import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function POST() {
  const user = await getCurrentUser();

  // Get all periods for this user
  const periods = await prisma.period.findMany({
    where: { userId: user.id },
    orderBy: { startDate: "asc" },
  });

  const fixes = [];

  for (const period of periods) {
    const startDateStr = period.startDate.toISOString().split("T")[0];
    const endDateStr = period.endDate.toISOString().split("T")[0];
    const startDay = period.startDate.getUTCDate();

    // If the period starts on the 26th but should start on the 27th
    if (startDay === 26) {
      // Add one day to both start and end dates
      const newStartDate = new Date(period.startDate);
      newStartDate.setUTCDate(newStartDate.getUTCDate() + 1);

      const newEndDate = new Date(period.endDate);
      newEndDate.setUTCDate(newEndDate.getUTCDate() + 1);

      const newStartDateStr = newStartDate.toISOString().split("T")[0];
      const newEndDateStr = newEndDate.toISOString().split("T")[0];

      await prisma.period.update({
        where: { id: period.id },
        data: {
          startDate: newStartDate,
          endDate: newEndDate,
        },
      });

      fixes.push({
        periodId: period.id,
        name: period.name,
        oldDates: `${startDateStr} to ${endDateStr}`,
        newDates: `${newStartDateStr} to ${newEndDateStr}`,
      });
    }
  }

  return NextResponse.json({
    message: `Fixed ${fixes.length} periods`,
    fixes,
  });
}
