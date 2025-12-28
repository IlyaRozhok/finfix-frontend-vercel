import { api } from "@/shared/api/axios";
import { DashboardStats } from "../model/types";

export const fetchDashboardStats = async (): Promise<DashboardStats> => {
  try {
    const response = await api.get("api/stats/overview");
    return response.data;
  } catch (err) {
    console.error("Failed to fetch dashboard stats:", err);
    throw err;
  }
};

