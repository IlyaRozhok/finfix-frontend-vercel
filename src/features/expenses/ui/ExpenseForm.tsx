import { useEffect, useMemo, useState } from "react";
import { Dialog } from "@headlessui/react";
import { Button } from "@/shared/ui/Button";
import { ListboxFloating, useToast } from "@/shared/ui";
import { createExpense, updateExpense } from "../api";
import { XMarkIcon } from "@heroicons/react/24/outline";

type CategoryOption = { value: string; label: string };

type ExpenseFormData = {
  categoryId: string;
  amount: string;
  description: string;
};

type ExpenseFormProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => Promise<void>;
  categories: CategoryOption[];
  initialData?: ExpenseFormData;
  isEditing?: boolean;
  expenseId?: string;
};

export function ExpenseForm({
  isOpen,
  onClose,
  onSubmit,
  categories,
  initialData,
  isEditing = false,
  expenseId,
}: ExpenseFormProps) {
  const { addToast } = useToast();

  const defaultCategory = useMemo(
    () => categories[0]?.value ?? "",
    [categories]
  );

  const [formData, setFormData] = useState<ExpenseFormData>(
    initialData ?? {
      categoryId: defaultCategory,
      amount: "",
      description: "",
    }
  );

  useEffect(() => {
    if (!isOpen) return;

    if (initialData) {
      setFormData({
        categoryId: initialData.categoryId,
        amount: initialData.amount,
        description: initialData.description,
      });
      return;
    }

    setFormData((prev) => ({
      categoryId: prev.categoryId || defaultCategory,
      amount: "",
      description: "",
    }));
  }, [initialData, defaultCategory, isOpen]);

  const handleClose = () => {
    setFormData({
      categoryId: defaultCategory,
      amount: "",
      description: "",
    });
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.categoryId) {
      addToast("error", "Choose a category", "Please select a category.");
      return;
    }

    if (!formData.amount || Number(formData.amount) <= 0) {
      addToast("error", "Invalid amount", "Enter a positive amount.");
      return;
    }

    try {
      if (isEditing && expenseId) {
        await updateExpense(expenseId, {
          categoryId: formData.categoryId,
          amount: formData.amount,
          description: formData.description,
        });
        addToast("success", "Expense updated", "Changes saved.");
      } else {
        await createExpense({
          categoryId: formData.categoryId,
          amount: formData.amount,
          description: formData.description,
        });
        addToast("success", "Expense added", "Expense created successfully.");
      }

      await onSubmit();
      handleClose();
    } catch (error) {
      console.error("Failed to save expense:", error);
      addToast(
        "error",
        isEditing ? "Update failed" : "Create failed",
        "Please try again."
      );
    }
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/20 backdrop-blur-xl" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/30 shadow-2xl max-w-md w-full p-8">
          <div className="flex items-center justify-between mb-8">
            <Dialog.Title className="text-2xl font-bold text-primary-background tracking-tight">
              {isEditing ? "Edit" : "Add"} Expense
            </Dialog.Title>
            <button
              onClick={handleClose}
              className="p-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-200 group"
              aria-label="Close"
            >
              <XMarkIcon className="h-5 w-5 text-primary-background/70 group-hover:text-primary-background transition-colors" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-primary-background/90 mb-2 tracking-wide">
                Category
              </label>
              <ListboxFloating
                value={formData.categoryId || defaultCategory}
                onChange={(v) =>
                  setFormData((s) => ({ ...s, categoryId: v as string }))
                }
                options={categories.map((c) => ({
                  value: c.value,
                  label: c.label,
                }))}
                placement="bottom-start"
                variant="glass"
                renderButton={() => {
                  const label =
                    categories.find((c) => c.value === formData.categoryId)
                      ?.label || "Select category";
                  return (
                    <div className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-left text-black">
                      {label}
                    </div>
                  );
                }}
                optionsClassName="border border-white/30 shadow-2xl ring-1 ring-white/15 text-black"
                optionClassName="text-black hover:!bg-white/40"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-primary-background/90 mb-2 tracking-wide">
                Amount
              </label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) =>
                  setFormData((s) => ({ ...s, amount: e.target.value }))
                }
                className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-primary-background placeholder-primary-background/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-200"
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-primary-background/90 mb-2 tracking-wide">
                Description
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) =>
                  setFormData((s) => ({ ...s, description: e.target.value }))
                }
                className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-primary-background placeholder-primary-background/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-200"
                placeholder="Optional description"
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
                {isEditing ? "Update" : "Add"} Expense
              </Button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
