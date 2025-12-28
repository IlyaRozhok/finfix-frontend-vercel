import { Debt } from "@/entities/debts/model";

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

export type DashboardStats = {
  incomes: number;
  debts: Debt[];
  expenses: Expense[];
  installments: Installment[];
  monthlyNetworth: number;
  monthlyObligations: number;
};

