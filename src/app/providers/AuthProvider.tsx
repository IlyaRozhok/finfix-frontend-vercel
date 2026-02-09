import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";

import { User } from "@/entities/user/model";
import { getMe, logout as apiLogout } from "@/entities/user/api";

type AuthState = {
  user: User | null;
  loading: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthCtx = createContext<AuthState | null>(null);

// Helper function to clear cookies on frontend
function clearCookies() {
  const cookieNames = ["finfix_token", "csrf"];
  const hostname = window.location.hostname;
  const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1";

  cookieNames.forEach((name) => {
    // Clear with current domain
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${hostname}`;
    
    // For non-localhost, also try parent domain
    if (!isLocalhost) {
      const parentDomain = `.${hostname.split(".").slice(-2).join(".")}`;
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${parentDomain}`;
    }
  });
}

const LOGOUT_FLAG = "finfix_logging_out";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Check logout flag immediately on mount to avoid loading state
  const isLoggingOut = typeof window !== "undefined" && sessionStorage.getItem(LOGOUT_FLAG);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(!isLoggingOut);

  const refresh = useCallback(async () => {
    // Don't refresh if we're in the middle of logging out
    // Also skip on /login page to prevent auto-login after logout
    const isLoggingOut = sessionStorage.getItem(LOGOUT_FLAG);
    const isOnLoginPage = window.location.pathname === "/login";
    
    if (isLoggingOut || (isOnLoginPage && isLoggingOut)) {
      console.log("Logout in progress or on login page after logout, skipping refresh");
      setLoading(false);
      setUser(null);
      return;
    }

    setLoading(true);
    const me = await getMe();
    setUser(me);
    setLoading(false);
  }, []);

  const logout = useCallback(async () => {
    console.log("Logout function called");
    
    // Set flag to prevent automatic refresh after redirect
    // This flag will be cleared on /login page
    sessionStorage.setItem(LOGOUT_FLAG, "true");
    
    // Clear user state and set loading to false immediately
    // This prevents loader from showing during redirect
    setUser(null);
    setLoading(false);
    console.log("User state cleared, loading set to false");
    
    // Try to clear cookies on frontend (may not work for httpOnly cookies)
    clearCookies();
    console.log("Attempted to clear cookies on frontend");
    
    try {
      console.log("Calling API logout...");
      await apiLogout();
      console.log("API logout successful - backend should have cleared cookies");
    } catch (error) {
      console.error("Logout API error:", error);
      // Even if API fails, we'll redirect and the flag will prevent auto-login
    }
    
    // Don't redirect here - let the component handle navigation via React Router
    // This prevents page reload and loader flickering
  }, []);

  useEffect(() => {
    // Don't refresh on /login page if we just logged out
    const isLoggingOut = sessionStorage.getItem(LOGOUT_FLAG);
    const isOnLoginPage = window.location.pathname === "/login";
    
    if (isOnLoginPage && isLoggingOut) {
      console.log("On login page after logout, skipping initial refresh");
      setLoading(false);
      setUser(null);
      return;
    }
    
    // If we're logging out, don't refresh
    if (isLoggingOut) {
      setLoading(false);
      setUser(null);
      return;
    }
    
    refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({ user, loading, refresh, logout }),
    [user, loading, refresh, logout]
  );
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
