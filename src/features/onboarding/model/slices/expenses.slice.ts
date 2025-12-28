import { StateCreator } from "zustand";
import { ReqUserExpense } from "../types";
import { mkExpenseRow } from "../../lib/factories";
import { validateExpenses } from "../../lib/validators";
import { hasExpensesChanged } from "../../lib/diff";
import { BaseSlice } from "./base.slice";

export interface ExpensesSlice {
  errors: {
    expenses?: Record<string, string>;
  };
  addExpense: (categoryId?: string) => void;
  setExpenses: (expenses: ReqUserExpense[]) => void;
  removeExpense: (id: string) => void;
  updateExpense: <K extends keyof ReqUserExpense>(
    id: string,
    key: K,
    value: ReqUserExpense[K],
    userId: string
  ) => void;
  validateExpenses: () => boolean;
  clearExpenseError: (id: string) => void;
  hasExpensesChanged: () => boolean;
}

export const createExpensesSlice: StateCreator<
  ExpensesSlice & any,
  [],
  [],
  ExpensesSlice
> = (set, get) => ({
  errors: {
    expenses: {},
  },

  addExpense: (categoryId) =>
    set((s: ExpensesSlice & BaseSlice) => ({
      data: {
        ...s.data,
        expenses: [...s.data.expenses, mkExpenseRow(categoryId)],
      },
    })),

  setExpenses: (expenses) =>
    set((s: ExpensesSlice & BaseSlice) => ({
      data: { ...s.data, expenses },
      originalData: { ...s.originalData, expenses },
    })),

  removeExpense: (id) =>
    set((s: ExpensesSlice & BaseSlice) => ({
      data: {
        ...s.data,
        expenses: s.data.expenses.filter((e: ReqUserExpense) => e.id !== id),
      },
      errors: {
        ...s.errors,
        expenses: Object.fromEntries(
          Object.entries(s.errors.expenses ?? {}).filter(([k]) => k !== id)
        ),
      },
    })),

  updateExpense: (id, key, value, userId) =>
    set((s: ExpensesSlice & BaseSlice) => ({
      data: {
        ...s.data,
        expenses: s.data.expenses.map((e: ReqUserExpense) =>
          e.id === id ? { ...e, [key]: value, userId } : e
        ),
      },
    })),

  validateExpenses: () => {
    const { expenses } = get().data;
    const errs = validateExpenses(expenses);
    set((s: ExpensesSlice & BaseSlice) => ({ errors: { ...s.errors, expenses: errs } }));
    return Object.keys(errs).length === 0;
  },

  clearExpenseError: (id) =>
    set((s: ExpensesSlice & BaseSlice) => ({
      errors: {
        ...s.errors,
        expenses: {
          ...(s.errors.expenses ?? {}),
          [id]: "",
        },
      },
    })),

  hasExpensesChanged: () => {
    const { data, originalData } = get();
    return hasExpensesChanged(data.expenses, originalData.expenses);
  },
});
