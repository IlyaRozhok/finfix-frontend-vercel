import { api } from "@/shared/api/axios";

export enum AccountType {
  CARD = "card",
  CASH = "cash",
  WALLET = "wallet",
}

export enum AccountAssetType {
  FIAT = "fiat",
  CRYPTO = "crypto",
}

export enum AccountProvider {
  MANUAL = "manual",
  MONOBANK = "monobank",
  BINANCE = "binance",
}

export interface Account {
  id: string;
  name: string;
  description?: string | null;
  type: AccountType;
  assetType: AccountAssetType;
  assetCode: string;
  provider: AccountProvider;
  externalId: string | null;
}

export interface CreateAccountData {
  name: string;
  description?: string;
  type: AccountType;
  assetType: AccountAssetType;
  assetCode: string;
  provider: AccountProvider;
  externalId?: string;
}

export const fetchAccounts = async (): Promise<Account[]> => {
  try {
    const response = await api.get("api/accounts/");
    return response.data;
  } catch (err) {
    console.error("Failed to fetch accounts:", err);
    throw err;
  }
};

export const createAccount = async (data: CreateAccountData): Promise<Account> => {
  try {
    const response = await api.post("api/accounts/create", data);
    return response.data;
  } catch (err) {
    console.error("Failed to create account:", err);
    throw err;
  }
};

export const fetchAccountById = async (id: string): Promise<Account> => {
  try {
    const response = await api.post(`api/accounts/${id}?id=${id}`);
    return response.data;
  } catch (err) {
    console.error("Failed to fetch account by id:", err);
    throw err;
  }
};

