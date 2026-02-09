import { PageLayout } from "@/app/components/ui/PageLayout";

export default function AboutPage() {
  return (
    <PageLayout title="About Budget Planner">
      <div className="prose max-w-none space-y-8">
        {/* Introduction */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            What is Budget Planner?
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Budget Planner is a simple and effective tool to help you track your
            monthly finances. It organizes your expenses into clear categories
            and gives you a real-time view of your spending, helping you stay on
            track with your financial goals.
          </p>
        </section>

        {/* How it Works */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">
                📊 Dashboard Overview
              </h3>
              <p className="text-sm text-blue-800">
                See your total spent, fixed costs, and daily budget at a glance.
                Track how much you have left to spend this period.
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-medium text-green-900 mb-2">
                💰 Salary Input
              </h3>
              <p className="text-sm text-green-800">
                Set your monthly salary to automatically calculate your
                available budget after fixed costs and non-negotiables.
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-medium text-purple-900 mb-2">
                🔧 Fixed Costs
              </h3>
              <p className="text-sm text-purple-800">
                Track recurring monthly expenses like rent, utilities, and
                subscriptions. Mark them as paid to see what's outstanding.
              </p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <h3 className="font-medium text-orange-900 mb-2">🛒 Expenses</h3>
              <p className="text-sm text-orange-800">
                Log your daily purchases and spending to see where your money
                goes and stay within your budget.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            <details className="bg-gray-50 p-4 rounded-lg">
              <summary className="font-medium text-gray-800 cursor-pointer">
                How do I add a new expense or fixed cost?
              </summary>
              <p className="mt-2 text-gray-600 text-sm">
                Click the "Add" button at the bottom of any table. You can then
                edit the title and amount by clicking directly on the text.
                Press Enter to save or Escape to cancel.
              </p>
            </details>

            <details className="bg-gray-50 p-4 rounded-lg">
              <summary className="font-medium text-gray-800 cursor-pointer">
                What's the difference between Fixed Costs and Non-negotiables?
              </summary>
              <p className="mt-2 text-gray-600 text-sm">
                Fixed Costs are recurring monthly bills (rent, internet,
                insurance). Non-negotiables are essential expenses that vary
                month to month (groceries, transportation, medicine).
              </p>
            </details>

            <details className="bg-gray-50 p-4 rounded-lg">
              <summary className="font-medium text-gray-800 cursor-pointer">
                How is my daily budget calculated?
              </summary>
              <p className="mt-2 text-gray-600 text-sm">
                Daily budget = (Monthly Salary - Fixed Costs - Non-negotiables)
                ÷ Days in period. This gives you a safe amount to spend each day
                while covering all essentials.
              </p>
            </details>

            <details className="bg-gray-50 p-4 rounded-lg">
              <summary className="font-medium text-gray-800 cursor-pointer">
                Can I delete items I added by mistake?
              </summary>
              <p className="mt-2 text-gray-600 text-sm">
                Yes! Click the red trash can icon next to any item to delete it.
                Be careful - this action cannot be undone.
              </p>
            </details>

            <details className="bg-gray-50 p-4 rounded-lg">
              <summary className="font-medium text-gray-800 cursor-pointer">
                What currencies are supported?
              </summary>
              <p className="mt-2 text-gray-600 text-sm">
                Currently, the app defaults to Euro (€) formatting. You can
                change your preferred currency in the Profile settings page.
              </p>
            </details>
          </div>
        </section>

        {/* Tips */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            💡 Pro Tips
          </h2>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              Update your expenses daily to get the most accurate picture of
              your spending
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              Mark fixed costs as "paid" when you pay them to track what's still
              due
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              Use the period navigation arrows to review previous months'
              spending
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              Keep your daily budget in mind when making purchases - it helps
              avoid overspending
            </li>
          </ul>
        </section>
      </div>
    </PageLayout>
  );
}
