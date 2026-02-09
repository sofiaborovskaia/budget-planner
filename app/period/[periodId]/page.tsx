import { Dashboard } from "@/app/components/Dashboard";
import { PeriodNavigation } from "@/app/components/PeriodNavigation";
import { SalaryInput } from "@/app/components/SalaryInput";
import { ExpensesTable } from "@/app/components/tables/ExpensesTable";
import { FixedCostsTable } from "@/app/components/tables/FixedCostsTable";
import { NonNegotiablesTable } from "@/app/components/tables/NonNegotiablesTable";
import { getPeriod } from "@/app/lib/period";
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
