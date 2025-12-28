export type Debt = {
  id: string;
  userId: string;
  description: string;
  debtType: string;
  totalDebt: string;
  monthlyPayment: string;
  interest: string;
  gracePeriodDays?: number | null;
  startDate: string;
  statementDay?: number | null;
  dueDay?: number | null;
  isClosed: boolean;
  createdAt: string;
  updatedAt: string;
};
