import { Debt } from "@/entities/debts/model";

export type Installment = {
  id?: string;
  description: string;
  startDate: string;
  totalAmount: string;
  totalPayments: string;
};

export enum OnboardingStep {
  WELCOME = "Welcome",
  CURRENCY = "Currency",
  INCOMES = "Incomes",
  EXPENSES = "Expenses",
  BANK_DEBT = "debts",
  INSTALLMENTS = "installments",
}

export type OnboardingStepsCfg = {
  id: OnboardingStep;
  path: string;
  title: string;
};

export type OnboardingData = {
  baseCurrency: string;
  incomes: string;
  expenses: ReqUserExpense[];
  debts: Debt[];
  installments?: Installment[];
};

export type ReqUserCurrency = {
  uid: string;
  currency: string;
};

export type ReqUserIncomes = {
  uid: string;
  incomes: string;
};

export type ReqUserExpense = {
  id: string;
  userId: string;
  categoryId: string;
  amount: string;
  description: string;
};

export type ReqCreateUserExpense = {
  id?: string;
  userId: string;
  categoryId: string;
  amount: number | string;
  description?: string;
};

export type ReqCreateDebt = {
  id?: string;
  userId: string;
  totalDebt: string;
  interest: string;
  description?: string;
};

export type ReqCreateInstallment = {
  id?: string;
  userId: string;
  totalAmount: string;
  totalPayments: string;
  description: string;
  startDate: string;
};
