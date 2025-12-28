import React, { useEffect, useState, useMemo } from "react";
import {
  fetchAllIncomes,
  fetchRegularIncome,
  fetchEventIncome,
  deleteRegularIncome,
  deleteEventIncome,
} from "@/features/incomes/api";
import { AllIncomes } from "@/features/incomes/model/types";
import { IncomeForm } from "@/features/incomes/ui/IncomeForm";
import { Button, useToast } from "@/shared/ui";
import { ConfirmationModal } from "@/shared/ui/ConfirmationModal";
import {
  SparklesIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

export function IncomesPage() {
  const { addToast } = useToast();
  const [incomes, setIncomes] = useState<AllIncomes>({
    regular: [],
    events: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<"regular" | "event">("regular");
  const [isEditing, setIsEditing] = useState(false);
  const [editingIncome, setEditingIncome] = useState<{
    id: string;
    description: string;
    amount: number;
    date?: string;
  } | null>(null);
  const [regularExpanded, setRegularExpanded] = useState(true);
  const [eventExpanded, setEventExpanded] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "regular" | "event";
    id: string;
    description: string;
  } | null>(null);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const regularTotal = incomes.regular.reduce(
      (sum, income) => sum + income.amount,
      0
    );
    const eventTotal = incomes.events.reduce(
      (sum, income) => sum + income.amount,
      0
    );
    const totalAmount = regularTotal + eventTotal;

    return {
      regularTotal,
      eventTotal,
      totalAmount,
      regularCount: incomes.regular.length,
      eventCount: incomes.events.length,
    };
  }, [incomes]);

  const handleCreateIncome = async () => {
    // Reload data after successful creation
    try {
      const data = await fetchAllIncomes();
      setIncomes(data);
    } catch (err) {
      console.error("Failed to reload incomes:", err);
      throw err; // Re-throw so the form can handle the error
    }
  };

  const handleDeleteRegularIncome = (id: string, description: string) => {
    setDeleteTarget({ type: "regular", id, description });
    setShowDeleteModal(true);
  };

  const handleDeleteEventIncome = (id: string, description: string) => {
    setDeleteTarget({ type: "event", id, description });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      if (deleteTarget.type === "regular") {
        await deleteRegularIncome(deleteTarget.id);
        addToast(
          "success",
          "Regular Income Deleted",
          `Successfully deleted "${deleteTarget.description}"`
        );
      } else {
        await deleteEventIncome(deleteTarget.id);
        addToast(
          "success",
          "Event Income Deleted",
          `Successfully deleted "${deleteTarget.description}"`
        );
      }
      const data = await fetchAllIncomes();
      setIncomes(data);
    } catch (err) {
      console.error("Failed to delete income:", err);
      addToast("error", "Failed to Delete Income", "Please try again.");
    } finally {
      setShowDeleteModal(false);
      setDeleteTarget(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDeleteTarget(null);
  };

  const openForm = async (
    type: "regular" | "event",
    income?: {
      id: string;
      description: string;
      amount: number;
      date?: string;
    }
  ) => {
    setFormType(type);
    if (income) {
      setIsEditing(true);
      if (income.id) {
        // Fetch fresh data for editing
        try {
          const freshIncome =
            type === "regular"
              ? await fetchRegularIncome(income.id)
              : await fetchEventIncome(income.id);
          setEditingIncome(freshIncome);
          setShowForm(true);
        } catch (err) {
          console.error("Failed to fetch income for editing:", err);
          // Fall back to cached data if fetch fails
          setEditingIncome(income);
          setShowForm(true);
        }
      } else {
        setEditingIncome(income);
        setShowForm(true);
      }
    } else {
      setIsEditing(false);
      setEditingIncome(null);
      setShowForm(true);
    }
  };

  useEffect(() => {
    const loadIncomes = async () => {
      try {
        setLoading(true);
        const data = await fetchAllIncomes();
        setIncomes(data);
      } catch (err) {
        console.error("Failed to load incomes:", err);
        setError("Failed to load incomes");
      } finally {
        setLoading(false);
      }
    };

    loadIncomes();
  }, []);



  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-black/70">Loading incomes...</div>
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
      <div>
        <h1 className="text-3xl font-bold">Incomes</h1>
        <p className="mt-1">Track your income sources</p>
      </div>

      {/* Summary Cards */}
      {(incomes.regular.length > 0 || incomes.events.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-primary-background">
                  Total Monthly
                </p>
                <p className="text-2xl font-bold mt-1 text-primary-background">
                  ${summaryStats.regularTotal.toLocaleString()}
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
                  Event Income
                </p>
                <p className="text-2xl font-bold mt-1 text-primary-background">
                  ${summaryStats.eventTotal.toLocaleString()}
                </p>
              </div>
              <div className="text-2xl text-primary-background/80">
                <CalendarDaysIcon className="h-8 w-8" />
              </div>
            </div>
          </div>

          <div className="p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-primary-background">
                  Total Income
                </p>
                <p className="text-2xl font-bold mt-1 text-primary-background">
                  ${summaryStats.totalAmount.toLocaleString()}
                </p>
              </div>
              <div className="text-2xl text-primary-background/80">
                <SparklesIcon className="h-8 w-8" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Regular Incomes Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setRegularExpanded(!regularExpanded)}
              className="p-1 rounded-lg hover:bg-white/10 transition-colors group"
            >
              {regularExpanded ? (
                <ChevronUpIcon className="h-5 w-5 text-primary-background/70 group-hover:text-primary-background" />
              ) : (
                <ChevronDownIcon className="h-5 w-5 text-primary-background/70 group-hover:text-primary-background" />
              )}
            </button>
            <h2 className="text-xl font-semibold text-primary-background">
              Regular Incomes ({summaryStats.regularCount})
            </h2>
          </div>
          <Button variant="glass-primary" onClick={() => openForm("regular")}>
            Add Regular Income
          </Button>
        </div>

        {regularExpanded && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg overflow-hidden">
            {incomes.regular.length === 0 ? (
              <div className="min-h-[200px] flex items-center justify-center">
                <div className="text-center max-w-md mx-auto p-8">
                  <h3 className="text-lg font-semibold text-primary-background mb-2">
                    No regular incomes yet
                  </h3>
                  <p className="text-sm text-disable leading-relaxed">
                    Your regular income sources will appear here once you add
                    some.
                  </p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto max-h-96 overflow-y-auto">
                <table className="min-w-full divide-y divide-white/10">
                  <thead className="bg-white/5 backdrop-blur-sm">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
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
                    {incomes.regular.map((income) => (
                      <tr
                        key={income.id}
                        className="hover:bg-white/5 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {income.description}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">
                            ${income.amount.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500">per month</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(income.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => openForm("regular", income)}
                              className="text-primary-background hover:text-primary-background/80 p-1 rounded-lg hover:bg-white/10 transition-all duration-200 group"
                              title="Edit income"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteRegularIncome(
                                  income.id,
                                  income.description
                                )
                              }
                              className="text-red-400 hover:text-red-300 p-1 rounded-lg hover:bg-red-500/10 transition-all duration-200 group"
                              title="Delete income"
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
        )}
      </div>

      {/* Event Incomes Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setEventExpanded(!eventExpanded)}
              className="p-1 rounded-lg hover:bg-white/10 transition-colors group"
            >
              {eventExpanded ? (
                <ChevronUpIcon className="h-5 w-5 text-primary-background/70 group-hover:text-primary-background" />
              ) : (
                <ChevronDownIcon className="h-5 w-5 text-primary-background/70 group-hover:text-primary-background" />
              )}
            </button>
            <h2 className="text-xl font-semibold text-primary-background">
              Event Incomes ({summaryStats.eventCount})
            </h2>
          </div>
          <Button variant="glass-secondary" onClick={() => openForm("event")}>
            Add Event Income
          </Button>
        </div>

        {eventExpanded && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg overflow-hidden">
            {incomes.events.length === 0 ? (
              <div className="min-h-[200px] flex items-center justify-center">
                <div className="text-center max-w-md mx-auto p-8">
                  <h3 className="text-lg font-semibold text-primary-background mb-2">
                    No event incomes yet
                  </h3>
                  <p className="text-sm text-disable leading-relaxed">
                    Your one-time income events will appear here once you add
                    some.
                  </p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto max-h-96 overflow-y-auto">
                <table className="min-w-full divide-y divide-white/10">
                  <thead className="bg-white/5 backdrop-blur-sm">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-transparent divide-y divide-white/10">
                    {incomes.events.map((income) => (
                      <tr
                        key={income.id}
                        className="hover:bg-white/5 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {income.description}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">
                            ${income.amount.toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(income.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => openForm("event", income)}
                              className="text-primary-background hover:text-primary-background/80 p-1 rounded-lg hover:bg-white/10 transition-all duration-200 group"
                              title="Edit income"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteEventIncome(
                                  income.id,
                                  income.description
                                )
                              }
                              className="text-red-400 hover:text-red-300 p-1 rounded-lg hover:bg-red-500/10 transition-all duration-200 group"
                              title="Delete income"
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
        )}
      </div>

      {/* Income Form Modal */}
      <IncomeForm
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setIsEditing(false);
          setEditingIncome(null);
        }}
        onSubmit={handleCreateIncome}
        type={formType}
        isEditing={isEditing}
        incomeId={editingIncome?.id}
        editingIncome={editingIncome}
        initialData={undefined}
      />

      {/* Delete Confirmation Modal */}
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
