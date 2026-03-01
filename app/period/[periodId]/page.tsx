import { LineItemCategory } from "@prisma/client";

import { Dashboard } from "@/app/components/Dashboard";
import { PeriodNavigation } from "@/app/components/PeriodNavigation";
import { SalaryInput } from "@/app/components/SalaryInput";
import { ExpensesTable } from "@/app/components/tables/ExpensesTable";
import { FixedCostsTable } from "@/app/components/tables/FixedCostsTable";
import { NonNegotiablesTable } from "@/app/components/tables/NonNegotiablesTable";
import {
  formatDate,
  getDaysRemaining,
  getCurrentPeriodId,
  getNextPeriodId,
  getPeriod,
  getPeriodId,
} from "@/app/lib/period";
import type { PeriodKey } from "@/types/actions";
import { getCurrentUser } from "@/lib/session";
import {
  getIncomeTotal,
  getLineItemsByCategory,
  getPeriodFromDb,
  getPreviousPeriodFixedCosts,
  getUserPeriodBounds,
} from "@/lib/queries";
import type { DashboardData } from "@/types/ui";

interface PageProps {
  params: Promise<{
    periodId: string;
  }>;
}

export default async function PeriodPage({ params }: PageProps) {
  const { periodId } = await params;

  const user = await getCurrentUser();
  const startDay = user.settings?.startDay ?? 1;

  // Compute period dates from the URL string (works for any period, including future ones)
  const period = getPeriod(periodId);

  // Look up the DB record to get the UUID needed for line item / income queries
  const dbPeriod = await getPeriodFromDb(user.id, period.startDate);

  // Fetch all data in one parallel round-trip.
  // For new (not-yet-created) periods, also fetch previous fixed costs for the read-only preview.
  const [lineItemResults, bounds, inheritedFixedCosts] = await Promise.all([
    dbPeriod
      ? Promise.all([
          getLineItemsByCategory(
            user.id,
            dbPeriod.id,
            LineItemCategory.EXPENSE,
          ),
          getLineItemsByCategory(
            user.id,
            dbPeriod.id,
            LineItemCategory.FIXED_COST,
          ),
          getLineItemsByCategory(
            user.id,
            dbPeriod.id,
            LineItemCategory.NON_NEGOTIABLE,
          ),
          getIncomeTotal(user.id, dbPeriod.id),
        ])
      : Promise.resolve([[], [], [], 0] as [never[], never[], never[], number]),
    getUserPeriodBounds(user.id),
    dbPeriod
      ? Promise.resolve([])
      : getPreviousPeriodFixedCosts(user.id, period.startDate),
  ]);
  const [expenses, fixedCosts, nonNegotiables, incomeTotal] = lineItemResults;

  // When no DB period exists yet, show previous period's fixed costs as an inherited preview.
  const periodExists = !!dbPeriod;
  const fixedCostsToShow = periodExists ? fixedCosts : inheritedFixedCosts;

  // Navigation bounds:
  // - Prev disabled when already at (or before) the earliest period with data
  // - Next disabled when already one period ahead of today's period (max look-ahead = 1)
  const currentCalendarPeriodId = getCurrentPeriodId(startDay);
  const minPeriodId = bounds.minStart
    ? getPeriodId(bounds.minStart)
    : currentCalendarPeriodId;
  const prevDisabled = periodId <= minPeriodId;
  const nextDisabled = periodId >= getNextPeriodId(currentCalendarPeriodId);

  // Compute dashboard summary from real numbers
  const spent = expenses.reduce((sum, item) => sum + item.amount, 0);
  const fixedTotal = fixedCosts.reduce((sum, item) => sum + item.amount, 0);
  const nonNegTotal = nonNegotiables.reduce(
    (sum, item) => sum + item.amount,
    0,
  );
  const daysRemaining = getDaysRemaining(period);
  const remainingToSpend = incomeTotal - fixedTotal - nonNegTotal - spent;
  const dailyBudget = daysRemaining > 0 ? remainingToSpend / daysRemaining : 0;

  // Build a PeriodKey — safe to pass to client components and server actions.
  // Actions use this to get-or-create the period row, so the client never
  // needs to know whether the period exists in the DB yet.
  const periodKey: PeriodKey = {
    startDate: period.startDate.toISOString(),
    endDate: period.endDate.toISOString(),
    name: dbPeriod?.name ?? period.name ?? periodId,
  };

  const dashboardData: DashboardData = {
    name: period.name ?? periodId, // dominant-month name computed from dates
    periodStartDate: formatDate(period.startDate),
    periodEndDate: formatDate(period.endDate),
    daysRemaining,
    spent,
    fixedCosts: fixedTotal,
    nonNegotiables: nonNegTotal,
    remainingToSpend,
    dailyBudget,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <PeriodNavigation
          currentPeriodId={periodId}
          startDay={startDay}
          prevDisabled={prevDisabled}
          nextDisabled={nextDisabled}
        />

        <Dashboard data={dashboardData} />

        <div className="mt-8">
          <SalaryInput
            periodKey={periodKey}
            initialValue={incomeTotal}
            periodExists={periodExists}
          />
        </div>

        <div className="mt-12">
          <ExpensesTable periodKey={periodKey} initialItems={expenses} />
        </div>

        <div className="mt-12">
          <FixedCostsTable
            periodKey={periodKey}
            initialItems={fixedCostsToShow}
            inherited={!periodExists}
          />
        </div>

        <div className="mt-12">
          <NonNegotiablesTable
            periodKey={periodKey}
            initialItems={nonNegotiables}
          />
        </div>
      </main>
    </div>
  );
}
