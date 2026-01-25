import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/app/providers/AuthProvider";
import { clsx } from "clsx";
import { fetchAccounts, Account } from "@/features/accounts/api";
import { AccountForm } from "@/features/accounts/ui/AccountForm";
import { fetchTransactions, Transaction } from "@/features/transactions/api";
import { Card } from "@/shared/ui/pwa";
import { StatusDot, Button } from "@/shared/ui";
import { MonobankSyncModal } from "@/features/monobank";
import { fetchIntegrations, UserIntegration } from "@/features/monobank/api";
import monoLogo from "@/assets/mono-logo.svg";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export function PWADashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/analytics") {
      return location.pathname === "/analytics" || location.pathname === "/analytics/";
    }
    return location.pathname.startsWith(path);
  };
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartPeriod, setChartPeriod] = useState<"1month" | "3month">("3month");
  const [showForm, setShowForm] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [monobankIntegration, setMonobankIntegration] =
    useState<UserIntegration | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        // Fetch transactions for all accounts to display chart
        const accountsData = await fetchAccounts().catch(() => []);
        setAccounts(accountsData);
        const allTransactionsPromises = accountsData.map((account) =>
          fetchTransactions(account.id).catch(() => [])
        );
        const transactionsArrays = await Promise.all(allTransactionsPromises);
        const allTransactions = transactionsArrays.flat();
        setTransactions(allTransactions);
      } catch (err: unknown) {
        console.error("Failed to load data:", err);
        if (
          err &&
          typeof err === "object" &&
          "response" in err &&
          err.response &&
          typeof err.response === "object" &&
          "status" in err.response &&
          (err.response as { status: number }).status === 404
        ) {
          setTransactions([]);
        } else {
          setError("Failed to load data");
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    const loadIntegrations = async () => {
      try {
        const integrations = await fetchIntegrations();
        const monoIntegration = integrations.find(
          (integration) => integration.provider === "monobank"
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
      // Reload transactions
      const allTransactionsPromises = accountsData.map((account) =>
        fetchTransactions(account.id).catch(() => [])
      );
      const transactionsArrays = await Promise.all(allTransactionsPromises);
      const allTransactions = transactionsArrays.flat();
      setTransactions(allTransactions);
    } catch (err) {
      console.error("Failed to reload accounts:", err);
    }
  };

  const handleMonobankSync = async () => {
    // Reload accounts after sync
    try {
      const accountsData = await fetchAccounts().catch(() => []);
      setAccounts(accountsData);
      // Reload transactions
      const allTransactionsPromises = accountsData.map((account) =>
        fetchTransactions(account.id).catch(() => [])
      );
      const transactionsArrays = await Promise.all(allTransactionsPromises);
      const allTransactions = transactionsArrays.flat();
      setTransactions(allTransactions);
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

  const chartData = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return [];
    }

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
      .reduce((acc: Record<string, number>, transaction: Transaction) => {
        const date = new Date(transaction.occurredAt);
        const monthKey = date.toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        });
        if (!acc[monthKey]) {
          acc[monthKey] = 0;
        }
        acc[monthKey] += parseFloat(transaction.amount);
        return acc;
      }, {} as Record<string, number>);

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
        amount: expensesByMonth[monthKey] || 0,
      });
    }

    return months;
  }, [transactions]);

  const dailyChartData = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return [];
    }

    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const expensesByDay = transactions
      .filter((t) => {
        const date = new Date(t.occurredAt);
        return (
          t.direction === "expense" &&
          date >= currentMonthStart &&
          date <= currentMonthEnd
        );
      })
      .reduce((acc: Record<string, number>, transaction: Transaction) => {
        const date = new Date(transaction.occurredAt);
        const dayKey = date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
        if (!acc[dayKey]) {
          acc[dayKey] = 0;
        }
        acc[dayKey] += parseFloat(transaction.amount);
        return acc;
      }, {} as Record<string, number>);

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
        amount: expensesByDay[dayKey] || 0,
      });
    }

    return days;
  }, [transactions]);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-primary-background/60">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6 border-red-500/20 bg-red-500/10">
        <div className="text-sm font-medium text-red-500">{error}</div>
      </Card>
    );
  }

  if (accounts.length === 0 && !loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center space-x-2 mb-6">
          <button
            onClick={() => navigate("/analytics")}
            className={clsx(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all",
              isActive("/analytics")
                ? "bg-white/20 text-primary-background"
                : "text-primary-background/70 hover:bg-white/10"
            )}
          >
            Dashboard
          </button>
        </div>
        <Card className="p-8 sm:p-12">
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
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-2 mb-6">
        <button
          onClick={() => navigate("/analytics")}
          className={clsx(
            "px-4 py-2 rounded-lg text-sm font-medium transition-all",
            isActive("/analytics")
              ? "bg-white/20 text-primary-background"
              : "text-primary-background/70 hover:bg-white/10"
          )}
        >
          Dashboard
        </button>
      </div>
      <div>
        <div className="">
          <div>
            <h1 className="text-3xl font-bold text-primary-background mb-2">
              Welcome back{user?.userName ? `, ${user.userName}` : ""}
            </h1>
            <p className="text-primary-background/60">
              Track your spending and financial overview
            </p>
          </div>
          <div className="flex items-center justify-baseline gap-2">
            <div className="mb-1 font-semibold text-gray-700">
              Integrations:
            </div>
            <img src={monoLogo} alt="Monobank" className="h-20 w-50" />
            <StatusDot
              variant={
                monobankIntegration?.status === "active"
                  ? "success"
                  : monobankIntegration
                  ? "warning"
                  : "neutral"
              }
            />
          </div>
        </div>
      </div>

      {(chartData.length > 0 || dailyChartData.length > 0) && (
        <Card className="p-6">
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
              data={chartPeriod === "1month" ? dailyChartData : chartData}
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
        </Card>
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
