import { Installment } from "../model/types";

export const newInstallmentPayload = (
  installments: Installment[],
  userId: string
) => {
  return installments.map((i) => {
    let startDateISO: string;
    if (i.startDate) {
      const [year, month, day] = i.startDate.split("-").map(Number);
      const date = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
      startDateISO = date.toISOString();
    } else {
      startDateISO = new Date().toISOString();
    }

    return {
      userId,
      description: i.description,
      startDate: startDateISO,
      totalAmount: i.totalAmount,
      totalPayments: i.totalPayments,
    };
  });
};
