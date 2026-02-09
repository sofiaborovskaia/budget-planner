import { Dashboard } from "@/app/components/Dashboard";
import { PeriodNavigation } from "@/app/components/PeriodNavigation";
import { SalaryInput } from "@/app/components/SalaryInput";
import { ExpensesTable } from "@/app/components/ExpensesTable";
import { FixedCostsTable } from "@/app/components/FixedCostsTable";
import { NonNegotiablesTable } from "@/app/components/NonNegotiablesTable";
import { getPeriod, getDaysRemaining } from "@/app/lib/period";
import { getMockDashboardData } from "@/app/lib/mockData";

interface PageProps {
  params: Promise<{
    periodId: string;
  }>;
}

export default async function PeriodPage({ params }: PageProps) {
  const { periodId } = await params;
  const period = getPeriod(periodId);
  const mockData = getMockDashboardData(period);

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

        <div className="mt-8">
          <SalaryInput periodId={periodId} />
        </div>

        <div className="mt-12">
          <ExpensesTable periodId={periodId} />
        </div>

        <div className="mt-12">
          <FixedCostsTable periodId={periodId} />
        </div>

        <div className="mt-12">
          <NonNegotiablesTable periodId={periodId} />
        </div>
      </main>
    </div>
  );
}
