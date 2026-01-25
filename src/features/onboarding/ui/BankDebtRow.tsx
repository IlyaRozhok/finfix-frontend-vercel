import { TrashIcon } from "@heroicons/react/24/outline";
import { Input, useToast } from "@/shared/ui";
import { useOnboarding } from "../model/store";
import { Debt as Row } from "@entities/debts/model";
import { useAuth } from "@/app/providers/AuthProvider";
import { deleteDebt } from "../api";

const numRe = /^-?\d*(\.\d*)?$/;
const pctRe = /^-?\d*(\.\d*)?$/;

export const BankDebtRow = ({ row }: { row: Row }) => {
  const { updateDebt, removeDebtLocally, errors, validateDebtRow, clearDebtError, originalData } = useOnboarding();
  const { user } = useAuth();
  const { addToast } = useToast();
  const rowError = errors.debts?.[row.id!];

  if (!row.id || !user?.id) {
    return null; // Don't render if no ID or user
  }

  const handleRemoveDebt = async () => {
    try {
      const debtExistsOnServer = originalData.debts.some((debt) => debt.id === row.id);
      
      // Remove locally first for immediate UI update
      removeDebtLocally(row.id!);
      
      // Then delete from server if it exists there
      if (debtExistsOnServer) {
        await deleteDebt(row.id!);
      }
      
      addToast("success", "Debt deleted", "Debt successfully deleted");
    } catch (error) {
      addToast("error", "Error", "Failed to delete debt");
      console.error("Failed to delete debt:", error);
    }
  };

  return (
    <div className="grid min-h-[55px] grid-cols-1 gap-2 w-full md:grid-cols-[12rem_1fr_14rem_3rem] md:items-center items-stretch">
      <Input
        placeholder="Description"
        value={row.description}
        onChange={(e) => updateDebt(row.id!, "description", e.target.value)}
        containerClassName="h-11"
        className="h-full"
      />
      <Input
        placeholder="Total debt value (decimal)"
        inputMode="decimal"
        value={row.totalDebt}
        onChange={(e) => {
          const v = e.target.value;
          if (v === "" || numRe.test(v)) {
            updateDebt(row.id!, "totalDebt", v);
            if (v !== "" && Number(v) > 0 && rowError) {
              clearDebtError(row.id!);
            }
          }
          validateDebtRow(row.id!);
        }}
        onBlur={() => validateDebtRow(row.id!)}
        containerClassName="h-11"
        className="h-full"
        error={rowError}
      />
      <Input
        placeholder="Monthly interest (% decimal)"
        inputMode="decimal"
        value={row.interest}
        onChange={(e) => {
          const v = e.target.value;
          if (v === "" || pctRe.test(v)) updateDebt(row.id!, "interest", v);
        }}
        containerClassName="h-11"
        className="h-full"
      />
      <div className="flex">
        <button
          aria-label="Remove debt"
          onClick={handleRemoveDebt}
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 hover:bg-white/15 transition-colors"
        >
          <TrashIcon className="h-5 w-5 text-primary-background/70" />
        </button>
      </div>
    </div>
  );
};
