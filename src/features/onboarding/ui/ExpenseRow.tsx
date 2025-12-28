import { TrashIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { ReqUserExpense as Row } from "@/features/onboarding/model/types";
import { ConfirmationModal, Input } from "@/shared/ui";
import { useOnboarding } from "../model/store";
import { ListboxFloating } from "@/shared/ui";
import { useAuth } from "@/app/providers/AuthProvider";
import { renderBtn } from "../lib";
import { deleteExpense } from "../api";
import { useState } from "react";

interface Props {
  row: Row;
  categories: { value: string; label: string }[];
}

// const FREQUENCIES: Row["frequency"][] = ["monthly", "weekly", "yearly"];
const numberRe = /^-?\d*(\.\d*)?$/;

export function ExpenseRow(props: Props) {
  const [showModal, setModal] = useState<boolean>(false);
  const { categories, row } = props;

  const {
    updateExpense,
    removeExpense,
    errors,
    clearExpenseError,
    originalData,
  } = useOnboarding();
  const { user } = useAuth();
  const rowError = errors.expenses?.[row.id];

  // Find category name by ID
  const categoryName =
    categories.find((cat) => cat.value === row.categoryId)?.label ||
    row.categoryId;

  // Check if this expense has been modified
  const originalExpense = originalData.expenses.find(
    (exp) => exp.id === row.id
  );
  const isModified =
    originalExpense &&
    (originalExpense.categoryId !== row.categoryId ||
      originalExpense.amount !== row.amount ||
      originalExpense.description !== row.description);

  const removeExpenseHandler = (id: string) => {
    removeExpense(id);
    deleteExpense(id);
    setModal(false);
  };

  return (
    <>
      <div
        className={clsx(
          "grid grid-cols-1 gap-2",
          "md:grid-cols-[12rem_1fr_9rem_9rem_3rem] md:items-center my-5"
        )}
      >
        {/* 1. Category */}
        <div className="order-1 md:order-none min-w-0">
          {categories?.length && (
            <ListboxFloating
              value={row.categoryId}
              onChange={(v) =>
                updateExpense(row.id, "categoryId", v, user?.id as string)
              }
              options={categories}
              placement="bottom-start"
              renderButton={() => renderBtn(categoryName)}
              optionsClassName="!bg-black/95"
            />
          )}
        </div>

        {/* 2. Description */}
        <div className="order-2 md:order-none min-w-0">
          <Input
            placeholder="Description"
            value={row.description ?? ""}
            onChange={(e) =>
              updateExpense(
                row.id,
                "description",
                e.target.value,
                user?.id as string
              )
            }
            className={clsx(
              "h-11 min-w-0",
              isModified &&
                originalExpense?.description !== row.description &&
                "ring-2 ring-blue-400/50"
            )}
            containerClassName="h-11"
          />
        </div>

        {/* 3. Amount */}
        <div className="order-3 md:order-none min-w-0">
          <Input
            type="text"
            inputMode="decimal"
            placeholder="0.00"
            value={row.amount}
            onChange={(e) => {
              const v = e.target.value;
              if (v === "" || numberRe.test(v)) {
                updateExpense(row.id, "amount", v, user?.id as string);
                if (v !== "" && rowError) clearExpenseError(row.id);
              }
              if (v !== "" && Number(v) > 0 && rowError) {
                clearExpenseError(row.id);
              }
            }}
            className={clsx(
              "h-11 text-right",
              isModified &&
                originalExpense?.amount !== row.amount &&
                "ring-2 ring-blue-400/50"
            )}
            containerClassName="h-11"
            error={rowError}
          />
        </div>

        {/* 4. Frequency */}
        {/* <div className="order-4 md:order-none min-w-0">
      <ListboxFloating
        value={row.frequency}
        onChange={(v) =>
          updateExpense(row.id, "frequency", v, user?.id as string)
        }
        options={FREQUENCIES as string[]}
        placement="bottom-start"
        renderButton={() => renderBtn(cap(row.frequency))}
        renderOption={(opt) => <span className="capitalize">{opt}</span>}
        optionsClassName="!bg-black/95"
      />
    </div> */}

        {/* 5. Delete */}
        <div className="order-5 md:order-none flex justify-start">
          <button
            aria-label="Remove expense"
            onClick={() => setModal(true)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 hover:bg-white/15 transition-colors"
            title="Delete expense"
          >
            <TrashIcon className="h-5 w-5 text-slate-300" />
          </button>
        </div>
      </div>

      {showModal && (
        <div className="absolute left-0 top-0 h-full w-full bg-red-100">
          <ConfirmationModal
            action={() => removeExpenseHandler(row.id)}
            title="Are you sure you want to delete this expense?"
            cancel={() => setModal(false)}
          />
        </div>
      )}
    </>
  );
}
