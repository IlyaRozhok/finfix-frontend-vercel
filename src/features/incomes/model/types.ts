export interface RegularIncome {
  id: string;
  userId: string;
  amount: number;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface EventIncome {
  id: string;
  userId: string;
  amount: number;
  description: string;
  date: string;
  createdAt: string;
}

export interface AllIncomes {
  regular: RegularIncome[];
  events: EventIncome[];
}
