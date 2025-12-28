import { api } from "@/shared/api/axios";

export interface Debt {
  id: string;
  userId: string;
  description: string;
  debtType: string;
  totalDebt: string;
  monthlyPayment: string | null;
  interest: string | null;
  gracePeriodDays: number | null;
  startDate: string;
  statementDay: number | null;
  dueDay: number | null;
  isClosed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDebtData {
  userId: string;
  description: string;
  totalDebt: string;
  interest: string;
}

export interface UpdateDebtData {
  userId: string;
  description?: string;
  totalDebt?: string;
  interest?: string;
}

export const fetchDebts = async (): Promise<Debt[]> => {
  try {
    const response = await api.get("api/debts");
    return response.data;
  } catch (err) {
    console.error("Failed to fetch debts:", err);
    throw err;
  }
};

export const createDebt = async (data: CreateDebtData): Promise<Debt[]> => {
  try {
    const response = await api.post("api/debts/create", [data]);
    return response.data;
  } catch (err) {
    console.error("Failed to create debt:", err);
    throw err;
  }
};

export const updateDebt = async (
  id: string,
  data: UpdateDebtData
): Promise<Debt> => {
  try {
    const response = await api.put(`api/debts/${id}`, data);
    return response.data;
  } catch (err) {
    console.error("Failed to update debt:", err);
    throw err;
  }
};

export const deleteDebt = async (id: string): Promise<void> => {
  try {
    await api.delete(`api/debts/${id}`);
  } catch (err) {
    console.error("Failed to delete debt:", err);
    throw err;
  }
};
