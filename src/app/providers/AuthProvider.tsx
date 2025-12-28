import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { User } from "@/entities/user/model";
import { getMe, logout as apiLogout } from "@/entities/user/api";

type AuthState = {
  user: User | null;
  loading: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthCtx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    const me = await getMe();
    setUser(me);
    setLoading(false);
  }
  async function logout() {
    await apiLogout();
    setUser(null);
  }

  useEffect(() => {
    refresh();
  }, []);

  const value = useMemo(
    () => ({ user, loading, refresh, logout }),
    [user, loading]
  );
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
