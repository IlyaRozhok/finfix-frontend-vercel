import React, { useEffect, useMemo, useState } from "react";
import { fetchUserExpenses, deleteExpense } from "@/features/expenses/api";
import { Expense } from "@/features/expenses/model/types";
import { CategoryIcon } from "@/features/expenses/ui/CategoryIcon";
import {
  CurrencyDollarIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { ExpenseForm } from "@/features/expenses/ui/ExpenseForm";
import { Button, useToast } from "@/shared/ui";
import { ConfirmationModal } from "@/shared/ui/ConfirmationModal";
import { fetchCategories } from "@/features/onboarding/api";

export function ExpensesPage() {
  const { addToast } = useToast();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [categories, setCategories] = useState<
    { value: string; label: string }[]
  >([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    description: string;
  } | null>(null);

  // Calculate summary statistics (always call this hook, before any returns)
  const summaryStats = useMemo(() => {
    if (!expenses || expenses.length === 0) {
      return {
        totalAmount: 0,
        expenseCount: 0,
      };
    }

    const totalAmount = expenses.reduce(
      (sum, expense) => sum + parseFloat(expense.amount || "0"),
      0
    );

    return {
      totalAmount,
      expenseCount: expenses.length,
    };
  }, [expenses]);

  useEffect(() => {
    const loadExpenses = async () => {
      try {
        setLoading(true);
        const data = await fetchUserExpenses();
        setExpenses(data);
      } catch (err) {
        console.error("Failed to load expenses:", err);
        setError("Failed to load expenses");
      } finally {
        setLoading(false);
      }
    };

    const loadCategories = async () => {
      try {
        const data = await fetchCategories();
        setCategories(
          data.map((c: { id: string; name: string }) => ({
            value: c.id,
            label: c.name,
          }))
        );
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    };

    loadExpenses();
    loadCategories();
  }, []);

  const refreshExpenses = async () => {
    try {
      setLoading(true);
      const data = await fetchUserExpenses();
      setExpenses(data);
    } catch (err) {
      console.error("Failed to load expenses:", err);
      setError("Failed to load expenses");
    } finally {
      setLoading(false);
    }
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setIsEditing(true);
    setShowForm(true);
  };

  const handleAddExpense = () => {
    setEditingExpense(null);
    setIsEditing(false);
    setShowForm(true);
  };

  const handleDeleteExpense = (expense: Expense) => {
    setDeleteTarget({
      id: expense.id,
      description: expense.description || "Expense",
    });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteExpense(deleteTarget.id);
      addToast("success", "Expense deleted", "Expense removed successfully.");
      await refreshExpenses();
    } catch (err) {
      console.error("Failed to delete expense:", err);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-black/70">Loading expenses...</div>
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
          <h1 className="text-3xl font-bold">Expenses</h1>
          <p className="mt-1">Track your recurring expenses</p>
        </div>
        <Button variant="glass-primary" onClick={handleAddExpense}>
          Add Expense
        </Button>
      </div>

      {/* Summary Cards */}
      {expenses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-primary-background">
                  Total Monthly
                </p>
                <p className="text-2xl font-bold mt-1 text-primary-background">
                  ${summaryStats.totalAmount.toLocaleString()}
                </p>
              </div>
              <div className="text-2xl text-primary-background/80">
                <CurrencyDollarIcon className="h-8 w-8" />
              </div>
            </div>
          </div>

          <div className="p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-primary-background">
                  Total Expenses
                </p>
                <p className="text-2xl font-bold mt-1 text-primary-background">
                  {summaryStats.expenseCount}
                </p>
              </div>
              <div className="text-2xl text-primary-background/80"></div>
            </div>
          </div>
        </div>
      )}

      {/* Expenses Table */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg overflow-hidden">
        {expenses.length === 0 ? (
          <div className="min-h-[300px] flex items-center justify-center">
            <div className="text-center max-w-md mx-auto p-8">
              {/* Title */}
              <h3 className="text-xl font-semibold text-primary-background mb-3">
                No expenses yet
              </h3>

              {/* Subtitle */}
              <p className="text-sm text-disable leading-relaxed">
                Your expense information will appear here once you add some
                recurring expenses.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10">
              <thead className="bg-white/5 backdrop-blur-sm">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Frequency
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Added
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-transparent divide-y divide-white/10">
                {expenses.map((expense) => (
                  <tr
                    key={expense.id}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          <div className="h-8 w-8 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                            <CategoryIcon
                              iconName={expense.category?.icon}
                              className="h-4 w-4 text-primary-background/70"
                            />
                          </div>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {expense.category?.name || "Uncategorized"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {expense.description || "No description"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        ${parseFloat(expense.amount || "0").toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">per month</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        Monthly
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>
                        {new Date(expense.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }
                        )}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(expense.createdAt).toLocaleTimeString(
                          "en-US",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleEditExpense(expense)}
                          className="text-primary-background hover:text-primary-background/80 p-1 rounded-lg hover:bg-white/10 transition-all duration-200"
                          title="Edit expense"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteExpense(expense)}
                          className="text-red-400 hover:text-red-300 p-1 rounded-lg hover:bg-red-500/10 transition-all duration-200"
                          title="Delete expense"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ExpenseForm
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setIsEditing(false);
          setEditingExpense(null);
        }}
        onSubmit={refreshExpenses}
        isEditing={isEditing}
        expenseId={editingExpense?.id}
        categories={categories}
        initialData={
          isEditing && editingExpense
            ? {
                categoryId: editingExpense.categoryId,
                amount: editingExpense.amount,
                description: editingExpense.description || "",
              }
            : undefined
        }
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
