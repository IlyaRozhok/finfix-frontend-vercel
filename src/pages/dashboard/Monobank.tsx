import React, { useEffect, useState, useCallback } from "react";
import {
  fetchIntegrations,
  UserIntegration,
  fetchClientInfo,
  ClientInfo,
  MonoAccount,
} from "@features/monobank";
import { AccountCard } from "@features/monobank";
import { syncMonobankAccount } from "@/features/monobank/api";
import { fetchAccounts } from "@/features/accounts/api";
import { useToast, Button, StatusDot } from "@/shared/ui";

const Monobank = () => {
  const { addToast } = useToast();
  const [clientInfo, setClientInfo] = useState<ClientInfo | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<MonoAccount | null>(null);
  const [isLoadingClient, setIsLoadingClient] = useState(false);
  const [isLoadingIntegration, setIsLoadingIntegration] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncingAccounts, setSyncingAccounts] = useState<Set<string>>(new Set());
  const [monobankIntegration, setMonobankIntegration] = useState<UserIntegration | null>(null);

  const loadIntegration = useCallback(async () => {
    try {
      setIsLoadingIntegration(true);
      const integrations = await fetchIntegrations();
      const monobank = integrations.find((int) => int.provider === "monobank");
      setMonobankIntegration(monobank || null);
    } catch (err) {
      console.error("Failed to fetch integrations", err);
      addToast("error", "Failed to load integration", "Please try again.");
    } finally {
      setIsLoadingIntegration(false);
    }
  }, [addToast]);

  const loadClientInfo = async () => {
    try {
      setIsLoadingClient(true);
      setError(null);
      const info = await fetchClientInfo();
      setClientInfo(info);
      addToast("success", "Accounts loaded", "Successfully fetched Monobank accounts");
    } catch (err: unknown) {
      console.error("Failed to load client info:", err);
      setError("Failed to load client information");
      addToast("error", "Failed to load accounts", "Please try again.");
    } finally {
      setIsLoadingClient(false);
    }
  };

  const handleSyncStatement = async (monoAccount: MonoAccount) => {
    try {
      setSyncingAccounts((prev) => new Set(prev).add(monoAccount.id));
      
      // Находим аккаунт в базе по externalId
      const accounts = await fetchAccounts();
      const account = accounts.find((acc) => acc.externalId === monoAccount.id);
      
      if (!account) {
        addToast(
          "error",
          "Account not found",
          "This Monobank account is not linked to any account in the system"
        );
        return;
      }

      // Получаем выписку за последний месяц
      const to = Math.floor(Date.now() / 1000);
      const from = to - 30 * 24 * 60 * 60; // 30 дней назад

      await syncMonobankAccount(
        account.id,
        from.toString(),
        to.toString()
      );

      addToast(
        "success",
        "Statement synced",
        `Successfully synced statement for ${account.name}`
      );
    } catch (err: unknown) {
      console.error("Failed to sync statement", err);
      addToast(
        "error",
        "Sync failed",
        "Failed to sync statement. Please try again."
      );
    } finally {
      setSyncingAccounts((prev) => {
        const newSet = new Set(prev);
        newSet.delete(monoAccount.id);
        return newSet;
      });
    }
  };

  const handleAccountClick = (account: MonoAccount) => {
    setSelectedAccount(account);
  };

  useEffect(() => {
    loadIntegration();
  }, [loadIntegration]);

  if (isLoadingIntegration) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Monobank</h1>
            <p className="mt-1">Manage your Monobank integration</p>
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg p-6">
          <div className="text-center text-gray-400">
            Loading...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Monobank</h1>
          <p className="mt-1">Manage your Monobank integration</p>
        </div>
      </div>

      {/* Статус интеграции */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-primary-background mb-2">
              Integration Status
            </h2>
            <div className="flex items-center space-x-3">
              <StatusDot variant={monobankIntegration ? "success" : "error"} />
              <span className="text-sm text-primary-background">
                {monobankIntegration ? "Connected" : "Not connected"}
              </span>
            </div>
            {monobankIntegration?.lastSyncedAt && (
              <p className="text-sm text-gray-700 mt-2">
                Last synced: {new Date(monobankIntegration.lastSyncedAt).toLocaleString()}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Кнопка получения счетов или список счетов */}
      {!clientInfo ? (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg p-6">
          <div className="flex flex-col items-center justify-center space-y-4">
            <p className="text-primary-background">
              {monobankIntegration 
                ? "Click the button below to fetch your Monobank accounts"
                : "Please connect Monobank integration first"}
            </p>
            <Button
              variant="glass-primary"
              onClick={loadClientInfo}
              disabled={isLoadingClient || !monobankIntegration}
            >
              {isLoadingClient ? "Loading..." : "Get Accounts"}
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg p-6">
            <h2 className="text-xl font-semibold text-primary-background mb-2">
              {clientInfo.name}
            </h2>
            <p className="text-sm text-gray-900">
              {clientInfo?.accounts?.length} account
              {clientInfo?.accounts?.length !== 1 ? "s" : ""}
            </p>
          </div>

          {clientInfo?.accounts?.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-primary-background mb-4">
                Accounts
              </h3>
              {(() => {
                const sortedAccounts = [...clientInfo.accounts].sort(
                  (a, b) => {
                    const currencyOrder: Record<number, number> = {
                      980: 1, // UAH first
                      840: 2, // USD second
                      978: 3, // EUR third
                    };
                    const aCurrencyOrder = currencyOrder[a.currencyCode] || 999;
                    const bCurrencyOrder = currencyOrder[b.currencyCode] || 999;

                    if (aCurrencyOrder !== bCurrencyOrder) {
                      return aCurrencyOrder - bCurrencyOrder;
                    }

                    const aIsFop = a.type?.toLowerCase().includes("fop");
                    const bIsFop = b.type?.toLowerCase().includes("fop");

                    if (aIsFop && !bIsFop) return -1;
                    if (!aIsFop && bIsFop) return 1;

                    return 0;
                  }
                );

                const accountsByCurrency = sortedAccounts.reduce(
                  (acc, account) => {
                    const currencyName =
                      account.currencyCode === 980
                        ? "UAH"
                        : account.currencyCode === 840
                        ? "USD"
                        : account.currencyCode === 978
                        ? "EUR"
                        : `Code ${account.currencyCode}`;
                    if (!acc[currencyName]) {
                      acc[currencyName] = [];
                    }
                    acc[currencyName].push(account);
                    return acc;
                  },
                  {} as Record<string, MonoAccount[]>
                );

                return (
                  <div className="xl:flex xl:flex-row xl:gap-6">
                    {Object.entries(accountsByCurrency).map(
                      ([currency, accounts]) => (
                        <div key={currency} className="xl:flex-1 xl:min-w-0 mb-6 xl:mb-0">
                          <h4 className="text-md font-medium text-gray-600 mb-3">
                            {currency}
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-1 gap-4">
                            {accounts.map((account) => (
                              <div key={account.id} className="space-y-2">
                                <AccountCard
                                  account={account}
                                  isSelected={selectedAccount?.id === account.id}
                                  onClick={() => handleAccountClick(account)}
                                />
                                <Button
                                  variant="glass-primary"
                                  size="sm"
                                  onClick={() => handleSyncStatement(account)}
                                  disabled={syncingAccounts.has(account.id)}
                                  className="w-full"
                                >
                                  {syncingAccounts.has(account.id)
                                    ? "Syncing..."
                                    : "Get Statement"}
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                );
              })()}
            </div>
          )}
        </>
      )}

      {error && (
        <div className="bg-red-500/10 backdrop-blur-md rounded-2xl border border-red-500/20 shadow-lg p-4">
          <div className="text-sm text-red-400">{error}</div>
        </div>
      )}
    </div>
  );
};

export default Monobank;
