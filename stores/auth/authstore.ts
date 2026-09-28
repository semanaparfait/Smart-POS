import { create } from "zustand";
import { API_URL } from "@/config/api";
import type { Login, superadminType } from "@/stores/auth/AuthTypes";

interface AuthState {
  user: superadminType | null;
  token: string | null;
  login: (loginData: Login) => Promise<superadminType>;
  fetchMe: () => Promise<superadminType | null>;
  logout: () => void;
}

const useAuthStore = create<AuthState>((set, get) => ({
  user: null,

  token:
    typeof window !== "undefined"
      ? localStorage.getItem("accessToken")
      : null,

  login: async (loginData: Login) => {
    if (!API_URL) {
      throw new Error("API_URL is not defined");
    }

    const response = await fetch(`${API_URL}/api/v1/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loginData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Login failed");
    }

    const payload = data.data ?? data;

    const accessToken =
      payload.accessToken ??
      payload.access_token ??
      payload.token;

    if (!accessToken) {
      throw new Error(
        "Login succeeded, but no access token was returned",
      );
    }

    // Save token
    localStorage.setItem("accessToken", accessToken);

    // Update Zustand
    set({
      token: accessToken,
    });

    // Get authenticated user from backend
    const user = await get().fetchMe();

    if (!user) {
      throw new Error("Could not fetch authenticated user");
    }

    return user;
  },

  fetchMe: async () => {
    if (!API_URL) return null;

    const token =
      get().token ||
      (typeof window !== "undefined"
        ? localStorage.getItem("accessToken")
        : null);

    if (!token) return null;

    try {
      const response = await fetch(
        `${API_URL}/api/v1/auth/me`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        if (response.status === 401) {
          get().logout();
        }

        throw new Error("Failed to fetch user");
      }

      const data = await response.json();

      // Handles either:
      // { user: {...} }
      // or
      // { data: {...} }
      // or directly {...}
      const user =
        data.user ??
        data.data ??
        data;

      set({
        user,
        token,
      });

      return user;
    } catch (error) {
      console.error("Error fetching user:", error);
      return null;
    }
  },

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
    }

    set({
      user: null,
      token: null,
    });
  },
}));

export default useAuthStore;