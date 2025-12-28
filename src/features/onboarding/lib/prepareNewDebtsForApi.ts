import { Debt } from "@/entities/debts/model";
import { ReqCreateDebt } from "../model/types";

export const prepareNewDebtsForApi = (
  debts: Debt[],
  userId: string,
  originalDebts: Debt[] = []
): ReqCreateDebt[] => {
  const originalIds = new Set(originalDebts.map((debt) => debt.id));

  return debts
    .filter((debt) => !originalIds.has(debt.id))
    .map((debt) => {
      const { id, ...rest } = debt;
      return {
        ...rest,
        userId,
      };
    });
};
