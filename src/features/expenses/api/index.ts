import { api } from "@/shared/api/axios";
import { Expense } from "../model/types";

export const fetchUserExpenses = async (): Promise<Expense[]> => {
  try {
    const response = await api.get("api/expenses");
    return response.data;
  } catch (err) {
    console.error("Failed to fetch user expenses:", err);
    throw err;
  }
};

export const createExpense = async (data: {
  categoryId: string;
  amount: string;
  description?: string;
}): Promise<Expense> => {
  try {
    const response = await api.post("api/expenses", data);
    return response.data;
  } catch (err) {
    console.error("Failed to create expense:", err);
    throw err;
  }
};

export const updateExpense = async (
  id: string,
  data: {
    categoryId: string;
    amount: string;
    description?: string;
  }
): Promise<Expense> => {
  try {
    const response = await api.put(`api/expenses/${id}`, data);
    return response.data;
  } catch (err) {
    console.error("Failed to update expense:", err);
    throw err;
  }
};

export const deleteExpense = async (id: string): Promise<void> => {
  try {
    await api.delete(`api/expenses/${id}`);
  } catch (err) {
    console.error("Failed to delete expense:", err);
    throw err;
  }
};
