import { create } from "zustand";
import { createBaseSlice, BaseSlice } from "./slices/base.slice";
import { createIncomesSlice, IncomesSlice } from "./slices/incomes.slice";
import { createExpensesSlice, ExpensesSlice } from "./slices/expenses.slice";
import { createDebtsSlice, DebtsSlice } from "./slices/debts.slice";
import { createInstallmentsSlice, InstallmentsSlice } from "./slices/installments.slice";
import { updateCurrency, deleteDebtAndUpdateStore } from "../api/service";

type OnboardingState = BaseSlice &
  IncomesSlice &
  ExpensesSlice &
  DebtsSlice &
  InstallmentsSlice & {
    // Additional methods that combine multiple slices or need external dependencies
    setCurrency: (userId: string, currency: string) => Promise<void>;
    removeDebt: (id: string) => Promise<void>;
  };

export const useOnboarding = create<OnboardingState>((set, get, api) => ({
  ...createBaseSlice(set, get, api),
  ...createIncomesSlice(set, get, api),
  ...createExpensesSlice(set, get, api),
  ...createDebtsSlice(set, get, api),
  ...createInstallmentsSlice(set, get, api),

  // Additional methods
  setCurrency: async (userId, currency) => {
    await updateCurrency(userId, currency, get());
  },

  removeDebt: async (id) => {
    await deleteDebtAndUpdateStore(id, get());
  },
}));
