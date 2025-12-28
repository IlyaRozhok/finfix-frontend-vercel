import { TrashIcon } from "@heroicons/react/24/outline";
import { Input } from "@/shared/ui";
import { useOnboarding } from "../model/store";
import { Debt as Row } from "@entities/debts/model";
import { useAuth } from "@/app/providers/AuthProvider";

const numRe = /^-?\d*(\.\d*)?$/;
const pctRe = /^-?\d*(\.\d*)?$/;

export const BankDebtRow = ({ row }: { row: Row }) => {
  const { updateDebt, removeDebt, errors, validateDebtRow } = useOnboarding();
  const { user } = useAuth();

  if (!row.id || !user?.id) {
    return null; // Don't render if no ID or user
  }

  return (
    <div className="grid min-h-[84px] grid-cols-1 gap-2 md:grid-cols-[12rem_14rem_14rem_3rem] md:items-center items-stretch">
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
          if (v === "" || numRe.test(v)) updateDebt(row.id!, "totalDebt", v);
          validateDebtRow(row.id!);
        }}
        onBlur={() => validateDebtRow(row.id!)}
        containerClassName="h-11"
        className="h-full w"
        error={errors.debts?.[row.id!]}
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
          onClick={() => removeDebt(row.id!)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 hover:bg-white/15"
        >
          <TrashIcon className="h-5 w-5 text-slate-300" />
        </button>
      </div>
    </div>
  );
};
