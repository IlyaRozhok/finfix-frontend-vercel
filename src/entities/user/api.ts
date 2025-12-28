import { api } from "@/shared/api/axios";
import { ENV } from "@/shared/config/env";
import type { User } from "./model";

export async function getMe(): Promise<User | null> {
  try {
    const { data } = await api.get(ENV.AUTH.ME);
    return data as User;
  } catch {
    return null;
  }
}

export async function logout(): Promise<void> {
  await api.post(ENV.AUTH.LOGOUT);
}
