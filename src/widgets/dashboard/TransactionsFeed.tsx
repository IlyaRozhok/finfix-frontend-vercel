import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  PlusIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { Button, useToast } from "@/shared/ui";
import { ConfirmationModal } from "@/shared/ui/ConfirmationModal";
import {
  fetchTransactions,
  deleteTransaction,
  Transaction,
} from "@/features/transactions/api";

interface TransactionsFeedProps {
  onAddTransaction?: () => void;
}

export function TransactionsFeed({ onAddTransaction }: TransactionsFeedProps) {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    description: string;
  } | null>(null);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const data = await fetchTransactions();
      // Take only the latest 5 transactions for the feed
      setTransactions(data.slice(0, 5));
    } catch (err) {
      console.error("Failed to fetch transactions:", err);
      setError("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const formatAmount = (amount: string, direction: string) => {
    const formatted = parseFloat(amount).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return direction === "income" ? `+$${formatted}` : `-$${formatted}`;
  };

  const getTransactionDescription = (transaction: Transaction) => {
    switch (transaction.type) {
      case "category_based":
        return "Category Transaction";
      case "installment_payment":
        return "Installment Payment";
      case "debt_payment":
        return "Debt Payment";
      case "transfer":
        return "Transfer";
      case "income_regular":
        return "Regular Income";
      case "income_event":
        return "Event Income";
      default:
        return "Transaction";
    }
  };

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-primary-background">
            Recent Transactions
          </h3>
          <div className="w-20 h-8 bg-white/10 animate-pulse rounded-xl"></div>
        </div>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 bg-white/5 rounded-xl"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/10 animate-pulse rounded-full"></div>
                <div className="space-y-1">
                  <div className="w-32 h-4 bg-white/10 animate-pulse rounded"></div>
                  <div className="w-20 h-3 bg-white/10 animate-pulse rounded"></div>
                </div>
              </div>
              <div className="w-16 h-4 bg-white/10 animate-pulse rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-primary-background">
            Recent Transactions
          </h3>
          <Button variant="ghost" size="sm" onClick={onAddTransaction}>
            <PlusIcon className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center justify-center h-32">
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-primary-background">
          Recent Transactions
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/dashboard/transactions")}
        >
          <PlusIcon className="h-4 w-4" />
        </Button>
      </div>

      {transactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-32 text-center">
          <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-3">
            <ArrowTrendingUpIcon className="h-6 w-6 text-primary-background/50" />
          </div>
          <p className="text-sm text-primary-background/70 mb-2">
            No transactions yet
          </p>
          <p className="text-xs text-primary-background/50">
            Your recent transactions will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center space-x-3 flex-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    transaction.direction === "income"
                      ? "bg-green-500/20 text-green-400"
                      : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {transaction.direction === "income" ? (
                    <ArrowTrendingUpIcon className="h-4 w-4" />
                  ) : (
                    <ArrowTrendingDownIcon className="h-4 w-4" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-primary-background">
                    {getTransactionDescription(transaction)}
                  </p>
                  <p className="text-xs text-primary-background/60">
                    {formatDate(transaction.occurredAt)}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div
                  className={`text-sm font-semibold ${
                    transaction.direction === "income"
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {formatAmount(transaction.amount, transaction.direction)}
                </div>
                <button
                  onClick={() => handleDeleteTransaction(transaction)}
                  className="p-1 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200"
                  title="Delete transaction"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

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
