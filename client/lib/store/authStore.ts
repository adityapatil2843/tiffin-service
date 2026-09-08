import { create } from "zustand";
import Cookies from "js-cookie";
import api from "../api/client";
import { User, ApiResponse } from "../../types";

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isHydrated: boolean;
  hydrate: () => Promise<void>;
  login: (credentials: { userId?: string; email?: string; password?: string }) => Promise<{ success: boolean; role?: string; message?: string }>;
  logout: () => Promise<void>;
  updateUser: (updatedUser: User) => void;
}

const TOKEN_KEY = "tfns_auth_token";

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  isHydrated: false,

  // Load token from cookie and fetch profile on client boot
  hydrate: async () => {
    if (typeof window === "undefined") return;

    try {
      const token = Cookies.get(TOKEN_KEY);
      if (token) {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const res = await api.get<ApiResponse<{ user: User }>>("/auth/me");
        const user = res.data.data.user;
        
        // Refresh role cookie
        Cookies.set("tfns_user_role", user.role, {
          expires: 7,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
        });

        set({ user, token, isHydrated: true });
      } else {
        set({ isHydrated: true });
      }
    } catch (error) {
      // Clear invalid credentials
      Cookies.remove(TOKEN_KEY);
      Cookies.remove("tfns_user_role");
      delete api.defaults.headers.common["Authorization"];
      set({ user: null, token: null, isHydrated: true });
    }
  },

  login: async (credentials) => {
    set({ isLoading: true });
    try {
      const res = await api.post<ApiResponse<{ user: User; token: string }>>(
        "/auth/login",
        credentials
      );
      const { user, token } = res.data.data;

      // Persist token in secure cookie for 7 days
      Cookies.set(TOKEN_KEY, token, {
        expires: 7,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });

      // Persist role in cookie for middleware routing
      Cookies.set("tfns_user_role", user.role, {
        expires: 7,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });

      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      set({ user, token, isLoading: false });
      return { success: true, role: user.role };
    } catch (error: any) {
      set({ isLoading: false });
      const message =
        error.response?.data?.message || "Login failed. Please try again.";
      return { success: false, message };
    }
  },

  logout: async () => {
    Cookies.remove(TOKEN_KEY);
    Cookies.remove("tfns_user_role");
    delete api.defaults.headers.common["Authorization"];
    set({ user: null, token: null });
  },

  updateUser: (updatedUser) => set({ user: updatedUser }),
}));
export default useAuthStore;
