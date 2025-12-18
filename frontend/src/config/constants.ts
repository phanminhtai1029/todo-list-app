export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export const API_ENDPOINTS = {
  REGISTER: "/api/auth/register",
  LOGIN: "/api/auth/login",
  LOGOUT: "/api/auth/logout",
  REFRESH: "/api/auth/refresh",
  ME: "/api/auth/me",
  BOARDS: "/api/boards",
  LISTS: "/api/lists",
  CARDS: "/api/cards",
};

export const LIMITS = {
  MAX_BOARDS_PER_USER: 7,
  MAX_CARDS_PER_BOARD: 20,
  MAX_FILE_SIZE: 10 * 1024 * 1024,
};

export const STORAGE_KEYS = {
  ACCESS_TOKEN: "access_token",
  REFRESH_TOKEN: "refresh_token",
  USER: "user",
};
