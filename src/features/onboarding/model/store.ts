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

export const useOnboarding = create<OnboardingState>((set, get, api) => {
  const baseSlice = createBaseSlice(set, get, api);
  const incomesSlice = createIncomesSlice(set, get, api);
  const expensesSlice = createExpensesSlice(set, get, api);
  const debtsSlice = createDebtsSlice(set, get, api);
  const installmentsSlice = createInstallmentsSlice(set, get, api);

  return {
    ...baseSlice,
    ...incomesSlice,
    ...expensesSlice,
    ...debtsSlice,
    ...installmentsSlice,
    // Merge errors objects properly
    errors: {
      ...incomesSlice.errors,
      ...expensesSlice.errors,
      ...debtsSlice.errors,
      ...installmentsSlice.errors,
    },
    // Additional methods
    setCurrency: async (userId, currency) => {
      await updateCurrency(userId, currency, get());
    },

    removeDebt: async (id) => {
      await deleteDebtAndUpdateStore(id, get());
    },
  };
});
