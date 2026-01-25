import React, { useEffect, useState, useMemo, useCallback } from "react";
import { TransactionForm } from "@/features/transactions";
import { Button, useToast, ListboxFloating } from "@/shared/ui";
import { ConfirmationModal } from "@/shared/ui/ConfirmationModal";
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  TrashIcon,
  TagIcon,
  CreditCardIcon,
  BanknotesIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import {
  fetchTransactions,
  fetchMonthlyExpenses,
  deleteTransaction,
  Transaction,
} from "@/features/transactions/api";
import { fetchAccounts, Account } from "@/features/accounts/api";

export function TransactionsPage() {
  const { addToast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>("all");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    description: string;
  } | null>(null);

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      const data = await fetchAccounts();
      setAccounts(data);
    } catch (err) {
      console.error("Failed to load accounts:", err);
    }
  };

  const loadTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      let data: Transaction[];
      if (selectedAccountId === "all") {
        data = await fetchTransactions();
      } else {
        data = await fetchMonthlyExpenses(selectedAccountId);
      }
      setTransactions(data);
    } catch (err) {
      setError("Failed to load transactions");
      console.warn(err);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  }, [selectedAccountId]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const handleAddTransaction = () => {
    setShowForm(true);
  };

  const refreshTransactions = async () => {
    await loadTransactions();
  };

  const handleDeleteTransaction = (transaction: Transaction) => {
    const description = getTransactionDescription(transaction);
    setDeleteTarget({ id: transaction.id, description });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      await deleteTransaction(deleteTarget.id);
      addToast(
        "success",
        "Transaction deleted",
        "Transaction removed successfully."
      );
      await loadTransactions();
    } catch (err) {
      console.error("Failed to delete transaction:", err);
      addToast("error", "Delete failed", "Please try again.");
    } finally {
      setShowDeleteModal(false);
      setDeleteTarget(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDeleteTarget(null);
  };

  const formatDateShort = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  const formatAmount = (amount: string, direction: string) => {
    const formatted = parseFloat(amount).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return direction === "income" ? `+$${formatted}` : `-$${formatted}`;
  };

  const getTransactionType = (type: string) => {
    switch (type) {
      case "category_based":
        return "Category";
      case "installment_payment":
        return "Installment";
      case "debt_payment":
        return "Debt Payment";
      case "transfer":
        return "Transfer";
      case "income_regular":
        return "Regular Income";
      case "income_event":
        return "Event Income";
      default:
        return type;
    }
  };

  const getTransactionDescription = (transaction: Transaction) => {
    const typeLabel = getTransactionType(transaction.type);
    const amount = formatAmount(transaction.amount, transaction.direction);
    return `${typeLabel} - ${amount}`;
  };

  const getRelatedEntityInfo = (transaction: Transaction) => {
    if (transaction.category) {
      return {
        type: "category",
        label: transaction.category.name,
        icon: TagIcon,
      };
    }
    if (transaction.installment) {
      return {
        type: "installment",
        label: transaction.installment.description,
        icon: CreditCardIcon,
      };
    }
    if (transaction.debt) {
      return {
        type: "debt",
        label: transaction.debt.description,
        icon: BanknotesIcon,
      };
    }
    return null;
  };

  const accountOptions = useMemo(() => {
    const options = [{ value: "all", label: "All Accounts" }];
    accounts.forEach((account) => {
      options.push({
        value: account.id,
        label: `${account.name} (${account.assetCode})`,
      });
    });
    return options;
  }, [accounts]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-black/70">Loading transactions...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-300">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 px-2 sm:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
        <div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-light">Record and manage your financial transactions</h2>
        </div>

        <div className="w-full sm:w-auto">
          <Button variant="glass-primary" onClick={handleAddTransaction} className="w-full sm:w-auto">
            Add Transaction
          </Button>
        </div>
      </div>

      {/* Account Filter */}
      <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 shadow-lg p-2 sm:p-3">
        <label className="block text-xs text-primary-background/60 mb-1.5 font-medium">
          Filter by Account
        </label>
        <div className="w-fit">
          <ListboxFloating
            value={selectedAccountId}
            onChange={(v) => setSelectedAccountId(v)}
            options={accountOptions}
            placement="bottom-start"
            variant="glass"
            renderButton={() => {
              const label = accountOptions.find((a) => a.value === selectedAccountId)?.label || "All Accounts";
              return (
                <div className="w-full min-w-[12rem] px-3 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-sm text-left text-primary-background cursor-pointer hover:bg-white/30 transition-colors">
                  {label}
                </div>
              );
            }}
            optionsClassName="border border-white/30 shadow-2xl ring-1 ring-white/15"
            optionClassName="text-primary-background hover:!bg-white/40"
          />
        </div>
      </div>

      {/* Transactions Table / Cards */}
      <div className="bg-white/5 backdrop-blur-md rounded-xl sm:rounded-2xl border border-white/10 shadow-lg overflow-hidden">
        {transactions.length === 0 ? (
          <div className="min-h-[300px] flex items-center justify-center p-4 sm:p-8">
            <div className="text-center max-w-md mx-auto">
              <h3 className="text-lg sm:text-xl font-semibold text-primary-background mb-2 sm:mb-3">
                No transactions yet
              </h3>
              <p className="text-xs sm:text-sm text-disable leading-relaxed">
                Your transaction history will appear here. Use the "Add
                Transaction" button to record new transactions.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-white/10">
                <thead className="bg-white/3 backdrop-blur-sm">
                  <tr>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-primary-background/50 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-primary-background/50 uppercase tracking-wider">
                      Category / Related
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-right text-xs font-medium text-primary-background/50 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-primary-background/50 uppercase tracking-wider">
                      Account
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-primary-background/50 uppercase tracking-wider">
                      Note
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-center text-xs font-medium text-primary-background/50 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-transparent divide-y divide-white/10">
                  {transactions.map((transaction) => {
                    const relatedInfo = getRelatedEntityInfo(transaction);
                    const RelatedIcon = relatedInfo?.icon || DocumentTextIcon;

                    return (
                      <tr
                        key={transaction.id}
                        className="hover:bg-white/5 transition-colors"
                      >
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-primary-background/80 font-medium">
                            {formatDateShort(transaction.occurredAt)}
                          </div>
                          <div className="text-xs text-primary-background/50">
                            {new Date(transaction.occurredAt).toLocaleTimeString(
                              "en-US",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </div>
                          <div className="text-xs text-primary-background/40 mt-0.5">
                            {new Date(transaction.occurredAt).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }
                            )}
                          </div>
                        </td>
                        <td className="px-4 lg:px-6 py-4">
                          {relatedInfo ? (
                            <div className="flex items-center space-x-2">
                              <RelatedIcon className="h-4 w-4 text-primary-background/50 flex-shrink-0" />
                              <span className="text-sm text-primary-background/80 truncate max-w-xs">
                                {relatedInfo.label}
                              </span>
                            </div>
                          ) : transaction.type === "transfer" ? (
                            <span className="text-sm text-primary-background/60 italic">Transfer</span>
                          ) : (
                            <span className="text-sm text-primary-background/40 italic">—</span>
                          )}
                        </td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-right">
                          <div
                            className={`text-sm font-semibold ${
                              transaction.direction === "income"
                                ? "text-green-400"
                                : "text-red-400"
                            }`}
                          >
                            {formatAmount(
                              transaction.amount,
                              transaction.direction
                            )}
                          </div>
                        </td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                          {transaction.account ? (
                            <div className="flex items-center space-x-2">
                              <CreditCardIcon className="h-4 w-4 text-primary-background/40" />
                              <div>
                                <div className="text-sm text-primary-background/80">
                                  {transaction.account.name}
                                </div>
                                <div className="text-xs text-primary-background/50">
                                  {transaction.account.assetCode}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <span className="text-sm text-primary-background/50">—</span>
                          )}
                        </td>
                        <td className="px-4 lg:px-6 py-4 text-sm text-primary-background/80 max-w-xs">
                          {transaction.note ? (
                            <div className="truncate" title={transaction.note}>
                              {transaction.note}
                            </div>
                          ) : (
                            <span className="text-primary-background/50">—</span>
                          )}
                        </td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                          <button
                            onClick={() => handleDeleteTransaction(transaction)}
                            className="text-primary-background/50 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition-all duration-200"
                            title="Delete transaction"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-white/10">
              {transactions.map((transaction) => {
                const relatedInfo = getRelatedEntityInfo(transaction);
                const RelatedIcon = relatedInfo?.icon || DocumentTextIcon;

                return (
                  <div
                    key={transaction.id}
                    className="p-4 hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full flex items-center justify-center bg-white/10">
                            {transaction.direction === "income" ? (
                              <ArrowTrendingUpIcon className="h-5 w-5 text-primary-background/60" />
                            ) : (
                              <ArrowTrendingDownIcon className="h-5 w-5 text-primary-background/60" />
                            )}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-sm font-medium text-primary-background/80">
                              {getTransactionType(transaction.type)}
                            </span>
                            <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-white/10 text-primary-background/70">
                              {transaction.direction === "income" ? "Income" : "Expense"}
                            </span>
                          </div>
                          <div className="text-xs text-primary-background/50">
                            {formatDateShort(transaction.occurredAt)} • {new Date(transaction.occurredAt).toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteTransaction(transaction)}
                          className="text-primary-background/50 hover:text-primary-background/70 p-1.5 rounded-lg hover:bg-white/10 transition-all duration-200 flex-shrink-0"
                          title="Delete transaction"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-primary-background/60">Amount</span>
                        <span className="text-base font-semibold text-primary-background/80">
                          {formatAmount(transaction.amount, transaction.direction)}
                        </span>
                      </div>
                      
                      {relatedInfo && (
                        <div className="flex items-center space-x-2">
                          <RelatedIcon className="h-3.5 w-3.5 text-primary-background/40 flex-shrink-0" />
                          <span className="text-xs text-primary-background/70 truncate">
                            {relatedInfo.label}
                          </span>
                        </div>
                      )}
                      
                      {transaction.account && (
                        <div className="flex items-center space-x-2">
                          <CreditCardIcon className="h-3.5 w-3.5 text-primary-background/40 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="text-xs text-primary-background/70 truncate">
                              {transaction.account.name}
                            </div>
                            <div className="text-xs text-primary-background/50">
                              {transaction.account.assetCode}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {transaction.note && (
                        <div className="pt-1 border-t border-white/10">
                          <div className="text-xs text-primary-background/60 mb-0.5">Note</div>
                          <div className="text-xs text-primary-background/70">{transaction.note}</div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      <TransactionForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={refreshTransactions}
      />

      {showDeleteModal && deleteTarget && (
        <ConfirmationModal
          title={`Are you sure you want to delete "${deleteTarget.description}"?`}
          action={confirmDelete}
          cancel={cancelDelete}
        />
      )}
    </div>
  );
}
