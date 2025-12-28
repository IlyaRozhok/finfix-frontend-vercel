import { Debt } from "@/entities/debts/model";
import { Installment, ReqUserExpense } from "../model/types";

export const isEmptyDebt = (d: Debt): boolean => !d.description && !d.totalDebt;

export const isValidDebt = (d: Debt): boolean => {
  const totalOk = Number(d.totalDebt) > 0;
  return Boolean(totalOk);
};

export const validateExpenses = (expenses: ReqUserExpense[]): Record<string, string> => {
  const errs: Record<string, string> = {};
  expenses.forEach((e) => {
    if (!e.amount || Number(e.amount) <= 0) {
      errs[e.id] = "Enter a positive amount";
    }
  });
  return errs;
};

export const validateDebts = (debts: Debt[]): Record<string, string> => {
  const errs: Record<string, string> = {};
  // Current implementation doesn't add errors for debts, just clears them
  // This maintains the existing behavior
  return errs;
};

export const validateInstallments = (installments: Installment[]): Record<string, string> => {
  const errs: Record<string, string> = {};
  installments.forEach((inst) => {
    if (!inst.id) return;
    if (!inst.description) {
      errs[inst.id] = "Description is required";
    } else if (!inst.startDate) {
      errs[inst.id] = "Start date is required";
    } else if (!inst.totalAmount || Number(inst.totalAmount) <= 0) {
      errs[inst.id] = "Enter a positive total amount";
    } else if (!inst.totalPayments || Number(inst.totalPayments) <= 0) {
      errs[inst.id] = "Enter a positive number of payments";
    }
  });
  return errs;
};

