import { StateCreator } from "zustand";
import { BaseSlice } from "./base.slice";

export interface IncomesSlice {
  errors: {
    incomes: string;
  };
  setIncomes: (amount: string) => void;
  setIncomesError: (message: string) => void;
  clearIncomesError: () => void;
}

export const createIncomesSlice: StateCreator<
  IncomesSlice & any,
  [],
  [],
  IncomesSlice
> = (set, get) => ({
  errors: {
    incomes: "",
  },

  setIncomes: (amount) =>
    set((s: IncomesSlice & BaseSlice) => ({ data: { ...s.data, incomes: amount } })),

  setIncomesError: (message) =>
    set((s: IncomesSlice & BaseSlice) => ({ errors: { ...s.errors, incomes: message } })),

  clearIncomesError: () =>
    set((s: IncomesSlice & BaseSlice) => ({ errors: { ...s.errors, incomes: "" } })),
});

