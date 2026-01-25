import { useAuth } from "@/app/providers/AuthProvider";
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { clsx } from "clsx";
import { fetchAccounts, Account } from "@/features/accounts/api";
import { AccountForm } from "@/features/accounts/ui/AccountForm";
import { Button } from "@/shared/ui";
import { MonobankSyncModal } from "@/features/monobank";
import { fetchIntegrations, UserIntegration } from "@/features/monobank/api";
import { fetchAllIncomes } from "@/features/incomes/api";
import { fetchUserExpenses } from "@/features/expenses/api";
import { fetchDebts } from "@/features/debts/api";
import {
  fetchInstallments,
  fetchTransactions,
  Transaction,
} from "@/features/transactions/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [chartPeriod, setChartPeriod] = useState<"1month" | "3month">("3month");
  const [showForm, setShowForm] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [monobankIntegration, setMonobankIntegration] = useState<UserIntegration | null>(null);
  const [stats, setStats] = useState({
    accountsCount: 0,
    totalMonthlyIncome: 0,
    totalMonthlyExpenses: 0,
    totalDebts: 0,
    totalInstallments: 0,
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const [accountsData, incomes, expenses, debts, installments] =
          await Promise.all([
            fetchAccounts().catch(() => []),
            fetchAllIncomes().catch(() => ({ regular: [], events: [] })),
            fetchUserExpenses().catch(() => []),
            fetchDebts().catch(() => []),
            fetchInstallments().catch(() => []),
          ]);

        setAccounts(accountsData);

        const totalMonthlyIncome = incomes.regular.reduce(
          (sum: number, inc: { amount?: string | number }) =>
            sum + (Number(inc.amount) || 0),
          0
        );

        const totalMonthlyExpenses = expenses.reduce(
          (sum: number, exp: { amount?: string | number }) =>
            sum + (Number(exp.amount) || 0),
          0
        );

        const totalDebts = debts.reduce(
          (sum: number, debt: { totalDebt?: string | number }) =>
            sum + (Number(debt.totalDebt) || 0),
          0
        );

        const totalInstallments = installments.reduce(
          (sum: number, inst: { totalAmount?: string | number }) =>
            sum + (Number(inst.totalAmount) || 0),
          0
        );

        setStats({
          accountsCount: accountsData.length,
          totalMonthlyIncome,
          totalMonthlyExpenses,
          totalDebts,
          totalInstallments,
        });

        const allTxPromises = accountsData.map((account) =>
          fetchTransactions(account.id).catch(() => [])
        );
        const txArrays = await Promise.all(allTxPromises);
        setTransactions(txArrays.flat());
      } catch (error) {
        console.error("Failed to load dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  useEffect(() => {
    const loadIntegrations = async () => {
      try {
        const integrations = await fetchIntegrations();
        const monoIntegration = integrations.find(
          (integration: UserIntegration) => integration.provider === "monobank"
        );
        setMonobankIntegration(monoIntegration || null);
      } catch (err) {
        console.error("Failed to load integrations", err);
      }
    };

    loadIntegrations();
  }, []);

  const handleCreateAccount = async () => {
    // Reload accounts after creation
    try {
      const accountsData = await fetchAccounts().catch(() => []);
      setAccounts(accountsData);
      setStats(prev => ({ ...prev, accountsCount: accountsData.length }));
    } catch (err) {
      console.error("Failed to reload accounts:", err);
    }
  };

  const handleMonobankSync = async () => {
    // Reload accounts after sync
    try {
      const accountsData = await fetchAccounts().catch(() => []);
      setAccounts(accountsData);
      setStats(prev => ({ ...prev, accountsCount: accountsData.length }));
      // Reload integrations after sync
      const integrations = await fetchIntegrations();
      const monoIntegration = integrations.find(
        (integration: UserIntegration) => integration.provider === "monobank"
      );
      setMonobankIntegration(monoIntegration || null);
    } catch (err) {
      console.error("Failed to reload after sync:", err);
    }
  };

  const formatAmount = (amount: number, currency: string = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const chartData = useMemo(() => {
    if (!transactions?.length) return [];
    const now = new Date();
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(now.getMonth() - 3);

    const expensesByMonth = transactions
      .filter((t) => {
        const date = new Date(t.occurredAt);
        return (
          t.direction === "expense" && date >= threeMonthsAgo && date <= now
        );
      })
      .reduce(
        (acc: Record<string, number>, t: Transaction) => {
          const date = new Date(t.occurredAt);
          const monthKey = date.toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          });
          if (!acc[monthKey]) acc[monthKey] = 0;
          acc[monthKey] += parseFloat(t.amount);
          return acc;
        },
        {} as Record<string, number>
      );

    const months = [];
    for (let i = 2; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = date.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
      months.push({
        month: monthKey,
        amount: expensesByMonth[monthKey] ?? 0,
      });
    }
    return months;
  }, [transactions]);

  const dailyChartData = useMemo(() => {
    if (!transactions?.length) return [];
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0
    );

    const expensesByDay = transactions
      .filter((t) => {
        const date = new Date(t.occurredAt);
        return (
          t.direction === "expense" &&
          date >= currentMonthStart &&
          date <= currentMonthEnd
        );
      })
      .reduce(
        (acc: Record<string, number>, t: Transaction) => {
          const date = new Date(t.occurredAt);
          const dayKey = date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });
          if (!acc[dayKey]) acc[dayKey] = 0;
          acc[dayKey] += parseFloat(t.amount);
          return acc;
        },
        {} as Record<string, number>
      );

    const days = [];
    const daysInMonth = currentMonthEnd.getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(now.getFullYear(), now.getMonth(), day);
      const dayKey = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      days.push({
        day: dayKey,
        amount: expensesByDay[dayKey] ?? 0,
      });
    }
    return days;
  }, [transactions]);

  const cards = [
    { title: "Accounts", value: stats.accountsCount },
    { title: "Monthly Income", value: formatAmount(stats.totalMonthlyIncome) },
    {
      title: "Monthly Expenses",
      value: formatAmount(stats.totalMonthlyExpenses),
    },
    { title: "Total Debts", value: formatAmount(stats.totalDebts) },
    {
      title: "Total Installments",
      value: formatAmount(stats.totalInstallments),
    },
  ];

  const hasChart = chartData.length > 0 || dailyChartData.length > 0;

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 px-2 sm:px-0">
      <div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary-background">
          Welcome back, {user?.userName ?? user?.email}
        </h1>
        <p className="mt-1 text-sm sm:text-base text-primary-background/70">
          Here you can see your financial overview
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-primary-background/60">Loading...</div>
        </div>
      ) : accounts.length === 0 ? (
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/30 shadow-lg p-8 sm:p-12">
          <div className="text-center max-w-md mx-auto">
            <h2 className="text-xl sm:text-2xl font-bold text-primary-background mb-3">
              No accounts yet
            </h2>
            <p className="text-sm sm:text-base text-primary-background/70 mb-6">
              To start tracking your transactions, you need to create an account first.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {!monobankIntegration && (
                <Button
                  variant="glass-primary"
                  size="lg"
                  onClick={() => setIsModalOpen(true)}
                  className="px-6"
                >
                  Sync Monobank
                </Button>
              )}
              <Button
                variant="glass-primary"
                size="lg"
                onClick={() => setShowForm(true)}
                className="px-6"
              >
                Add Account
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {cards.map((card) => (
              <div
                key={card.title}
                className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/30 shadow-lg p-6"
              >
                <p className="text-sm font-medium text-primary-background/70 mb-1">
                  {card.title}
                </p>
                <p className="text-2xl font-bold text-primary-background">
                  {card.value}
                </p>
              </div>
            ))}
          </div>

          {hasChart && (
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/30 shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-primary-background">
                  Spending
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setChartPeriod("1month")}
                    className={clsx(
                      "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                      chartPeriod === "1month"
                        ? "bg-white/20 text-primary-background"
                        : "text-primary-background/70 hover:bg-white/10"
                    )}
                  >
                    1 Month
                  </button>
                  <button
                    onClick={() => setChartPeriod("3month")}
                    className={clsx(
                      "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                      chartPeriod === "3month"
                        ? "bg-white/20 text-primary-background"
                        : "text-primary-background/70 hover:bg-white/10"
                    )}
                  >
                    3 Months
                  </button>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart
                  data={
                    chartPeriod === "1month" ? dailyChartData : chartData
                  }
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255, 255, 255, 0.1)"
                  />
                  <XAxis
                    dataKey={chartPeriod === "1month" ? "day" : "month"}
                    stroke="rgba(255, 255, 255, 1)"
                    style={{ fontSize: "12px" }}
                    angle={chartPeriod === "1month" ? -45 : 0}
                    textAnchor={chartPeriod === "1month" ? "end" : "middle"}
                    height={chartPeriod === "1month" ? 60 : undefined}
                  />
                  <YAxis
                    stroke="rgba(255, 255, 255, 1)"
                    style={{ fontSize: "12px" }}
                    tickFormatter={(value) => `${value}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      borderRadius: "8px",
                      color: "#1F2937",
                    }}
                    formatter={(value: number) => formatAmount(value)}
                  />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={{ fill: "#ef4444", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}

      {/* Monobank Sync Modal */}
      <MonobankSyncModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          handleMonobankSync();
        }} 
      />

      {/* Account Form Modal */}
      <AccountForm
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
        }}
        onSubmit={handleCreateAccount}
        isEditing={false}
        userId={user?.id ?? ""}
      />
    </div>
  );
}
