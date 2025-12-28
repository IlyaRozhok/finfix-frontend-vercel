import { api } from "@/shared/api/axios";
import { AllIncomes } from "../model/types";

export const fetchRegularIncomes = async () => {
  try {
    const response = await api.get("api/incomes/regular");
    return response.data;
  } catch (err) {
    console.error("Failed to fetch regular incomes:", err);
    throw err;
  }
};

export const fetchRegularIncome = async (id: string) => {
  try {
    const response = await api.get(`api/incomes/regular/${id}`);
    return response.data;
  } catch (err) {
    console.error("Failed to fetch regular income:", err);
    throw err;
  }
};

export const fetchEventIncome = async (id: string) => {
  try {
    const response = await api.get(`api/incomes/event/${id}`);
    return response.data;
  } catch (err) {
    console.error("Failed to fetch event income:", err);
    throw err;
  }
};

export const fetchEventIncomes = async () => {
  try {
    const response = await api.get("api/incomes/event");
    return response.data;
  } catch (err) {
    console.error("Failed to fetch event incomes:", err);
    throw err;
  }
};

export const fetchAllIncomes = async (): Promise<AllIncomes> => {
  try {
    const [regular, events] = await Promise.all([
      fetchRegularIncomes(),
      fetchEventIncomes(),
    ]);
    return {
      regular,
      events,
    };
  } catch (err) {
    console.error("Failed to fetch incomes:", err);
    throw err;
  }
};

export const createRegularIncome = async (data: {
  amount: number;
  description: string;
}) => {
  try {
    const response = await api.post("api/incomes/regular/create", data);
    return response.data;
  } catch (err) {
    console.error("Failed to create regular income:", err);
    throw err;
  }
};

export const updateRegularIncome = async (
  id: string,
  data: { amount?: number; description?: string }
) => {
  try {
    const response = await api.put(`api/incomes/regular/${id}`, data);
    return response.data;
  } catch (err) {
    console.error("Failed to update regular income:", err);
    throw err;
  }
};

export const createEventIncome = async (data: {
  amount: number;
  description: string;
  date: string;
}) => {
  try {
    const response = await api.post("api/incomes/event/create", {
      ...data,
      date: new Date(data.date), // Convert string to Date object
    });
    return response.data;
  } catch (err) {
    console.error("Failed to create event income:", err);
    throw err;
  }
};

export const deleteRegularIncome = async (id: string) => {
  try {
    await api.delete(`api/incomes/regular/${id}`);
  } catch (err) {
    console.error("Failed to delete regular income:", err);
    throw err;
  }
};

export const updateEventIncome = async (
  id: string,
  data: { amount?: number; description?: string; date?: string }
) => {
  try {
    const response = await api.put(`api/incomes/event/${id}`, {
      ...data,
      ...(data.date && { date: new Date(data.date) }), // Convert string to Date object if date is provided
    });
    return response.data;
  } catch (err) {
    console.error("Failed to update event income:", err);
    throw err;
  }
};

export const deleteEventIncome = async (id: string) => {
  try {
    await api.delete(`api/incomes/event/${id}`);
  } catch (err) {
    console.error("Failed to delete event income:", err);
    throw err;
  }
};
