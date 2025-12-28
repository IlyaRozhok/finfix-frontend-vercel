import { TrashIcon } from "@heroicons/react/24/outline";
import { Input } from "@/shared/ui";
import { Installment } from "@/features/onboarding/model/types";
import { useState } from "react";
import { calcMonthlyInstallmentPayment } from "../lib/calcMonthlyInstallmentPayment";

const numRe = /^-?\d*(\.\d*)?$/;

export const InstallmentRow = ({
  row,
  onUpdate,
  onRemove,
}: {
  row: Installment;
  onUpdate: (id: string, key: string, value: string) => void;
  onRemove: (id: string) => void;
}) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  return (
    <div className="grid min-h-[44px] grid-cols-1 gap-2 md:grid-cols-[12rem_10rem_10rem_10rem_8rem_3rem] md:items-center items-stretch">
      <Input
        placeholder="Description"
        value={row.description}
        onChange={(e) => onUpdate(row.id, "description", e.target.value)}
        containerClassName="h-11"
        className="h-full"
      />

      <Input
        type="date"
        value={row.startDate}
        onChange={(e) => onUpdate(row.id, "startDate", e.target.value)}
        containerClassName="h-11"
        className="h-full"
      />

      <Input
        placeholder="Total amount"
        inputMode="decimal"
        value={row.totalAmount}
        onChange={(e) => {
          const v = e.target.value;
          if (v === "" || numRe.test(v)) onUpdate(row.id, "totalAmount", v);
        }}
        containerClassName="h-11"
        className="h-full"
      />

      <Input
        placeholder="Total payments"
        type="number"
        value={row.totalPayments}
        onChange={(e) => onUpdate(row.id, "totalPayments", e.target.value)}
        containerClassName="h-11"
        className="h-full"
      />

      <div className="text-sm text-slate-300 self-center">
        {row.totalAmount && row.totalPayments
          ? `${calcMonthlyInstallmentPayment(
              row.totalAmount,
              row.totalPayments
            )}/mo`
          : "-"}
      </div>

      <div className="flex">
        <button
          aria-label="Remove installment"
          onClick={() => setShowDeleteModal(true)}
          className="ml-auto p-2 rounded-lg bg-black hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors"
        >
          <TrashIcon className="h-5 w-5" />
        </button>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-slate-200/20 rounded-xl backdrop-blur-[2px] p-6 max-w-sm w-full mx-4 border border-gray-700">
            <h3 className="text-lg font-semibold text-slate-200 mb-2">
              Delete installment?
            </h3>
            <p className="text-sm text-slate-400 mb-4">
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              Total estimation
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-500 text-black transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onRemove(row.id);
                  setShowDeleteModal(false);
                }}
                className="flex-1 px-4 py-2 rounded-lg bg-black hover:bg-gray-700/70 text-red-500 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
