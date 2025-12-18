import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "@/services/api";
import { API_ENDPOINTS, STORAGE_KEYS } from "@/config/constants";
import { AuthState, LoginCredentials, RegisterData } from "@/types";

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post(API_ENDPOINTS.LOGIN, credentials);
          const { access_token, refresh_token, user } = response.data;
          localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, access_token);
          localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refresh_token);
          set({
            user,
            accessToken: access_token,
            refreshToken: refresh_token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          const errorMessage = error.response?.data?.detail || "Login failed";
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      register: async (data: RegisterData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post(API_ENDPOINTS.REGISTER, data);
          const { access_token, refresh_token, user } = response.data;
          localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, access_token);
          localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refresh_token);
          set({
            user,
            accessToken: access_token,
            refreshToken: refresh_token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.detail || "Registration failed";
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      logout: () => {
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          error: null,
        });
      },

      refreshAuth: async () => {
        const { refreshToken } = get();
        if (!refreshToken) {
          get().logout();
          return;
        }
        try {
          const response = await api.post(API_ENDPOINTS.REFRESH, {
            refresh_token: refreshToken,
          });
          const {
            access_token,
            refresh_token: new_refresh_token,
            user,
          } = response.data;
          localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, access_token);
          localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, new_refresh_token);
          set({
            user,
            accessToken: access_token,
            refreshToken: new_refresh_token,
            isAuthenticated: true,
          });
        } catch (error) {
          console.error("Token refresh failed:", error);
          get().logout();
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
