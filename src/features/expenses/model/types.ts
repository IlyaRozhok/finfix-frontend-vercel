export interface Expense {
  id: string;
  userId: string;
  categoryId: string;
  category: {
    id: string;
    name: string;
    icon?: string;
  };
  description: string;
  amount: string;
  createdAt: string;
  updatedAt: string;
}
