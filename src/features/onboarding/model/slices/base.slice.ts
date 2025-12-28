import { StateCreator } from "zustand";
import { OnboardingData } from "../types";

export interface BaseSlice {
  data: OnboardingData;
  originalData: OnboardingData;
  setCurrencyLocally: (currency: string) => void;
  initializeFromSummary: (summary: {
    currency?: string;
    incomes?: number | string;
    expenses?: Array<{
      id: string;
      userId: string;
      categoryId: string;
      amount: string;
      description: string;
    }>;
    debts?: Array<{
      id: string;
      description: string;
      totalDebt: string;
      interest: string;
    }>;
    installments?: Array<{
      id: string;
      description: string;
      startDate: string;
      totalAmount: number;
      totalPayments: number;
    }>;
    installmnets?: Array<{
      id: string;
      description: string;
      startDate: string;
      totalAmount: number;
      totalPayments: number;
    }>;
  }) => void;
}

export const createBaseSlice: StateCreator<
  BaseSlice & any,
  [],
  [],
  BaseSlice
> = (set, get) => ({
  data: {
    baseCurrency: "UAH",
    incomes: "",
    expenses: [],
    debts: [],
    installments: [],
  },
  originalData: {
    baseCurrency: "UAH",
    incomes: "",
    expenses: [],
    debts: [],
    installments: [],
  },

  setCurrencyLocally: (currency) =>
    set((s) => ({ data: { ...s.data, baseCurrency: currency } })),

  initializeFromSummary: (summary) => {
    const newData: Partial<OnboardingData> = {};
    const newOriginalData: Partial<OnboardingData> = {};

    // Set currency
    if (summary.currency) {
      newData.baseCurrency = summary.currency;
      newOriginalData.baseCurrency = summary.currency;
    }

    // Set incomes
    if (summary.incomes !== undefined) {
      const incomesStr = String(summary.incomes);
      newData.incomes = incomesStr;
      newOriginalData.incomes = incomesStr;
    }

    // Set expenses
    if (summary.expenses && summary.expenses.length > 0) {
      const transformedExpenses = summary.expenses.map((exp) => ({
        id: exp.id,
        userId: exp.userId,
        categoryId: exp.categoryId,
        amount: exp.amount,
        description: exp.description || "",
      }));
      newData.expenses = transformedExpenses;
      newOriginalData.expenses = transformedExpenses;
    }

    // Set debts
    if (summary.debts && summary.debts.length > 0) {
      const transformedDebts = summary.debts.map((debt) => ({
        id: debt.id,
        description: debt.description || "",
        totalDebt: debt.totalDebt,
        interest: debt.interest,
      }));
      newData.debts = transformedDebts;
      newOriginalData.debts = transformedDebts;
    }

    // Set installments (handle both typo and correct spelling from backend)
    const installments = summary.installments || summary.installmnets;
    if (installments && installments.length > 0) {
      const transformedInstallments = installments.map((inst) => ({
        id: inst.id,
        description: inst.description || "",
        startDate: inst.startDate,
        totalAmount: String(inst.totalAmount),
        totalPayments: String(inst.totalPayments),
      }));
      newData.installments = transformedInstallments;
      newOriginalData.installments = transformedInstallments;
    }

    // Update store with new data
    set((s) => ({
      data: { ...s.data, ...newData },
      originalData: { ...s.originalData, ...newOriginalData },
    }));
  },
});

