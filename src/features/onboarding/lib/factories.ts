import { Debt } from "@/entities/debts/model";
import { Installment, ReqUserExpense } from "../model/types";

export const mkDebt = (): Debt => ({
  id: crypto.randomUUID(),
  description: "",
  totalDebt: "",
  interest: "",
});

export const mkExpenseRow = (categoryId?: string): ReqUserExpense => ({
  id: crypto.randomUUID(),
  userId: "",
  categoryId: categoryId || "",
  description: "",
  amount: "",
});

export const mkInstallment = (): Installment => ({
  id: crypto.randomUUID(),
  description: "",
  startDate: "",
  totalAmount: "",
  totalPayments: "",
});
