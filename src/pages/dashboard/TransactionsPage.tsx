import React, { useEffect, useState } from "react";
import { TransactionForm } from "@/features/transactions";
import { Button, useToast } from "@/shared/ui";
import { ConfirmationModal } from "@/shared/ui/ConfirmationModal";
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import {
  fetchTransactions,
  deleteTransaction,
  Transaction,
} from "@/features/transactions/api";

export function TransactionsPage() {
  const { addToast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    description: string;
  } | null>(null);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const data = await fetchTransactions();
      setTransactions(data);
    } catch (err) {
      setError("Failed to load transactions");
      console.warn(err)
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatAmount = (amount: string, direction: string) => {
    const formatted = parseFloat(amount).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return direction === "income" ? `$${formatted}` : `$${formatted}`;
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Transactions</h1>
          <p className="mt-1">Record your financial transactions</p>
        </div>

        <div>
          <Button variant="glass-primary" onClick={handleAddTransaction}>
            Add Transaction
          </Button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg overflow-hidden">
        {transactions.length === 0 ? (
          <div className="min-h-[300px] flex items-center justify-center">
            <div className="text-center max-w-md mx-auto p-8">
              <h3 className="text-xl font-semibold text-primary-background mb-3">
                No transactions yet
              </h3>
              <p className="text-sm text-disable leading-relaxed">
                Your transaction history will appear here. Use the "Add
                Transaction" button to record new transactions.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10">
              <thead className="bg-white/5 backdrop-blur-sm">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Direction
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Note
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-transparent divide-y divide-white/10">
                {transactions.map((transaction) => (
                  <tr
                    key={transaction.id}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          <div
                            className={`h-8 w-8 rounded-full flex items-center justify-center ${
                              transaction.direction === "income"
                                ? "bg-green-500/20"
                                : "bg-red-500/20"
                            }`}
                          >
                            {transaction.direction === "income" ? (
                              <ArrowTrendingUpIcon className="h-4 w-4 text-green-400" />
                            ) : (
                              <ArrowTrendingDownIcon className="h-4 w-4 text-red-400" />
                            )}
                          </div>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {getTransactionType(transaction.type)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          transaction.direction === "income"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {transaction.direction === "income"
                          ? "Income"
                          : "Expense"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(transaction.occurredAt)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {transaction.note || "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleDeleteTransaction(transaction)}
                        className="text-red-400 hover:text-red-300 p-1 rounded-lg hover:bg-red-500/10 transition-all duration-200"
                        title="Delete transaction"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
