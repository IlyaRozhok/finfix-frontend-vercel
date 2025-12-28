import { StateCreator } from "zustand";
import { Installment } from "../types";
import { mkInstallment } from "../../lib/factories";
import { validateInstallments } from "../../lib/validators";
import { hasInstallmentsChanged } from "../../lib/diff";
import { BaseSlice } from "./base.slice";

export interface InstallmentsSlice {
  errors: {
    installments?: Record<string, string>;
  };
  addInstallment: () => void;
  setInstallments: (installments: Installment[]) => void;
  removeInstallment: (id: string) => void;
  updateInstallment: <K extends keyof Installment>(
    id: string,
    k: K,
    v: Installment[K]
  ) => void;
  validateInstallments: () => boolean;
  clearInstallmentError: (id: string) => void;
  hasInstallmentsChanged: () => boolean;
}

export const createInstallmentsSlice: StateCreator<
  InstallmentsSlice & any,
  [],
  [],
  InstallmentsSlice
> = (set, get) => ({
  errors: {
    installments: {},
  },

  addInstallment: () =>
    set((s: InstallmentsSlice & BaseSlice) => ({
      data: {
        ...s.data,
        installments: [...(s.data.installments || []), mkInstallment()],
      },
    })),

  setInstallments: (installments) =>
    set((s: InstallmentsSlice & BaseSlice) => ({
      data: { ...s.data, installments },
      originalData: { ...s.originalData, installments },
    })),

  removeInstallment: (id) =>
    set((s: InstallmentsSlice & BaseSlice) => ({
      data: {
        ...s.data,
        installments: (s.data.installments || []).filter(
          (inst: Installment) => inst.id !== id
        ),
      },
      errors: {
        ...s.errors,
        installments: Object.fromEntries(
          Object.entries(s.errors.installments ?? {}).filter(([k]) => k !== id)
        ),
      },
    })),

  updateInstallment: (id, k, v) =>
    set((s: InstallmentsSlice & BaseSlice) => ({
      data: {
        ...s.data,
        installments: (s.data.installments || []).map((inst: Installment) =>
          inst.id === id ? { ...inst, [k]: v } : inst
        ),
      },
    })),

  validateInstallments: () => {
    const { installments } = get().data;
    const errs = validateInstallments(installments || []);
    set((s: InstallmentsSlice & BaseSlice) => ({ errors: { ...s.errors, installments: errs } }));
    return Object.keys(errs).length === 0;
  },

  clearInstallmentError: (id) =>
    set((s: InstallmentsSlice & BaseSlice) => ({
      errors: {
        ...s.errors,
        installments: { ...(s.errors.installments ?? {}), [id]: "" },
      },
    })),

  hasInstallmentsChanged: () => {
    const { data, originalData } = get();
    return hasInstallmentsChanged(
      data.installments || [],
      originalData.installments || []
    );
  },
});
