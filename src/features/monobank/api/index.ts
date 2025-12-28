import { api } from "@shared/api/axios";

export interface MonoAccount {
  id: string;
  currencyCode: number;
  balance: number;
  creditLimit: number;
  maskedPan: string[];
  type: string;
  iban: string;
}

export interface MonoJar {
  id: string;
  sendId: string;
  title: string;
  description: string;
  currencyCode: number;
  balance: number;
  goal: number;
}

export interface ClientInfo {
  name: string;
  accounts: MonoAccount[];
  jars: MonoJar[];
}

export interface MonoTransaction {
  id: string;
  time: number;
  description: string;
  mcc: number;
  hold: boolean;
  amount: number;
  operationAmount: number;
  currencyCode: number;
  commissionRate: number;
  cashbackAmount: number;
  balance: number;
  comment?: string;
  receiptId?: string;
  invoiceId?: string;
  counterEdrpou?: string;
  counterIban?: string;
}

export const fetchClientInfo = async (): Promise<ClientInfo> => {
  try {
    const res = await api.get("/api/integrations/monobank/client-info");
    return res.data;
  } catch (err) {
    console.error("Failed to fetch monobank client info", err);
    throw err;
  }
};

export const fetchTransactions = async (
  accountId: string,
  from: number,
  to: number
): Promise<MonoTransaction[]> => {
  try {
    const res = await api.get("/api/integrations/monobank/transactions", {
      params: {
        accountId,
        from,
        to,
      },
    });
    return res.data;
  } catch (err) {
    console.error("Failed to fetch monobank transactions", err);
    throw err;
  }
};
