import { Debt } from "@/entities/debts/model";
import { Installment, ReqUserExpense } from "../model/types";

export const hasExpensesChanged = (
  currentExpenses: ReqUserExpense[],
  originalExpenses: ReqUserExpense[]
): boolean => {
  // Compare expenses arrays
  if (currentExpenses.length !== originalExpenses.length) {
    return true;
  }

  // Create maps for easier comparison
  const currentMap = new Map(currentExpenses.map((exp) => [exp.id, exp]));
  const originalMap = new Map(originalExpenses.map((exp) => [exp.id, exp]));

  // Check if all original expenses still exist and are unchanged
  for (const [id, originalExp] of originalMap) {
    const currentExp = currentMap.get(id);

    if (!currentExp) {
      // Expense was deleted
      return true;
    }

    if (
      currentExp.userId !== originalExp.userId ||
      currentExp.categoryId !== originalExp.categoryId ||
      currentExp.amount !== originalExp.amount ||
      currentExp.description !== originalExp.description
    ) {
      // Expense was modified
      return true;
    }
  }

  // Check if any new expenses were added
  for (const [id] of currentMap) {
    if (!originalMap.has(id)) {
      // New expense was added
      return true;
    }
  }

  return false;
};

export const hasDebtsChanged = (
  currentDebts: Debt[],
  originalDebts: Debt[]
): boolean => {
  // Quick length check to detect additions/removals
  if (currentDebts.length !== originalDebts.length) {
    return true;
  }

  // Create maps for easier comparison
  const currentMap = new Map(currentDebts.map((debt) => [debt.id, debt]));
  const originalMap = new Map(originalDebts.map((debt) => [debt.id, debt]));

  // Check if all original debts still exist and are unchanged
  for (const [id, originalDebt] of originalMap) {
    const currentDebt = currentMap.get(id);

    if (!currentDebt) {
      // Debt was deleted
      return true;
    }

    if (
      currentDebt.description !== originalDebt.description ||
      currentDebt.totalDebt !== originalDebt.totalDebt ||
      currentDebt.interest !== originalDebt.interest
    ) {
      // Debt was modified
      return true;
    }
  }

  // Check if any new debts were added
  for (const [id] of currentMap) {
    if (!originalMap.has(id)) {
      return true;
    }
  }

  return false;
};

export const hasInstallmentsChanged = (
  currentInstallments: Installment[],
  originalInstallments: Installment[]
): boolean => {
  if (currentInstallments.length !== originalInstallments.length) {
    return true;
  }

  const currentMap = new Map(currentInstallments.map((inst) => [inst.id, inst]));
  const originalMap = new Map(originalInstallments.map((inst) => [inst.id, inst]));

  for (const [id, originalInst] of originalMap) {
    const currentInst = currentMap.get(id);
    if (!currentInst) return true;
    if (
      currentInst.description !== originalInst.description ||
      currentInst.startDate !== originalInst.startDate ||
      currentInst.totalAmount !== originalInst.totalAmount ||
      currentInst.totalPayments !== originalInst.totalPayments
    ) {
      return true;
    }
  }

  const hasNewInstallments = currentInstallments.some((inst) => !inst.id);
  if (hasNewInstallments) {
    return true;
  }

  return false;
};

