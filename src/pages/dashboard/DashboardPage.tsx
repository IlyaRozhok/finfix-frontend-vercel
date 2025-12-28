import { useEffect, useState } from "react";
import { useAuth } from "@/app/providers/AuthProvider";
import { fetchDashboardStats } from "@/features/dashboard/api";
import { DashboardStats } from "@/features/dashboard/model/types";
import { OverviewWidget } from "@/widgets/dashboard/OverviewWidget";
import { ExpenseCategoriesChart } from "@/widgets/dashboard/ExpenseCategoriesChart";
import { InstallmentsWidget } from "@/widgets/dashboard/InstallmentsWidget";
import { TransactionsFeed } from "@/widgets/dashboard/TransactionsFeed";
import { DashboardSkeleton } from "@/shared/ui";
import {
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  BanknotesIcon,
} from "@heroicons/react/24/outline";

export function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const data = await fetchDashboardStats();
        setStats(data);
      } catch (err) {
        console.error("Failed to load dashboard stats:", err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error || !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-300">{error || "Failed to load data"}</div>
      </div>
    );
  }

  // Calculate total expenses
  const totalExpenses = stats.expenses.reduce(
    (sum, expense) => sum + parseFloat(expense.amount),
    0
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">
          {" "}
          Welcome back, {user?.userName ?? user?.email}
        </h1>
        <p className="mt-1">Here you can see your financial overview</p>
      </div>

      {/* Monthly Overview Widgets */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Monthly Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <OverviewWidget
            title="Total Income"
            value={stats.incomes}
            icon={<ArrowTrendingUpIcon className="h-8 w-8" />}
          />
          <OverviewWidget
            title="Total Expenses"
            value={totalExpenses}
            icon={<CurrencyDollarIcon className="h-8 w-8" />}
          />
          <OverviewWidget
            title="Net Worth"
            value={stats.monthlyNetworth}
            icon={<BanknotesIcon className="h-8 w-8" />}
          />
          <OverviewWidget
            title="Monthly Obligations"
            value={stats.monthlyObligations}
            icon={<BanknotesIcon className="h-8 w-8" />}
          />
        </div>
      </div>

      {/* Installments & Expenses Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ExpenseCategoriesChart expenses={stats.expenses} />
        <InstallmentsWidget installments={stats.installments} />
      </div>

      {/* Transactions Feed */}
      <div className="w-full">
        <TransactionsFeed />
      </div>
    </div>
  );
}
