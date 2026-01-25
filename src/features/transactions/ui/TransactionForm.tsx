import { useEffect, useMemo, useState } from "react";
import { Dialog } from "@headlessui/react";
import { Button } from "@/shared/ui/Button";
import { ListboxFloating, useToast } from "@/shared/ui";
import { XMarkIcon } from "@heroicons/react/24/outline";
import {
  createTransaction,
  fetchCategories,
  fetchDebts,
  fetchInstallments,
  type Category,
  type Installment,
  type Debt,
} from "../api";
import { fetchAccounts, type Account } from "@/features/accounts/api";
import { TransactionType, TransactionDirection, TransactionFormData } from "../model/types";

type TransactionFormProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => Promise<void>;
};

export function TransactionForm({
  isOpen,
  onClose,
  onSubmit,
}: TransactionFormProps) {
  const { addToast } = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Helper function to format date to DD.MM.YYYY
  const formatDateToDDMMYYYY = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  // Helper function to convert DD.MM.YYYY to ISO string
  const parseDDMMYYYYToISO = (dateString: string): string => {
    const parts = dateString.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid date format');
    }
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
    const year = parseInt(parts[2], 10);
    const date = new Date(year, month, day);
    return date.toISOString();
  };

  // Helper function to format input with mask
  const formatDateInput = (value: string): string => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, '');
    
    // Apply mask DD.MM.YYYY
    if (digits.length <= 2) {
      return digits;
    } else if (digits.length <= 4) {
      return `${digits.slice(0, 2)}.${digits.slice(2)}`;
    } else {
      return `${digits.slice(0, 2)}.${digits.slice(2, 4)}.${digits.slice(4, 8)}`;
    }
  };

  const [formData, setFormData] = useState<TransactionFormData>({
    type: TransactionType.CATEGORY_BASED,
    direction: TransactionDirection.EXPENSE,
    amount: "",
    occurredAt: formatDateToDDMMYYYY(new Date()), // DD.MM.YYYY format
    categoryId: "",
    installmentId: "",
    debtId: "",
    accountId: "",
    note: "",
  });

  const typeOptions = useMemo(() => [
    { value: TransactionType.CATEGORY_BASED, label: "Category Based" },
    { value: TransactionType.INSTALLMENT_PAYMENT, label: "Installment Payment" },
    { value: TransactionType.DEBT_PAYMENT, label: "Debt Payment" },
    { value: TransactionType.TRANSFER, label: "Transfer" },
    { value: TransactionType.INCOME_REGULAR, label: "Regular Income" },
    { value: TransactionType.INCOME_EVENT, label: "Event Income" },
  ], []);

  const directionOptions = useMemo(() => [
    { value: TransactionDirection.EXPENSE, label: "Expense" },
    { value: TransactionDirection.INCOME, label: "Income" },
  ], []);

  const categoryOptions = useMemo(() =>
    categories.map(cat => ({ value: cat.id, label: cat.name })),
    [categories]
  );

  const installmentOptions = useMemo(() =>
    installments.map(inst => ({ value: inst.id, label: inst.description })),
    [installments]
  );

  const debtOptions = useMemo(() =>
    debts.map(debt => ({ value: debt.id, label: debt.description })),
    [debts]
  );

  const accountOptions = useMemo(() =>
    accounts.map(account => ({ value: account.id, label: `${account.name} (${account.assetCode})` })),
    [accounts]
  );

  useEffect(() => {
    if (!isOpen) return;

    const loadData = async () => {
      setIsLoadingData(true);
      try {
        const [categoriesData, installmentsData, debtsData, accountsData] = await Promise.all([
          fetchCategories(),
          fetchInstallments(),
          fetchDebts(),
          fetchAccounts(),
        ]);
        setCategories(categoriesData);
        setInstallments(installmentsData);
        setDebts(debtsData);
        setAccounts(accountsData);
      } catch (error) {
        console.error("Failed to load form data:", error);
        addToast("error", "Load failed", "Failed to load form data. Please try again.");
      } finally {
        setIsLoadingData(false);
      }
    };

    loadData();
  }, [isOpen, addToast]);

  const handleClose = () => {
    setFormData({
      type: TransactionType.CATEGORY_BASED,
      direction: TransactionDirection.EXPENSE,
      amount: "",
      occurredAt: formatDateToDDMMYYYY(new Date()),
      categoryId: "",
      installmentId: "",
      debtId: "",
      accountId: "",
      note: "",
    });
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.amount || Number(formData.amount) <= 0) {
      addToast("error", "Invalid amount", "Enter a positive amount.");
      return;
    }

    if (!formData.occurredAt) {
      addToast("error", "Invalid date", "Please enter a date.");
      return;
    }

    // Validate date format DD.MM.YYYY
    const dateRegex = /^(\d{2})\.(\d{2})\.(\d{4})$/;
    if (!dateRegex.test(formData.occurredAt)) {
      addToast("error", "Invalid date format", "Please enter date in DD.MM.YYYY format.");
      return;
    }

    // Validate date values
    try {
      const isoDate = parseDDMMYYYYToISO(formData.occurredAt);
      const date = new Date(isoDate);
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date');
      }
    } catch (error) {
      addToast("error", "Invalid date", "Please enter a valid date.");
      return;
    }

    // Validation based on transaction type
    if (formData.type === TransactionType.CATEGORY_BASED && !formData.categoryId) {
      addToast("error", "Category required", "Please select a category for category-based transactions.");
      return;
    }

    if (formData.type === TransactionType.INSTALLMENT_PAYMENT && !formData.installmentId) {
      addToast("error", "Installment required", "Please select an installment for installment payments.");
      return;
    }

    if (formData.type === TransactionType.DEBT_PAYMENT && !formData.debtId) {
      addToast("error", "Debt required", "Please select a debt for debt payments.");
      return;
    }

    try {
      // Convert DD.MM.YYYY to ISO string
      const isoDate = parseDDMMYYYYToISO(formData.occurredAt);
      
      const transactionData: any = {
        type: formData.type,
        direction: formData.direction,
        amount: formData.amount,
        occurredAt: isoDate,
      };

      // Only include categoryId if it's not empty
      if (formData.categoryId && formData.categoryId.trim() !== "") {
        transactionData.categoryId = formData.categoryId;
      }

      // Only include installmentId if it's not empty
      if (formData.installmentId && formData.installmentId.trim() !== "") {
        transactionData.installmentId = formData.installmentId;
      }

      // Only include debtId if it's not empty
      if (formData.debtId && formData.debtId.trim() !== "") {
        transactionData.debtId = formData.debtId;
      }

      // Only include accountId if it's not empty
      if (formData.accountId && formData.accountId.trim() !== "") {
        transactionData.accountId = formData.accountId;
      }

      // Only include note if it's not empty
      if (formData.note && formData.note.trim() !== "") {
        transactionData.note = formData.note;
      }

      await createTransaction(transactionData);

      addToast("success", "Transaction created", "Transaction created successfully.");
      await onSubmit();
      handleClose();
    } catch (error: any) {
      console.error("Failed to create transaction:", error);

      // Extract validation error message from API response
      let errorMessage = "Please try again.";
      let errorTitle = "Create failed";

      if (error?.response?.data) {
        const responseData = error.response.data;

        // Handle different error response formats
        if (typeof responseData === 'string') {
          errorMessage = responseData;
        } else if (responseData.message) {
          errorMessage = responseData.message;
          // Use a more specific title if available
          if (responseData.error) {
            errorTitle = responseData.error;
          }
        } else if (responseData.error && typeof responseData.error === 'string') {
          errorMessage = responseData.error;
        } else if (Array.isArray(responseData.message)) {
          // Handle array of validation messages
          errorMessage = responseData.message.join(', ');
        }
      }

      addToast("error", errorTitle, errorMessage);
    }
  };

  const shouldShowCategory = formData.type === TransactionType.CATEGORY_BASED;
  const shouldShowInstallment = formData.type === TransactionType.INSTALLMENT_PAYMENT;
  const shouldShowDebt = formData.type === TransactionType.DEBT_PAYMENT;

  return (
    <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/20 backdrop-blur-xl" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/30 shadow-2xl max-w-md w-full p-8 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-8">
            <Dialog.Title className="text-2xl font-bold text-primary-background tracking-tight">
              Add Transaction
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
                Transaction Type
              </label>
              <ListboxFloating
                value={formData.type}
                onChange={(v) => setFormData((s) => ({
                  ...s,
                  type: v as TransactionType,
                  // Reset related fields when type changes
                  categoryId: "",
                  installmentId: "",
                  debtId: "",
                }))}
                options={typeOptions}
                placement="bottom-start"
                variant="glass"
                renderButton={() => {
                  const label = typeOptions.find((t) => t.value === formData.type)?.label || "Select type";
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
                Direction
              </label>
              <ListboxFloating
                value={formData.direction}
                onChange={(v) => setFormData((s) => ({ ...s, direction: v as TransactionDirection }))}
                options={directionOptions}
                placement="bottom-start"
                variant="glass"
                renderButton={() => {
                  const label = directionOptions.find((d) => d.value === formData.direction)?.label || "Select direction";
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

            {shouldShowCategory && (
              <div>
                <label className="block text-sm font-semibold text-primary-background/90 mb-2 tracking-wide">
                  Category
                </label>
                <ListboxFloating
                  value={formData.categoryId || ""}
                  onChange={(v) => setFormData((s) => ({ ...s, categoryId: v as string }))}
                  options={categoryOptions}
                  placement="bottom-start"
                  variant="glass"
                  renderButton={() => {
                    const label = categoryOptions.find((c) => c.value === formData.categoryId)?.label || "Select category";
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
            )}

            {shouldShowInstallment && (
              <div>
                <label className="block text-sm font-semibold text-primary-background/90 mb-2 tracking-wide">
                  Installment
                </label>
                <ListboxFloating
                  value={formData.installmentId || ""}
                  onChange={(v) => setFormData((s) => ({ ...s, installmentId: v as string }))}
                  options={installmentOptions}
                  placement="bottom-start"
                  variant="glass"
                  renderButton={() => {
                    const label = installmentOptions.find((i) => i.value === formData.installmentId)?.label || "Select installment";
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
            )}

            {shouldShowDebt && (
              <div>
                <label className="block text-sm font-semibold text-primary-background/90 mb-2 tracking-wide">
                  Debt
                </label>
                <ListboxFloating
                  value={formData.debtId || ""}
                  onChange={(v) => setFormData((s) => ({ ...s, debtId: v as string }))}
                  options={debtOptions}
                  placement="bottom-start"
                  variant="glass"
                  renderButton={() => {
                    const label = debtOptions.find((d) => d.value === formData.debtId)?.label || "Select debt";
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
            )}

            <div>
              <label className="block text-sm font-semibold text-primary-background/90 mb-2 tracking-wide">
                Amount
              </label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData((s) => ({ ...s, amount: e.target.value }))}
                className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-primary-background placeholder-primary-background/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-200"
                placeholder="0.00"
                step="0.01"
                min="0"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-primary-background/90 mb-2 tracking-wide">
                Account
              </label>
              <ListboxFloating
                value={formData.accountId || ""}
                onChange={(v) => setFormData((s) => ({ ...s, accountId: v as string }))}
                options={accountOptions}
                placement="bottom-start"
                variant="glass"
                renderButton={() => {
                  const label = accountOptions.find((a) => a.value === formData.accountId)?.label || "Select account";
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
                Date (DD.MM.YYYY)
              </label>
              <input
                type="text"
                value={formData.occurredAt}
                onChange={(e) => {
                  const formatted = formatDateInput(e.target.value);
                  setFormData((s) => ({ ...s, occurredAt: formatted }));
                }}
                placeholder="DD.MM.YYYY"
                maxLength={10}
                className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-primary-background placeholder-primary-background/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-200"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-primary-background/90 mb-2 tracking-wide">
                Note (Optional)
              </label>
              <input
                type="text"
                value={formData.note}
                onChange={(e) => setFormData((s) => ({ ...s, note: e.target.value }))}
                className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-primary-background placeholder-primary-background/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-200"
                placeholder="Optional note"
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
                disabled={isLoadingData}
              >
                {isLoadingData ? "Loading..." : "Add Transaction"}
              </Button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
