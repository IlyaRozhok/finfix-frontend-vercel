export enum TransactionType {
  INSTALLMENT_PAYMENT = "installment_payment",
  DEBT_PAYMENT = "debt_payment",
  CATEGORY_BASED = "category_based",
  TRANSFER = "transfer",
  INCOME_REGULAR = "income_regular",
  INCOME_EVENT = "income_event"
}

export enum TransactionDirection {
  INCOME = "income",
  EXPENSE = "expense",
}

export type TransactionFormData = {
  type: TransactionType;
  direction: TransactionDirection;
  amount: string;
  occurredAt: string;
  categoryId?: string;
  installmentId?: string;
  debtId?: string;
  note?: string;
};

export type CategoryOption = {
  value: string;
  label: string;
};

export type TransactionOption = {
  value: string;
  label: string;
};
