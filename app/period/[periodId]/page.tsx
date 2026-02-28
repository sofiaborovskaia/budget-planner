import { LineItemCategory } from "@prisma/client";

import { Dashboard } from "@/app/components/Dashboard";
import { PeriodNavigation } from "@/app/components/PeriodNavigation";
import { SalaryInput } from "@/app/components/SalaryInput";
import { ExpensesTable } from "@/app/components/tables/ExpensesTable";
import { FixedCostsTable } from "@/app/components/tables/FixedCostsTable";
import { NonNegotiablesTable } from "@/app/components/tables/NonNegotiablesTable";
import { formatDate, getDaysRemaining, getPeriod } from "@/app/lib/period";
import { getCurrentUser } from "@/lib/session";
import {
  getIncomeTotal,
  getLineItemsByCategory,
  getPeriodFromDb,
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

  // Fetch all data in parallel; if the period doesn't exist in DB yet, return empty state
  const [expenses, fixedCosts, nonNegotiables, incomeTotal] = dbPeriod
    ? await Promise.all([
        getLineItemsByCategory(user.id, dbPeriod.id, LineItemCategory.EXPENSE),
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
    : [[], [], [], 0];

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
        <PeriodNavigation currentPeriodId={periodId} startDay={startDay} />

        <Dashboard data={dashboardData} />

        <div className="mt-8">
          <SalaryInput
            periodId={dbPeriod?.id ?? periodId}
            initialValue={incomeTotal}
          />
        </div>

        <div className="mt-12">
          <ExpensesTable
            periodId={dbPeriod?.id ?? periodId}
            initialItems={expenses}
          />
        </div>

        <div className="mt-12">
          <FixedCostsTable
            periodId={dbPeriod?.id ?? periodId}
            initialItems={fixedCosts}
          />
        </div>

        <div className="mt-12">
          <NonNegotiablesTable
            periodId={dbPeriod?.id ?? periodId}
            initialItems={nonNegotiables}
          />
        </div>
      </main>
    </div>
  );
}
