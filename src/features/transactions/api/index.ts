import { api } from "@/shared/api/axios";

export interface Category {
  id: string;
  name: string;
  userId: string | null;
}

export interface Installment {
  id: string;
  description: string;
  totalAmount: string;
  totalPayments: number;
  remainingPayments: number;
  monthlyPayment: string;
  startDate: string;
}

export interface Debt {
  id: string;
  description: string;
  totalDebt: string;
  monthlyPayment: string;
  interest: string;
  isClosed: boolean;
}

export interface Transaction {
  id: string;
  userId: string;
  type: string;
  direction: string;
  amount: string;
  occurredAt: string;
  categoryId?: string;
  installmentId?: string;
  debtId?: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTransactionData {
  type: string;
  direction: string;
  amount: string;
  occurredAt: string;
  categoryId?: string;
  installmentId?: string;
  debtId?: string;
  note?: string;
}

export const fetchCategories = async (): Promise<Category[]> => {
  try {
    const response = await api.get("api/onboarding/categories");
    return response.data;
  } catch (err) {
    console.error("Failed to fetch categories:", err);
    throw err;
  }
};

export const fetchInstallments = async (): Promise<Installment[]> => {
  try {
    const response = await api.get("api/installments");
    return response.data;
  } catch (err) {
    console.error("Failed to fetch installments:", err);
    throw err;
  }
};

export const fetchDebts = async (): Promise<Debt[]> => {
  try {
    const response = await api.get("api/debts");
    return response.data;
  } catch (err) {
    console.error("Failed to fetch debts:", err);
    throw err;
  }
};

export const fetchTransactions = async (): Promise<Transaction[]> => {
  try {
    const response = await api.get("api/transactions");
    return response.data;
  } catch (err) {
    console.error("Failed to fetch transactions:", err);
    throw err;
  }
};

export const createTransaction = async (
  data: CreateTransactionData
): Promise<Transaction> => {
  try {
    const response = await api.post("api/transactions", data);
    return response.data;
  } catch (err) {
    console.error("Failed to create transaction:", err);
    throw err;
  }
};

export const deleteTransaction = async (id: string): Promise<void> => {
  try {
    await api.delete(`api/transactions/${id}`);
  } catch (err) {
    console.error("Failed to delete transaction:", err);
    throw err;
  }
};
