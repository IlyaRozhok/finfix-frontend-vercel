import React, { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import { Button } from "@/shared/ui/Button";
import { Calendar } from "@/shared/ui/Calendar/Calendar";
import { useToast } from "@/shared/ui";
import {
  createRegularIncome,
  createEventIncome,
  updateRegularIncome,
  updateEventIncome,
} from "@/features/incomes/api";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface IncomeFormData {
  description: string;
  amount: string;
  date?: string; // Only for event incomes
}

interface IncomeFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => Promise<void>;
  type: "regular" | "event";
  initialData?: IncomeFormData;
  isEditing?: boolean;
  incomeId?: string;
  editingIncome?: any;
}

export function IncomeForm({
  isOpen,
  onClose,
  onSubmit,
  type,
  initialData,
  isEditing = false,
  incomeId,
  editingIncome,
}: IncomeFormProps) {
  const { addToast } = useToast();
  const [formData, setFormData] = useState<IncomeFormData>(
    initialData || {
      description: "",
      amount: "",
      ...(type === "event" && { date: "" }),
    }
  );

  // Update form data when initialData or editingIncome changes (for editing)
  useEffect(() => {
    if (isOpen && editingIncome && isEditing) {
      const newData: IncomeFormData = {
        description: editingIncome.description || "",
        amount: editingIncome.amount?.toString() || "",
        ...(type === "event" && {
          date: editingIncome.date
            ? new Date(editingIncome.date).toISOString().split("T")[0]
            : "",
        }),
      };
      setFormData(newData);
    } else if (isOpen && initialData) {
      setFormData((prevData) => ({
        ...prevData,
        ...initialData,
      }));
    }
  }, [editingIncome, initialData, type, isOpen, isEditing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (type === "regular") {
        if (isEditing && incomeId) {
          await updateRegularIncome(incomeId, {
            amount: parseFloat(formData.amount),
            description: formData.description,
          });
          addToast(
            "success",
            "Regular Income Updated",
            `Successfully updated $${formData.amount} monthly income`
          );
        } else {
          // Create new regular income
          await createRegularIncome({
            amount: parseFloat(formData.amount),
            description: formData.description,
          });
          addToast(
            "success",
            "Regular Income Added",
            `Successfully added $${formData.amount} monthly income`
          );
        }
      } else if (type === "event") {
        if (isEditing && incomeId) {
          // Update existing event income
          await updateEventIncome(incomeId, {
            amount: parseFloat(formData.amount),
            description: formData.description,
            date: formData.date,
          });
          addToast(
            "success",
            "Event Income Updated",
            `Successfully updated $${formData.amount} one-time income`
          );
        } else {
          // Create new event income
          await createEventIncome({
            amount: parseFloat(formData.amount),
            description: formData.description,
            date: formData.date || "",
          });
          addToast(
            "success",
            "Event Income Added",
            `Successfully added $${formData.amount} one-time income`
          );
        }
      }
      onClose();
      await onSubmit();
    } catch (error) {
      console.error("Failed to create income:", error);
      addToast(
        "error",
        isEditing ? "Failed to Update Income" : "Failed to Add Income",
        "Please check your input and try again"
      );
      return;
    }

    setFormData({
      description: "",
      amount: "",
      ...(type === "event" && { date: "" }),
    });
  };

  const handleClose = () => {
    setFormData({
      description: "",
      amount: "",
      ...(type === "event" && { date: "" }),
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
              {isEditing ? "Edit" : "Add"}{" "}
              {type === "regular" ? "Regular" : "Event"} Income
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
                placeholder="Enter income description"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-primary-background/90 mb-2 tracking-wide">
                Amount ($)
              </label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-primary-background placeholder-primary-background/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-200"
                placeholder="0.00"
                step="0.01"
                min="0"
                required
              />
            </div>

            {type === "event" && (
              <div>
                <label className="block text-sm font-semibold text-primary-background/90 mb-2 tracking-wide">
                  Date
                </label>
                <Calendar
                  value={formData.date}
                  onChange={(date) => setFormData({ ...formData, date })}
                  placeholder="Select event date"
                />
              </div>
            )}

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
                {isEditing ? "Update" : "Add"} Income
              </Button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
