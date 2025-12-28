import React, { useEffect, useState } from "react";
import { fetchDebts, deleteDebt, Debt } from "@/features/debts/api";
import { DebtForm } from "@/features/debts/ui/DebtForm";
import { Button, useToast } from "@/shared/ui";
import { ConfirmationModal } from "@/shared/ui/ConfirmationModal";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useAuth } from "@/app/providers/AuthProvider";

export function DebtsPage() {
  const { addToast } = useToast();
  const { user } = useAuth();
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    description: string;
  } | null>(null);

  const loadDebts = async () => {
    try {
      setLoading(true);
      const data = await fetchDebts();
      setDebts(data);
    } catch (err) {
      console.error("Failed to load debts:", err);
      setError("Failed to load debts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDebts();
  }, []);

  const handleCreateDebt = async () => {
    await loadDebts();
  };

  const handleEditDebt = (debt: Debt) => {
    setEditingDebt(debt);
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDeleteDebt = (id: string, description: string) => {
    setDeleteTarget({ id, description });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      await deleteDebt(deleteTarget.id);
      addToast(
        "success",
        "Debt Deleted",
        `Successfully deleted "${deleteTarget.description}"`
      );
      await loadDebts();
    } catch (err) {
      console.error("Failed to delete debt:", err);
      addToast("error", "Failed to Delete Debt", "Please try again.");
    } finally {
      setShowDeleteModal(false);
      setDeleteTarget(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDeleteTarget(null);
  };

  const openAddForm = () => {
    setEditingDebt(null);
    setIsEditing(false);
    setShowForm(true);
  };



  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-black/70">Loading debts...</div>
      </div>
    );
  }

  if (error || !debts) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-300">{error || "Failed to load debts"}</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Debts</h1>
          <p className="mt-1">Manage your debt obligations</p>
        </div>
        <Button variant="glass-primary" onClick={openAddForm}>
          Add Debt
        </Button>
      </div>

      {/* Debts Table */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg overflow-hidden">
        {debts.length === 0 ? (
          <div className="min-h-[300px] flex items-center justify-center">
            <div className="text-center max-w-md mx-auto p-8">
              {/* Title */}
              <h3 className="text-xl font-semibold text-primary-background mb-3">
                No debts yet
              </h3>

              {/* Subtitle */}
              <p className="text-sm text-disable leading-relaxed">
                Your debt information will appear here once you add some loans
                or credit cards.
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
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Debt
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monthly Payment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Interest Rate
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
                {debts.map((debt) => (
                  <tr
                    key={debt.id}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {debt.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {debt.debtType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${parseFloat(debt.totalDebt || "0").toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${parseFloat(debt.monthlyPayment || "0").toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {parseFloat(debt.interest || "0").toFixed(2)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          debt.isClosed
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {debt.isClosed ? "Closed" : "Active"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleEditDebt(debt)}
                          className="text-primary-background hover:text-primary-background/80 p-1 rounded-lg hover:bg-white/10 transition-all duration-200 group"
                          title="Edit debt"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteDebt(debt.id, debt.description)
                          }
                          className="text-red-400 hover:text-red-300 p-1 rounded-lg hover:bg-red-500/10 transition-all duration-200 group"
                          title="Delete debt"
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

      {/* Debt Form Modal */}
      <DebtForm
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setIsEditing(false);
          setEditingDebt(null);
        }}
        onSubmit={handleCreateDebt}
        isEditing={isEditing}
        debtId={editingDebt?.id}
        initialData={
          isEditing && editingDebt
            ? {
                description: editingDebt.description,
                totalDebt: editingDebt.totalDebt,
                interest: editingDebt.interest || "",
              }
            : undefined
        }
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
