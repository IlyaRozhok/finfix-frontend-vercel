import { Debt } from "@/entities/debts/model";
import { Transaction } from "@/features/transactions/api";

export type Category = {
  id: string;
  userId: string | null;
  name: string;
};

export type Expense = {
  id: string;
  userId: string;
  categoryId: string;
  description: string;
  amount: string;
  createdAt: string;
  updatedAt: string;
  category: Category;
};

export type Installment = {
  id: string;
  userId: string;
  description: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
  monthlyPayment: number;
  totalPayments: number;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type ExpenseTransaction = {
  id: string;
  userId: string;
  type: string;
  direction: string;
  amount: string;
  occurredAt: string;
  categoryId?: string;
  category?: Category;
  installmentId?: string;
  debtId?: string;
  accountId?: string;
  account?: {
    id: string;
    name: string;
    assetCode: string;
  };
  note?: string;
  createdAt: string;
  updatedAt: string;
};

export type DashboardStats = {
  incomes: number;
  debts: Debt[];
  expenses: Expense[];
  expenseTransactions?: ExpenseTransaction[];
  installments: Installment[];
  monthlyNetworth: number;
  monthlyObligations: number;
};

export type AccountOverviewStats = {
  balance: number;
  monthlyExpenses: ExpenseTransaction[];
  monthlyIncomes: number;
  monthlyTransactions?: Transaction[];
};
