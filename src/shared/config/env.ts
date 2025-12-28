export const ENV = {
  API_URL: import.meta.env.VITE_API_URL || "http://localhost:3001",
  AUTH: {
    ME: "/api/auth/me",
    GOOGLE: "/api/auth/google",
    LOGOUT: "/api/auth/logout",
    CSRF: "/api/auth/csrf",
  },
};
