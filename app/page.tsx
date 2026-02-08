import { Dashboard } from "./components/Dashboard";

export default function Home() {
  // Sample data - this will be replaced with real data from your backend later
  const mockData = {
    monthName: "February 2026",
    periodStartDate: "February 5, 2026",
    spent: 450.75,
    fixedCosts: 1200,
    remainingToSpend: 2349.25,
    dailyBudget: 85.5,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Dashboard data={mockData} />
      </main>
    </div>
  );
}
