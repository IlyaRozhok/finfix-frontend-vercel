import { OnboardingData } from "../model/types";
import { Debt } from "@/entities/debts/model";

export interface OnboardingSummary {
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
}

export const initializeDataFromSummary = (summary: OnboardingSummary): Partial<OnboardingData> => {
  const newData: Partial<OnboardingData> = {};

  // Set currency
  if (summary.currency) {
    newData.baseCurrency = summary.currency;
  }

  // Set incomes
  if (summary.incomes !== undefined) {
    newData.incomes = String(summary.incomes);
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
  }

  // Set debts
  if (summary.debts && summary.debts.length > 0) {
    const transformedDebts: Debt[] = summary.debts.map((debt) => ({
      id: debt.id,
      userId: "",
      description: debt.description || "",
      debtType: "",
      totalDebt: debt.totalDebt,
      monthlyPayment: "",
      interest: debt.interest,
      gracePeriodDays: null,
      startDate: "",
      statementDay: null,
      dueDay: null,
      isClosed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
    newData.debts = transformedDebts;
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
  }

  return newData;
};

