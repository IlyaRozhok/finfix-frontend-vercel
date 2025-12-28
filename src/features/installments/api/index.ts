import { api } from "@/shared/api/axios";
import { Installment } from "../model/types";

export interface CreateInstallmentData {
  userId: string;
  startDate: string;
  totalAmount: number;
  totalPayments: number;
  description: string;
}

export interface UpdateInstallmentData {
  startDate: string;
  totalAmount: number;
  totalPayments: number;
  description: string;
}

export const fetchUserInstallments = async (): Promise<Installment[]> => {
  try {
    const response = await api.get("api/installments");
    return response.data;
  } catch (err) {
    console.error("Failed to fetch user installments:", err);
    throw err;
  }
};

export const createInstallment = async (
  data: CreateInstallmentData
): Promise<Installment> => {
  try {
    const response = await api.post("api/installments/create", data);
    return response.data;
  } catch (err) {
    console.error("Failed to create installment:", err);
    throw err;
  }
};

export const updateInstallment = async (
  id: string,
  data: UpdateInstallmentData
): Promise<Installment> => {
  try {
    const response = await api.put(`api/installments/${id}`, data);
    return response.data;
  } catch (err) {
    console.error("Failed to update installment:", err);
    throw err;
  }
};

export const deleteInstallment = async (id: string): Promise<void> => {
  try {
    await api.delete(`api/installments/${id}`);
  } catch (err) {
    console.error("Failed to delete installment:", err);
    throw err;
  }
};
