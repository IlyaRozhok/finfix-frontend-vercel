import React, { useState } from "react";
import { Dialog } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { MonobankAccount } from "../api";
import { AccountDetailModal } from "./AccountDetailModal";

interface AccountsListModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: MonobankAccount[];
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

const formatAmount = (amount: number, currencyCode: number): string => {
  const symbol = CURRENCY_SYMBOLS[currencyCode] || "";
  const formatted = Math.abs(amount / 100).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${symbol}${formatted}`;
};

export function AccountsListModal({
  isOpen,
  onClose,
  accounts,
}: AccountsListModalProps) {
  const [selectedAccount, setSelectedAccount] =
    useState<MonobankAccount | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const handleAccountClick = (account: MonobankAccount) => {
    setSelectedAccount(account);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailModalOpen(false);
    setSelectedAccount(null);
  };

  const handleBackFromDetail = () => {
    setIsDetailModalOpen(false);
    setSelectedAccount(null);
  };

  // Сортируем аккаунты: сначала по валюте (UAH, USD, EUR), потом по балансу
  const sortedAccounts = [...accounts].sort((a, b) => {
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

    // Если валюта одинаковая, сортируем по балансу (больший баланс выше)
    return b.balance - a.balance;
  });

  return (
    <>
      <Dialog open={isOpen} onClose={onClose} className="relative z-50">
        <div className="fixed inset-0 bg-black/30 backdrop-blur-xl" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/30 shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/20">
              <Dialog.Title className="text-xl font-bold text-primary-background tracking-tight">
                Monobank Accounts
              </Dialog.Title>
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-200 group cursor-pointer"
              >
                <XMarkIcon className="h-5 w-5 text-primary-background/70 group-hover:text-primary-background transition-colors" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {accounts.length === 0 ? (
                <div className="text-center py-12 text-primary-background/70">
                  No accounts found
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sortedAccounts.map((account) => {
                    const currencyName =
                      CURRENCY_NAMES[account.currencyCode] ||
                      `Code ${account.currencyCode}`;
                    return (
                      <button
                        key={account.id}
                        onClick={() => handleAccountClick(account)}
                        className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-200 text-left cursor-pointer group"
                      >
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-sm text-primary-background/70 uppercase tracking-wide mb-1">
                                {currencyName}
                              </div>
                              <div className="text-2xl font-bold text-primary-background group-hover:text-primary-background transition-colors">
                                {formatAmount(account.balance, account.currencyCode)}
                              </div>
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="text-xs text-primary-background/60">
                                Click for details →
                              </div>
                            </div>
                          </div>

                          {account.creditLimit > 0 && (
                            <div className="pt-3 border-t border-white/10">
                              <div className="text-xs text-primary-background/60 mb-1">
                                Credit Limit
                              </div>
                              <div className="text-sm font-semibold text-primary-background/90">
                                {formatAmount(
                                  account.creditLimit,
                                  account.currencyCode
                                )}
                              </div>
                            </div>
                          )}

                          <div className="pt-3 border-t border-white/10">
                            <div className="text-xs text-primary-background/60 mb-1">
                              IBAN
                            </div>
                            <div className="text-xs font-mono text-primary-background/70 truncate">
                              {account.iban}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Detail Modal */}
      <AccountDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetail}
        onBack={handleBackFromDetail}
        account={selectedAccount}
      />
    </>
  );
}
