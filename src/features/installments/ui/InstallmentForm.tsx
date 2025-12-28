import React, { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import { Button } from "@/shared/ui/Button";
import { useToast } from "@/shared/ui";
import {
  createInstallment,
  updateInstallment,
} from "@/features/installments/api";
import { Installment } from "@/features/installments/model/types";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface InstallmentFormData {
  description: string;
  startDate: string;
  totalAmount: string;
  totalPayments: string;
}

interface InstallmentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => Promise<void>;
  initialData?: InstallmentFormData;
  isEditing?: boolean;
  installmentId?: string;
  editingInstallment?: Installment;
  userId: string;
}

export function InstallmentForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isEditing = false,
  installmentId,
  editingInstallment,
  userId,
}: InstallmentFormProps) {
  const { addToast } = useToast();
  const [formData, setFormData] = useState<InstallmentFormData>(
    initialData || {
      description: "",
      startDate: "",
      totalAmount: "",
      totalPayments: "",
    }
  );

  // Update form data when initialData or editingInstallment changes (for editing)
  useEffect(() => {
    if (editingInstallment && isEditing) {
      const newData: InstallmentFormData = {
        description: editingInstallment.description || "",
        startDate: editingInstallment.startDate.split("T")[0] || "", // Convert to YYYY-MM-DD format
        totalAmount: editingInstallment.totalAmount.toString() || "",
        totalPayments: editingInstallment.totalPayments.toString() || "",
      };
      setFormData(newData);
    } else if (initialData) {
      setFormData(initialData);
    }
  }, [editingInstallment, initialData, isEditing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!userId) {
        addToast(
          "error",
          "Missing user",
          "Please sign in again and try to save the installment."
        );
        return;
      }

      const submitData = {
        description: formData.description,
        startDate: formData.startDate,
        totalAmount: parseFloat(formData.totalAmount),
        totalPayments: parseInt(formData.totalPayments),
      };

      if (isEditing && installmentId) {
        // Update existing installment
        await updateInstallment(installmentId, submitData);
        addToast(
          "success",
          "Installment Updated",
          `Successfully updated installment`
        );
      } else {
        // Create new installment
        await createInstallment({
          userId,
          ...submitData,
        });
        addToast(
          "success",
          "Installment Added",
          `Successfully added new installment`
        );
      }

      await onSubmit();
    } catch (error) {
      console.error("Failed to save installment:", error);
      addToast(
        "error",
        isEditing
          ? "Failed to Update Installment"
          : "Failed to Add Installment",
        "Please check your input and try again"
      );
      return;
    }

    setFormData({
      description: "",
      startDate: "",
      totalAmount: "",
      totalPayments: "",
    });
    onClose();
  };

  const handleClose = () => {
    setFormData({
      description: "",
      startDate: "",
      totalAmount: "",
      totalPayments: "",
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
      {/* Enhanced backdrop with better blur */}
      <div className="fixed inset-0 bg-black/20 backdrop-blur-xl" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/30 shadow-2xl max-w-md w-full p-8">
          {/* Header with glassmorphism close button */}
          <div className="flex items-center justify-between mb-8">
            <Dialog.Title className="text-2xl font-bold text-primary-background tracking-tight">
              {isEditing ? "Edit" : "Add"} Installment
            </Dialog.Title>
            <button
              onClick={handleClose}
              className="p-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-200 group"
            >
              <XMarkIcon className="h-5 w-5 text-primary-background/70 group-hover:text-primary-background transition-colors" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-primary-background/90 mb-2 tracking-wide">
                Description
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-primary-background placeholder-primary-background/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-200"
                placeholder="Enter installment description"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-primary-background/90 mb-2 tracking-wide">
                Start Date
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
                className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-primary-background placeholder-primary-background/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-200"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-primary-background/90 mb-2 tracking-wide">
                Total Amount ($)
              </label>
              <input
                type="number"
                value={formData.totalAmount}
                onChange={(e) =>
                  setFormData({ ...formData, totalAmount: e.target.value })
                }
                className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-primary-background placeholder-primary-background/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-200"
                placeholder="0.00"
                step="0.01"
                min="0"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-primary-background/90 mb-2 tracking-wide">
                Number of Payments
              </label>
              <input
                type="number"
                value={formData.totalPayments}
                onChange={(e) =>
                  setFormData({ ...formData, totalPayments: e.target.value })
                }
                className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-primary-background placeholder-primary-background/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-200"
                placeholder="12"
                min="1"
                required
              />
            </div>

            <div className="flex gap-4 pt-6">
              <Button
                type="button"
                variant="ghost"
                size="lg"
                className="flex-1"
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="glass-primary"
                size="lg"
                className="flex-1"
              >
                {isEditing ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
