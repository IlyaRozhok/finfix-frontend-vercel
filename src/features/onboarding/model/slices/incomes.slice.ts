import { StateCreator } from "zustand";

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
    set((s) => ({ data: { ...s.data, incomes: amount } })),

  setIncomesError: (message) =>
    set((s) => ({ errors: { ...s.errors, incomes: message } })),

  clearIncomesError: () =>
    set((s) => ({ errors: { ...s.errors, incomes: "" } })),
});

