// src/shared/api/axios.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { ENV } from "@/shared/config/env";

type AxError = {
  reason: string;
  code: string;
  message: string;
};

export const api = axios.create({
  baseURL: ENV.API_URL,
  withCredentials: true,
});

// --- мини-утилиты ---
const CSRF_COOKIE = "csrf";
const CSRF_HEADER = "X-CSRF-Token";

const getCookie = (name: string) => {
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : null;
};

const isMutation = (cfg: InternalAxiosRequestConfig) =>
  ["post", "put", "patch", "delete"].includes(
    (cfg.method ?? "get").toLowerCase()
  );

const isCsrfError = (err: AxiosError<AxError>) => {
  const status = err?.response?.status;
  const data = err?.response?.data;
  return (
    status === 403 &&
    (data?.reason === "CSRF" ||
      data?.code === "EBADCSRFTOKEN" ||
      (typeof data?.message === "string" &&
        data.message.toLowerCase().includes("csrf")))
  );
};

const primeCsrf = () => api.get("/api/auth/csrf")

// --- request: ставим заголовок для мутаций ---
api.interceptors.request.use(async (cfg) => {
  if (isMutation(cfg)) {
    let token = getCookie(CSRF_COOKIE);
    if (!token) {
      await primeCsrf();
      token = getCookie(CSRF_COOKIE);
    }
    cfg.headers = { ...(cfg.headers ?? {}), [CSRF_HEADER]: token ?? "" };
  }
  return cfg;
});

// --- response: один ретрай при CSRF + сигнал о 401 ---
api.interceptors.response.use(
  (r) => r,
  async (err) => {
    const cfg = err?.config ?? {};

    if (isCsrfError(err) && !cfg.__csrfRetried) {
      cfg.__csrfRetried = true;
      await primeCsrf();
      const token = getCookie(CSRF_COOKIE);
      cfg.headers = { ...(cfg.headers ?? {}), [CSRF_HEADER]: token ?? "" };
      return api.request(cfg);
    }

    if (err?.response?.status === 401) {
      window.dispatchEvent(new CustomEvent("auth:unauthorized"));
    }
    return Promise.reject(err);
  }
);
