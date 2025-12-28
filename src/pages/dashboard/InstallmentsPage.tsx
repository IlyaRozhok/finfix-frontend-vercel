import React, { useEffect, useState, useMemo } from "react";
import {
  fetchUserInstallments,
  deleteInstallment,
} from "@/features/installments/api";
import { Installment } from "@/features/installments/model/types";
import { InstallmentForm } from "@/features/installments/ui/InstallmentForm";
import { useAuth } from "@/app/providers/AuthProvider";
import { Button, useToast } from "@/shared/ui";
import { ConfirmationModal } from "@/shared/ui/ConfirmationModal";
import {
  CurrencyDollarIcon,
  CalendarDaysIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

export function InstallmentsPage() {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [installments, setInstallments] = useState<Installment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingInstallment, setEditingInstallment] = useState<
    Installment | undefined
  >();

  // Delete confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    description: string;
  } | null>(null);

  // Calculate summary statistics (always call this hook, before any returns)
  const summaryStats = useMemo(() => {
    if (!installments || installments.length === 0) {
      return {
        totalAmount: 0,
        monthlyPayment: 0,
        installmentCount: 0,
      };
    }

    const totalAmount = installments.reduce(
      (sum, installment) => sum + Number(installment.totalAmount),
      0
    );
    const monthlyPayment = installments.reduce(
      (sum, installment) => sum + Number(installment.monthlyPayment),
      0
    );

    return {
      totalAmount,
      monthlyPayment,
      installmentCount: installments.length,
    };
  }, [installments]);

  useEffect(() => {
    const loadInstallments = async () => {
      try {
        setLoading(true);
        const data = await fetchUserInstallments();
        setInstallments(data);
      } catch (err) {
        console.error("Failed to load installments:", err);
        setError("Failed to load installments");
      } finally {
        setLoading(false);
      }
    };

    loadInstallments();
  }, []);

  const handleFormSubmit = async () => {
    // Reload installments after form submission
    try {
      const data = await fetchUserInstallments();
      setInstallments(data);
    } catch (err) {
      console.error("Failed to reload installments:", err);
    }
  };

  const handleAddInstallment = () => {
    setIsEditing(false);
    setEditingInstallment(undefined);
    setIsFormOpen(true);
  };

  const handleEditInstallment = (installment: Installment) => {
    setIsEditing(true);
    setEditingInstallment(installment);
    setIsFormOpen(true);
  };

  const handleDeleteInstallment = (installment: Installment) => {
    setDeleteTarget({
      id: installment.id,
      description: installment.description,
    });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      await deleteInstallment(deleteTarget.id);
      addToast(
        "success",
        "Installment Deleted",
        "Successfully deleted installment"
      );

      // Reload installments
      const data = await fetchUserInstallments();
      setInstallments(data);
    } catch (err) {
      console.error("Failed to delete installment:", err);
      addToast("error", "Failed to Delete Installment", "Please try again");
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
        <div className="text-black/70">Loading installments...</div>
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
        <h1 className="text-3xl font-bold">Installments</h1>
        <p className="mt-1">Track your installment plans</p>
      </div>

      {/* Summary Cards */}
      {installments.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-primary-background">
                  Total Amount
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
                  Monthly Payment
                </p>
                <p className="text-2xl font-bold mt-1 text-primary-background">
                  ${summaryStats.monthlyPayment.toLocaleString()}
                </p>
              </div>
              <div className="text-2xl text-primary-background/80">
                <CalendarDaysIcon className="h-8 w-8" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Installment Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleAddInstallment}
          variant="glass-primary"
          size="lg"
          className="flex items-center gap-2"
        >
          Add Installment
        </Button>
      </div>

      {/* Installments Table */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg overflow-hidden">
        {installments.length === 0 ? (
          <div className="min-h-[300px] flex items-center justify-center">
            <div className="text-center max-w-md mx-auto p-8">
              {/* Title */}
              <h3 className="text-xl font-semibold text-primary-background mb-3">
                No installments yet
              </h3>

              {/* Subtitle */}
              <p className="text-sm text-disable leading-relaxed">
                Your installment plans will appear here once you add some
                purchases.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10">
              <thead className="bg-white/5 backdrop-blur-sm">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monthly Payment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payments Left
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    End Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-transparent divide-y divide-white/10">
                {installments.map((installment) => {
                  console.log("Installment data:", installment);
                  return (
                    <tr
                      key={installment.id}
                      className="hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                          {installment.description}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          $
                          {Number(
                            installment.totalAmount || 0
                          ).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          $
                          {Number(
                            installment.monthlyPayment || 0
                          ).toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">per month</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {installment.totalPayments}
                        </div>
                        <div className="text-xs text-gray-500">payments</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>
                          {new Date(installment.endDate).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            installment.status === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {installment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditInstallment(installment)}
                            className="text-primary-background hover:text-primary-background/80 p-1 rounded-lg hover:bg-white/10 transition-all duration-200"
                            title="Edit installment"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteInstallment(installment)}
                            className="text-red-400 hover:text-red-300 p-1 rounded-lg hover:bg-red-500/10 transition-all duration-200"
                            title="Delete installment"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Installment Form Modal */}
      <InstallmentForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        isEditing={isEditing}
        installmentId={editingInstallment?.id}
        editingInstallment={editingInstallment}
        userId={user?.id ?? ""}
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
