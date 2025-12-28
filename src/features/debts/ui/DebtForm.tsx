import React, { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import { Button } from "@/shared/ui/Button";
import { useToast } from "@/shared/ui";
import { createDebt, updateDebt, Debt } from "@/features/debts/api";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface DebtFormData {
  description: string;
  totalDebt: string;
  interest: string;
}

interface DebtFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => Promise<void>;
  initialData?: DebtFormData;
  isEditing?: boolean;
  debtId?: string;
  editingDebt?: Debt;
  userId: string;
}

export function DebtForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isEditing = false,
  debtId,
  editingDebt,
  userId,
}: DebtFormProps) {
  const { addToast } = useToast();
  const [formData, setFormData] = useState<DebtFormData>(
    initialData || {
      description: "",
      totalDebt: "",
      interest: "",
    }
  );

  // Update form data when initialData or editingDebt changes (for editing)
  useEffect(() => {
    if (editingDebt && isEditing) {
      const newData: DebtFormData = {
        description: editingDebt.description || "",
        totalDebt: editingDebt.totalDebt || "",
        interest: editingDebt.interest || "",
      };
      setFormData(newData);
    } else if (initialData) {
      setFormData(initialData);
    }
  }, [editingDebt, initialData, isEditing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!userId) {
        addToast(
          "error",
          "Missing user",
          "Please sign in again and try to save the debt."
        );
        return;
      }
      if (isEditing && debtId) {
        // Update existing debt
        await updateDebt(debtId, {
          userId,
          description: formData.description,
          totalDebt: formData.totalDebt,
          interest: formData.interest,
        });
        addToast("success", "Debt Updated", `Successfully updated debt`);
      } else {
        // Create new debt
        await createDebt({
          userId,
          description: formData.description,
          totalDebt: formData.totalDebt,
          interest: formData.interest,
        });
        addToast("success", "Debt Added", `Successfully added new debt`);
      }

      await onSubmit();
    } catch (error) {
      console.error("Failed to save debt:", error);
      addToast(
        "error",
        isEditing ? "Failed to Update Debt" : "Failed to Add Debt",
        "Please check your input and try again"
      );
      return;
    }

    setFormData({
      description: "",
      totalDebt: "",
      interest: "",
    });
    onClose();
  };

  const handleClose = () => {
    setFormData({
      description: "",
      totalDebt: "",
      interest: "",
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
              {isEditing ? "Edit" : "Add"} Debt
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
                placeholder="Enter debt description"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-primary-background/90 mb-2 tracking-wide">
                Total Debt ($)
              </label>
              <input
                type="number"
                value={formData.totalDebt}
                onChange={(e) =>
                  setFormData({ ...formData, totalDebt: e.target.value })
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
                Interest Rate (%)
              </label>
              <input
                type="number"
                value={formData.interest}
                onChange={(e) =>
                  setFormData({ ...formData, interest: e.target.value })
                }
                className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-primary-background placeholder-primary-background/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-200"
                placeholder="0.00"
                step="0.01"
                min="0"
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
                {isEditing ? "Update" : "Add"} Debt
              </Button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
