import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchAccountById, Account, AccountProvider } from "@/features/accounts/api";
import {
  fetchAccountOverviewStats,
  AccountOverviewStats,
} from "@/features/dashboard";
import { Transaction } from "@/features/transactions/api";
import { StatCard, Card } from "@/shared/ui/pwa";
import { syncMonobankAccount } from "@/features/monobank/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export function PWAAccountStatsPage() {
  const { accountId } = useParams<{ accountId: string }>();
  const navigate = useNavigate();
  const [account, setAccount] = useState<Account | null>(null);
  const [stats, setStats] = useState<AccountOverviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingStatement, setIsLoadingStatement] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!accountId) {
        setError("Account ID is required");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const [accountData, statsData] = await Promise.all([
          fetchAccountById(accountId).catch(() => null),
          fetchAccountOverviewStats(accountId).catch(() => null),
        ]);
        if (!accountData) {
          setError("Account not found");
          return;
        }
        setAccount(accountData);
        setStats(statsData);
      } catch (err) {
        console.error("Failed to load account data:", err);
        setError("Failed to load account data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [accountId]);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const totalExpenses =
    stats?.monthlyExpenses?.reduce(
      (sum, expense) => sum + parseFloat(expense.amount),
      0
    ) || 0;

  const handleGetStatement = async () => {
    if (!account || !account.id) {
      return;
    }

    try {
      setIsLoadingStatement(true);
      // Получаем выписку за последний месяц
      const to = Math.floor(Date.now() / 1000);
      const from = to - 30 * 24 * 60 * 60; // 30 дней назад

      await syncMonobankAccount(
        account.id,
        from.toString(),
        to.toString()
      );
      
      // Перезагружаем данные после синхронизации
      const [accountData, statsData] = await Promise.all([
        fetchAccountById(account.id).catch(() => null),
        fetchAccountOverviewStats(account.id).catch(() => null),
      ]);
      if (accountData) {
        setAccount(accountData);
      }
      if (statsData) {
        setStats(statsData);
      }
    } catch (err: unknown) {
      console.error("Failed to sync statement", err);
    } finally {
      setIsLoadingStatement(false);
    }
  };

  const chartData = useMemo(() => {
    if (!stats?.monthlyTransactions || stats.monthlyTransactions.length === 0) {
      return [];
    }

    const transactionsByDate = stats.monthlyTransactions
      .filter((t: Transaction) => t.direction === "expense")
      .reduce((acc: Record<string, number>, transaction: Transaction) => {
        const date = new Date(transaction.occurredAt).toLocaleDateString(
          "en-US",
          {
            month: "short",
            day: "numeric",
          }
        );
        if (!acc[date]) {
          acc[date] = 0;
        }
        acc[date] += parseFloat(transaction.amount);
        return acc;
      }, {} as Record<string, number>);

    return Object.entries(transactionsByDate)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [stats?.monthlyTransactions]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-primary-background/60">
          Loading account statistics...
        </div>
      </div>
    );
  }

  if (error || !account) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => navigate("/analytics")}
          className="text-primary-background/70 hover:text-primary-background text-sm font-medium transition-colors"
        >
          ← Back to dashboard
        </button>
        <Card className="p-6 border-red-500/20 bg-red-500/10">
          <div className="text-sm font-medium text-red-500">
            {error || "Account not found"}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <button
          onClick={() => navigate("/analytics")}
          className="text-primary-background/70 hover:text-primary-background text-sm font-medium mb-4 transition-colors"
        >
          ← Back to dashboard
        </button>
        <div>
          <h1 className="text-3xl font-bold text-primary-background mb-2">
            {account.name}
          </h1>
          {account.description && (
            <p className="text-primary-background/60">{account.description}</p>
          )}
        </div>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-bold text-primary-background mb-6">
          Account Details
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2 border-b border-white/10">
            <span className="text-sm text-primary-background/60">Type</span>
            <span className="text-sm font-medium text-primary-background capitalize">
              {account.type}
            </span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-white/10">
            <span className="text-sm text-primary-background/60">
              Asset Code
            </span>
            <span className="text-sm font-medium text-primary-background">
              {account.assetCode}
            </span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-white/10">
            <span className="text-sm text-primary-background/60">Provider</span>
            <span className="text-sm font-medium text-primary-background capitalize">
              {account.provider}
            </span>
          </div>
          {account.provider === AccountProvider.MONOBANK && (
            <div className="pt-4 border-t border-white/10">
              <button
                onClick={handleGetStatement}
                disabled={isLoadingStatement}
                className="w-full px-4 py-3 bg-white/15 backdrop-blur-sm border border-white/30 rounded-xl text-primary-background font-medium hover:bg-white/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isLoadingStatement ? "Loading..." : "Get statement"}
              </button>
            </div>
          )}
        </div>
      </Card>

      {stats && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              label="Monthly Balance"
              value={formatAmount(stats.balance)}
              variant={stats.balance >= 0 ? "positive" : "negative"}
            />
            <StatCard
              label="Monthly Expenses"
              value={formatAmount(totalExpenses)}
              variant="negative"
            />
            <StatCard
              label="Monthly Incomes"
              value={formatAmount(stats.monthlyIncomes)}
              variant="default"
            />
          </div>

          {chartData.length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-bold text-primary-background mb-6">
                Spending Trend
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255, 255, 255, 0.1)"
                  />
                  <XAxis
                    dataKey="date"
                    stroke="rgba(255, 255, 255, 0.6)"
                    style={{ fontSize: "12px" }}
                  />
                  <YAxis
                    stroke="rgba(255, 255, 255, 0.6)"
                    style={{ fontSize: "12px" }}
                    tickFormatter={(value) => `$${value}`}
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

          <Card className="p-6">
            <h2 className="text-xl font-bold text-primary-background mb-6">
              Recent Transactions
            </h2>
            <div className="space-y-3">
              {stats.monthlyExpenses && stats.monthlyExpenses.length > 0 ? (
                stats.monthlyExpenses.slice(0, 5).map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between py-2 border-b border-white/10 last:border-b-0"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-primary-background">
                        {transaction.category?.name ||
                          transaction.note ||
                          "Transaction"}
                      </p>
                      <p className="text-xs text-primary-background/60">
                        {new Date(transaction.occurredAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`text-sm font-bold ${
                        transaction.direction === "income"
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      {transaction.direction === "income" ? "+" : "-"}
                      {formatAmount(parseFloat(transaction.amount))}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-primary-background/60">
                  No transactions this month
                </p>
              )}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
