import { Dashboard } from "@/app/components/Dashboard";
import { PeriodNavigation } from "@/app/components/PeriodNavigation";
import { getPeriod, formatDate, getDaysRemaining } from "@/app/lib/period";
import type { DashboardData } from "@/types";

interface PageProps {
  params: Promise<{
    periodId: string;
  }>;
}

export default async function PeriodPage({ params }: PageProps) {
  const { periodId } = await params;
  const period = getPeriod(periodId);

  // Mock data -: DashboardData will be replaced with database queries
  const mockData = {
    monthName: period.monthName,
    periodStartDate: formatDate(period.startDate),
    spent: 450.75,
    fixedCosts: 1200,
    nonNegotiables: 500,
    remainingToSpend: 2349.25,
    dailyBudget: 85.5,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <PeriodNavigation currentPeriodId={periodId} />

        {/* Period Info Badge */}
        <div className="mb-6 inline-block px-4 py-2 bg-white rounded-lg shadow-sm">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Period Length:</span>{" "}
            {period.lengthInDays} days
            <span className="mx-2">•</span>
            <span className="font-medium">Days Remaining:</span>{" "}
            {getDaysRemaining(period)} days
          </p>
        </div>

        <Dashboard data={mockData} />
      </main>
    </div>
  );
}
