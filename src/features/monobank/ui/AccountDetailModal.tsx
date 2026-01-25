import React, { useState } from "react";
import { Dialog } from "@headlessui/react";
import { XMarkIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import { MonobankAccount } from "../api";
import { fetchAccountStatement, MonoTransaction } from "../api";
import { Button } from "@/shared/ui/Button";
import {
  createAccount,
  AccountType,
  AccountAssetType,
  AccountProvider,
} from "@/features/accounts/api";
import { useAuth } from "@/app/providers/AuthProvider";
import { useToast } from "@/shared/ui";

interface AccountDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBack?: () => void;
  account: MonobankAccount | null;
}

const CURRENCY_SYMBOLS: Record<number, string> = {
  980: "₴", // UAH
  840: "$", // USD
  978: "€", // EUR
};

const CURRENCY_NAMES: Record<number, string> = {
  980: "UAH",
  840: "USD",
  978: "EUR",
};

// Маппинг currencyCode в assetCode
const CURRENCY_TO_ASSET_CODE: Record<number, string> = {
  980: "UAH",
  840: "USD",
  978: "EUR",
};

const formatAmount = (amount: number, currencyCode: number): string => {
  const symbol = CURRENCY_SYMBOLS[currencyCode] || "";
  const formatted = Math.abs(amount / 100).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${symbol}${formatted}`;
};

export function AccountDetailModal({
  isOpen,
  onClose,
  onBack,
  account,
}: AccountDetailModalProps) {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [isLoadingStatement, setIsLoadingStatement] = useState(false);
  const [statement, setStatement] = useState<MonoTransaction[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const handleGetStatement = async () => {
    if (!account) return;

    try {
      setIsLoadingStatement(true);
      setError(null);
      // Получаем выписку за последний месяц
      const to = Math.floor(Date.now() / 1000);
      const from = to - 30 * 24 * 60 * 60; // 30 дней назад
      const transactions = await fetchAccountStatement(account.id, from, to);
      setStatement(transactions);
    } catch (err: any) {
      console.error("Failed to fetch statement", err);
      setError(err.response?.data?.message || "Failed to fetch statement");
    } finally {
      setIsLoadingStatement(false);
    }
  };

  const handleClose = () => {
    setStatement(null);
    setError(null);
    setShowAddForm(false);
    setFormData({ name: "", description: "" });
    onClose();
  };

  const handleAddAccount = async () => {
    if (!account || !user?.id) {
      addToast("error", "Error", "User not found");
      return;
    }

    if (!formData.name.trim()) {
      addToast("error", "Validation Error", "Name is required");
      return;
    }

    try {
      setIsAdding(true);
      const assetCode = CURRENCY_TO_ASSET_CODE[account.currencyCode] || "UAH";

      await createAccount({
        name: formData.name,
        description: formData.description || undefined,
        type: AccountType.CARD,
        assetType: AccountAssetType.FIAT,
        assetCode,
        provider: AccountProvider.MONOBANK,
        externalId: account.id,
      });

      addToast(
        "success",
        "Account Added",
        "Successfully added Monobank account"
      );
      setShowAddForm(false);
      setFormData({ name: "", description: "" });
    } catch (err: any) {
      console.error("Failed to add account:", err);
      addToast(
        "error",
        "Failed to Add Account",
        err.response?.data?.message || "Please try again"
      );
    } finally {
      setIsAdding(false);
    }
  };

  if (!account) return null;

  const currencyName =
    CURRENCY_NAMES[account.currencyCode] || `Code ${account.currencyCode}`;

  return (
    <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-xl" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/30 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/20">
            <div className="flex items-center gap-3">
              {onBack && (
                <button
                  onClick={onBack}
                  className="p-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-200 group cursor-pointer"
                >
                  <ArrowLeftIcon className="h-5 w-5 text-primary-background/70 group-hover:text-primary-background transition-colors" />
                </button>
              )}
              <Dialog.Title className="text-xl font-bold text-primary-background tracking-tight">
                Account Details
              </Dialog.Title>
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-200 group cursor-pointer"
            >
              <XMarkIcon className="h-5 w-5 text-primary-background/70 group-hover:text-primary-background transition-colors" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Account Info */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-primary-background/70 uppercase tracking-wide mb-1">
                    Currency
                  </div>
                  <div className="text-xl font-semibold text-primary-background">
                    {currencyName}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-primary-background/70 uppercase tracking-wide mb-1">
                    Balance
                  </div>
                  <div className="text-2xl font-bold text-primary-background">
                    {formatAmount(account.balance, account.currencyCode)}
                  </div>
                </div>
              </div>

              {account.creditLimit > 0 && (
                <div className="pt-4 border-t border-white/10">
                  <div className="text-sm text-primary-background/70 uppercase tracking-wide mb-1">
                    Credit Limit
                  </div>
                  <div className="text-lg font-semibold text-primary-background">
                    {formatAmount(account.creditLimit, account.currencyCode)}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-white/10">
                <div className="text-sm text-primary-background/70 uppercase tracking-wide mb-1">
                  IBAN
                </div>
                <div className="text-sm font-mono text-primary-background/90 break-all">
                  {account.iban}
                </div>
              </div>

              <div className="pt-4 border-t border-white/10">
                <div className="text-sm text-primary-background/70 uppercase tracking-wide mb-1">
                  Account ID
                </div>
                <div className="text-sm font-mono text-primary-background/90 break-all">
                  {account.id}
                </div>
              </div>
            </div>

            {/* Add Account Section */}
            {!showAddForm ? (
              <div className="space-y-4">
                <Button
                  onClick={() => setShowAddForm(true)}
                  variant="glass-primary"
                  className="w-full"
                >
                  Add Account
                </Button>
              </div>
            ) : (
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 space-y-4">
                <h3 className="text-lg font-semibold text-primary-background mb-4">
                  Add Account to FinFix Accounts
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-primary-background/90 mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="Enter account name"
                      className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-primary-background placeholder:text-primary-background/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary-background/90 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      placeholder="Enter account description (optional)"
                      rows={3}
                      className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-primary-background placeholder:text-primary-background/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-all resize-none"
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={handleAddAccount}
                      disabled={isAdding || !formData.name.trim()}
                      variant="glass-primary"
                      className="flex-1"
                    >
                      {isAdding ? "Adding..." : "Add Account"}
                    </Button>
                    <Button
                      onClick={() => {
                        setShowAddForm(false);
                        setFormData({ name: "", description: "" });
                      }}
                      variant="secondary"
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Statement Section */}
            {!statement ? (
              <div className="space-y-4">
                <Button
                  onClick={handleGetStatement}
                  disabled={isLoadingStatement}
                  className="w-full"
                  variant="glass-primary"
                >
                  {isLoadingStatement ? "Loading..." : "Get Statement"}
                </Button>
                {error && (
                  <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                    {error}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-primary-background">
                    Statement
                  </h3>
                  <Button
                    onClick={handleGetStatement}
                    disabled={isLoadingStatement}
                    variant="secondary"
                    size="sm"
                  >
                    Refresh
                  </Button>
                </div>

                {statement.length === 0 ? (
                  <div className="text-center py-8 text-primary-background/70">
                    No transactions found
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {statement.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-sm font-semibold text-primary-background">
                            {transaction.description}
                          </div>
                          <div
                            className={`text-sm font-bold ${
                              transaction.amount >= 0
                                ? "text-green-400"
                                : "text-red-400"
                            }`}
                          >
                            {formatAmount(
                              transaction.amount,
                              transaction.currencyCode
                            )}
                          </div>
                        </div>
                        <div className="text-xs text-primary-background/60">
                          {new Date(transaction.time * 1000).toLocaleString()}
                        </div>
                        {transaction.comment && (
                          <div className="text-xs text-primary-background/70 mt-1">
                            {transaction.comment}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
