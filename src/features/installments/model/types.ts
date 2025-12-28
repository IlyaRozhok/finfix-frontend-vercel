export interface Installment {
  id: string;
  userId: string;
  description: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
  monthlyPayment: number;
  totalPayments: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}
