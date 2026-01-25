import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { fetchAccounts, Account, AccountProvider } from "@/features/accounts/api";
import { MonobankSyncModal } from "@/features/monobank";
import { AccountCard, Card } from "@/shared/ui/pwa";
import { clsx } from "clsx";

export function PWAAccountsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === "/analytics") {
      return location.pathname === "/analytics" || location.pathname === "/analytics/";
    }
    return location.pathname.startsWith(path);
  };

  const hasMonobankAccount = useMemo(() => {
    return accounts.some((account) => account.provider === AccountProvider.MONOBANK);
  }, [accounts]);

  useEffect(() => {
    const loadAccounts = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchAccounts();
        setAccounts(data);
      } catch (err: unknown) {
        console.error("Failed to load accounts:", err);
        if (
          err &&
          typeof err === "object" &&
          "response" in err &&
          err.response &&
          typeof err.response === "object" &&
          "status" in err.response &&
          err.response.status === 404
        ) {
          setAccounts([]);
        } else {
          setError("Failed to load accounts");
        }
      } finally {
        setLoading(false);
      }
    };

    loadAccounts();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-primary-background/60">Loading accounts...</div>
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary-background mb-2">Accounts</h1>
          <p className="text-primary-background/60">Your financial accounts</p>
        </div>
        {!hasMonobankAccount && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-white/15 backdrop-blur-sm border border-white/30 rounded-xl text-primary-background font-medium hover:bg-white/20 transition-all duration-200"
          >
            Sync Monobank
          </button>
        )}
      </div>

      {accounts.length === 0 ? (
        <Card className="p-12 text-center">
          <h3 className="text-xl font-bold text-primary-background mb-2">
            No accounts yet
          </h3>
          <p className="text-primary-background/60">
            Your account information will appear here once you add some accounts.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map((account) => (
            <AccountCard key={account.id} account={account} />
          ))}
        </div>
      )}

      <MonobankSyncModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
