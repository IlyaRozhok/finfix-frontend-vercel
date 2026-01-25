import { api } from "@/shared/api/axios";
import { DashboardStats, AccountOverviewStats } from "../model/types";

export const fetchDashboardStats = async (accountId?: string): Promise<DashboardStats> => {
  try {
    const params = accountId ? { accountId } : {};
    const response = await api.get("api/stats/overview", { params });
    return response.data;
  } catch (err) {
    console.error("Failed to fetch dashboard stats:", err);
    throw err;
  }
};

export const fetchAccountOverviewStats = async (accountId: string): Promise<AccountOverviewStats> => {
  try {
    const response = await api.get("api/stats/overview", { params: { accountId } });
    return response.data;
  } catch (err) {
    console.error("Failed to fetch account overview stats:", err);
    throw err;
  }
};