import { create } from "zustand";
import { API_URL } from "@/config/api";
import type { Login, superadminType } from "@/stores/auth/AuthTypes";

// The website's sign-in. The short sign-in key lives only in memory; the
// server keeps the renewal key in an httpOnly cookie that page scripts can't
// read. A new key is fetched before the old one runs out, and on page load.

interface AuthState {
  user: superadminType | null;
  token: string | null;
  login: (loginData: Login) => Promise<superadminType>;
  fetchMe: () => Promise<superadminType | null>;
  // A fresh key from the cookie; null when the person must sign in again.
  renew: () => Promise<string | null>;
  logout: () => void;
}

const authUrl = (path: string) => `${API_URL}/api/v1/auth/${path}`;

// Keys saved by older versions of the website are removed.
if (typeof window !== "undefined") {
  try {
    localStorage.removeItem("accessToken");
  } catch {
    /* storage blocked */
  }
}

// Seconds until the key runs out, read from the key itself.
const secondsLeft = (token: string) => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return typeof payload.exp === "number" ? payload.exp - Date.now() / 1000 : 0;
  } catch {
    return 0;
  }
};

let timer: ReturnType<typeof setTimeout> | null = null;
let renewing: Promise<string | null> | null = null;

const unwrap = (data: unknown) =>
  (data && typeof data === "object" && "data" in data ? (data as { data: unknown }).data : data) as {
    accessToken?: string;
    access_token?: string;
    token?: string;
  };

const useAuthStore = create<AuthState>((set, get) => {
  const keep = (token: string) => {
    set({ token });
    if (timer) clearTimeout(timer);
    // Renew a minute before it runs out (at least 15 seconds from now).
    const wait = Math.max(15, secondsLeft(token) - 60) * 1000;
    timer = setTimeout(() => void get().renew(), wait);
  };

  const askServer = async (): Promise<string | null> => {
    if (!API_URL) return null;
    try {
      const response = await fetch(authUrl("refresh"), { method: "POST", credentials: "include" });
      if (!response.ok) return null;
      const payload = unwrap(await response.json());
      return payload.accessToken ?? payload.access_token ?? null;
    } catch {
      return null;
    }
  };

  return {
    user: null,
    token: null,

    login: async (loginData: Login) => {
      if (!API_URL) throw new Error("API_URL is not defined");

      const response = await fetch(authUrl("login"), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...loginData, client: "web" }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error((Array.isArray(data.message) ? data.message.join(". ") : data.message) || "Login failed");

      const payload = unwrap(data);
      const accessToken = payload.accessToken ?? payload.access_token ?? payload.token;
      if (!accessToken) throw new Error("Login succeeded, but no access token was returned");
      keep(accessToken);

      const user = await get().fetchMe();
      if (!user) throw new Error("Could not fetch authenticated user");
      return user;
    },

    // One renewal at a time, also across open tabs, so they don't race for the cookie.
    renew: () => {
      if (renewing) return renewing;
      const run = async () => {
        const locks = typeof navigator !== "undefined" ? navigator.locks : undefined;
        const token = locks ? await locks.request("smartpos-renew", askServer) : await askServer();
        if (token) keep(token);
        else get().logout();
        return token;
      };
      renewing = run().finally(() => {
        renewing = null;
      });
      return renewing;
    },

    fetchMe: async () => {
      if (!API_URL) return null;
      const token = get().token ?? (await get().renew());
      if (!token) return null;

      try {
        let response = await fetch(authUrl("me"), { headers: { Authorization: `Bearer ${token}` } });
        if (response.status === 401) {
          const fresh = await get().renew();
          if (!fresh) return null;
          response = await fetch(authUrl("me"), { headers: { Authorization: `Bearer ${fresh}` } });
        }
        if (!response.ok) throw new Error("Failed to fetch user");
        const data = await response.json();
        const user = data.user ?? data.data ?? data;
        set({ user });
        return user;
      } catch (error) {
        console.error("Error fetching user:", error);
        return null;
      }
    },

    logout: () => {
      if (timer) clearTimeout(timer);
      timer = null;
      const hadSession = !!get().token || !!get().user;
      set({ user: null, token: null });
      // Forget the renewal cookie on the server too.
      if (hadSession && API_URL) void fetch(authUrl("session/end"), { method: "POST", credentials: "include" }).catch(() => {});
    },
  };
});

export default useAuthStore;
