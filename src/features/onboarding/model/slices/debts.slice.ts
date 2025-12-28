import { StateCreator } from "zustand";
import { Debt } from "@/entities/debts/model";
import { mkDebt } from "../../lib/factories";
import { validateDebts, isEmptyDebt, isValidDebt } from "../../lib/validators";
import { hasDebtsChanged } from "../../lib/diff";
import { BaseSlice } from "./base.slice";

export interface DebtsSlice {
  errors: {
    debts?: Record<string, string>;
  };
  addDebt: () => void;
  setDebts: (debts: Debt[]) => void;
  removeDebtLocally: (id: string) => void;
  updateDebt: <K extends keyof Debt>(id: string, k: K, v: Debt[K]) => void;
  validateDebts: () => boolean;
  clearDebtError: (id: string) => void;
  validateDebtRow: (id: string) => void;
  hasDebtsChanged: () => boolean;
}

export const createDebtsSlice: StateCreator<
  DebtsSlice & any,
  [],
  [],
  DebtsSlice
> = (set, get) => ({
  errors: {
    debts: {},
  },

  addDebt: () =>
    set((s: DebtsSlice & BaseSlice) => ({ data: { ...s.data, debts: [...s.data.debts, mkDebt()] } })),

  setDebts: (debts) =>
    set((s: DebtsSlice & BaseSlice) => ({
      data: { ...s.data, debts },
      originalData: { ...s.originalData, debts },
    })),

  removeDebtLocally: (id) => {
    set((s: DebtsSlice & BaseSlice) => ({
      data: { ...s.data, debts: s.data.debts.filter((d: Debt) => d.id !== id) },
      errors: {
        ...s.errors,
        debts: Object.fromEntries(
          Object.entries(s.errors.debts ?? {}).filter(([k]) => k !== id)
        ),
      },
    }));
  },

  updateDebt: (id, k, v) => {
    set((s: DebtsSlice & BaseSlice) => {
      const debts = s.data.debts.map((d: Debt) =>
        d.id === id ? { ...d, [k]: v } : d
      );

      const row = debts.find((d: Debt) => d.id === id)!;
      const debtsErrors = { ...(s.errors.debts ?? {}) };

      if (isEmptyDebt(row) || isValidDebt(row)) {
        debtsErrors[id] = "";
      }

      return {
        data: { ...s.data, debts },
        errors: { ...s.errors, debts: debtsErrors },
      };
    });
  },

  validateDebts: () => {
    const { debts } = get().data;
    const errs = validateDebts(debts);
    set((s: DebtsSlice & BaseSlice) => ({ errors: { ...s.errors, debts: errs } }));
    return Object.keys(errs).length === 0;
  },

  clearDebtError: (id) =>
    set((s: DebtsSlice & BaseSlice) => ({
      errors: { ...s.errors, debts: { ...(s.errors.debts ?? {}), [id]: "" } },
    })),

  validateDebtRow: (id) =>
    set((s: DebtsSlice & BaseSlice) => {
      const row = s.data.debts.find((d: Debt) => d.id === id);
      if (!row) return s;

      const debtsErrors = { ...(s.errors.debts ?? {}) };
      // Note: Current implementation doesn't add errors for debt rows
      return { ...s, errors: { ...s.errors, debts: debtsErrors } };
    }),

  hasDebtsChanged: () => {
    const { data, originalData } = get();
    return hasDebtsChanged(data.debts, originalData.debts);
  },
});

