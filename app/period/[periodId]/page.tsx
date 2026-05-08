import { LineItemCategory } from "@prisma/client";

import { Dashboard } from "@/app/components/Dashboard";
import styles from "./page.module.css";
import { PeriodNavigation } from "@/app/components/PeriodNavigation";
import { SalaryInput } from "@/app/components/SalaryInput";
import { ExpensesTable } from "@/app/components/tables/ExpensesTable";
import { FixedCostsTable } from "@/app/components/tables/FixedCostsTable";
import { NonNegotiablesTable } from "@/app/components/tables/NonNegotiablesTable";
import { PeriodBadge } from "@/app/components/PeriodBadge";
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
import { prisma } from "@/lib/prisma";
import {
  getActualCurrentPeriodId,
  getActualNextPeriodId,
  getActualPreviousPeriodId,
  getIncomeTotal,
  getLineItemsByCategory,
  getPeriodFromDb,
  getPreviousPeriodFixedCosts,
  getUserPeriodBounds,
} from "@/lib/queries";
import { calculateNextPeriod } from "@/lib/periodCalculations";
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

  // Look up the DB record to get the UUID needed for line item / income queries
  const dbPeriod = await getPeriodFromDb(user.id, periodId);

  // Calculate period dates
  // If period doesn't exist in DB, check if it's a bridge period by comparing with latest period
  let period = getPeriod(periodId);

  if (!dbPeriod) {
    // Check if this might be a bridge period by finding the latest period in DB
    const latestPeriod = await prisma.period.findFirst({
      where: { userId: user.id },
      orderBy: { startDate: "desc" },
      select: { startDate: true, endDate: true },
    });

    if (latestPeriod) {
      // Check if this periodId starts the day after latest period ends (bridge period)
      const dayAfterLatest = new Date(latestPeriod.endDate);
      dayAfterLatest.setUTCDate(dayAfterLatest.getUTCDate() + 1);
      const dayAfterLatestId = getPeriodId(dayAfterLatest);

      if (periodId === dayAfterLatestId) {
        // This is a bridge period - calculate its actual dates
        const bridgePeriod = calculateNextPeriod(
          latestPeriod.endDate,
          startDay,
        );
        period = {
          id: bridgePeriod.periodId,
          startDate: bridgePeriod.startDate,
          endDate: bridgePeriod.endDate,
          lengthInDays:
            Math.ceil(
              (bridgePeriod.endDate.getTime() -
                bridgePeriod.startDate.getTime()) /
                (1000 * 60 * 60 * 24),
            ) + 1,
          name: `${bridgePeriod.startDate.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" })} ${bridgePeriod.startDate.getUTCDate()} – ${bridgePeriod.endDate.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" })} ${bridgePeriod.endDate.getUTCDate()}`,
        };
      }
    }
  }

  // Fetch all data in one parallel round-trip.
  // For new (not-yet-created) periods, also fetch previous fixed costs for the read-only preview.
  const [
    lineItemResults,
    bounds,
    inheritedFixedCosts,
    prevPeriodId,
    nextPeriodId,
    actualCurrentPeriodId,
  ] = await Promise.all([
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
    getActualPreviousPeriodId(user.id, periodId),
    getActualNextPeriodId(user.id, periodId, startDay),
    getActualCurrentPeriodId(user.id, startDay),
  ]);
  const [expenses, fixedCosts, nonNegotiables, incomeTotal] = lineItemResults;

  // Calculate the maximum allowed next period (one ahead of actual current)
  const oneAheadOfCurrent = await getActualNextPeriodId(
    user.id,
    actualCurrentPeriodId,
    startDay,
  );

  // When no DB period exists yet, show previous period's fixed costs as an inherited preview.
  const periodExists = !!dbPeriod;
  const fixedCostsToShow = periodExists ? fixedCosts : inheritedFixedCosts;

  // Period navigation
  // nextPeriodId = next period from current page's period
  // oneAheadOfCurrent = next period from the actual current period (now, today)
  // Disable if: no next exists, OR next would skip beyond one-ahead-of-current
  const prevDisabled = !prevPeriodId;
  const nextDisabled =
    !nextPeriodId ||
    (oneAheadOfCurrent !== null && nextPeriodId > oneAheadOfCurrent);

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

  const dashboardData: DashboardData = {
    income: incomeTotal,
    spent,
    fixedCosts: fixedTotal,
    nonNegotiables: nonNegTotal,
    remainingToSpend,
    dailyBudget,
  };

  const periodKey: PeriodKey = {
    startDate: period.startDate.toISOString(),
    endDate: period.endDate.toISOString(),
    name: dbPeriod?.name ?? period.name ?? periodId,
  };

  // Detect if this is a transition/bridge period
  // Normal periods are 28-31 days depending on month length
  // Transition periods fall outside this range
  const isTransitionPeriod =
    period.lengthInDays < 28 || period.lengthInDays > 31;

  return (
    <div className={styles.wrapper}>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <PeriodNavigation
          currentPeriodId={periodId}
          actualCurrentPeriodId={actualCurrentPeriodId}
          previousPeriodId={prevPeriodId}
          nextPeriodId={nextPeriodId}
          startDay={startDay}
          prevDisabled={prevDisabled}
          nextDisabled={nextDisabled}
        />

        <div className="flex items-center gap-3 mb-6">
          <h1 className="text-4xl font-bold">{period.name || periodId}</h1>
          {isTransitionPeriod && (
            <span
              className="px-3 py-1 rounded-full text-sm font-medium"
              style={{
                backgroundColor: "rgba(255, 113, 68, 0.1)",
                color: "var(--orange)",
                border: "1px solid var(--orange)",
              }}
              title={`This ${period.lengthInDays}-day period bridges your schedule change`}
            >
              Transition ({period.lengthInDays} days)
            </span>
          )}
        </div>

        <PeriodBadge
          startDate={formatDate(period.startDate)}
          endDate={formatDate(period.endDate)}
          daysRemaining={daysRemaining}
        />

        {periodExists && <Dashboard data={dashboardData} />}

        <div className="mt-12">
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
