import { api } from "@shared/api/axios";

export interface MonoAccount {
  id: string;
  currencyCode: number;
  balance: number;
  creditLimit: number;
  maskedPan?: string[];
  type?: string;
  iban: string;
}

// Упрощенный аккаунт, который возвращается из API connect
export interface MonobankAccount {
  id: string;
  currencyCode: number;
  balance: number;
  creditLimit: number;
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

// Интеграция пользователя
export interface UserIntegration {
  id: string;
  lastSyncedAt: string;
  status: "active" | "disabled" | "archived";
  provider: string;
}

// Ответ от API connect
export interface MonobankConnectResponse {
  accounts: MonobankAccount[];
  integration: UserIntegration;
}

export const fetchClientInfo = async (): Promise<ClientInfo> => {
  try {
    const res = await api.get("/api/integration/monobank/client-info");
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
    const res = await api.get("/api/integration/monobank/transactions", {
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

export const connectMonobank = async (
  token: string
): Promise<MonobankConnectResponse> => {
  try {
    const res = await api.post("/api/integration/monobank/connect", {
      token,
    });
    return res.data;
  } catch (err) {
    console.error("Failed to connect monobank", err);
    throw err;
  }
};

// Получение выписки по аккаунту
export const fetchAccountStatement = async (
  accountId: string,
  from?: number,
  to?: number
): Promise<MonoTransaction[]> => {
  try {
    const res = await api.get(`/api/integration/monobank/accounts/${accountId}/statement`, {
      params: {
        from,
        to,
      },
    });
    return res.data;
  } catch (err) {
    console.error("Failed to fetch account statement", err);
    throw err;
  }
};

// Получение выписки Monobank
export const fetchMonobankStatement = async (
  accountId: string,
  from: string,
  to: string
): Promise<any> => {
  try {
    const res = await api.get("/api/monobank/statement", {
      params: {
        accountId,
        from,
        to,
      },
    });
    return res.data;
  } catch (err) {
    console.error("Failed to fetch monobank statement", err);
    throw err;
  }
};

export const syncMonobankAccount = async (
  accountId: string,
  from: string,
  to: string
): Promise<void> => {
  try {
    await api.post("/api/accounts/monobank/sync", {
      accountId,
      from,
      to,
    });
  } catch (err) {
    console.error("Failed to sync monobank account", err);
    throw err;
  }
};

// Получение всех интеграций пользователя
export const fetchIntegrations = async (): Promise<UserIntegration[]> => {
  try {
    const res = await api.get("/api/integration/find");
    return res.data;
  } catch (err) {
    console.error("Failed to fetch integrations", err);
    throw err;
  }
};
