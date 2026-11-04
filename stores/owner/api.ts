import { useCallback, useEffect, useState } from "react";
import { API_URL } from "@/config/api";
import useAuthStore from "@/stores/auth/authstore";

// Calls the SmartPOS API as the signed-in owner. Throws the server's own
// message, e.g. "Delivery is not turned on for your company".
export async function ownerRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!API_URL) throw new Error("NEXT_PUBLIC_API_URL is not set");
  const token = useAuthStore.getState().token ?? localStorage.getItem("accessToken");

  const response = await fetch(`${API_URL}/api/v1${path}`, {
    ...init,
    headers: {
      // A photo upload (FormData) sets its own type.
      ...(typeof init.body === "string" ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });

  if (response.status === 401) {
    useAuthStore.getState().logout();
    window.location.assign(`${window.location.origin}/pages/Login`);
    throw new Error("Your session ended. Please sign in again.");
  }

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const message = Array.isArray(data?.message) ? data.message.join(", ") : data?.message;
    throw new Error(message || "Something went wrong");
  }
  // A paged list ({ data, total, page, limit }) is kept whole.
  const paged = data && typeof data === "object" && "data" in data && "total" in data;
  return (paged ? data : (data?.data ?? data)) as T;
}

export interface Loaded<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

// Loads one API path for a page, with loading and error states. While it
// reloads, the last data stays on screen.
export function useOwnerData<T>(path: string | null): Loaded<T> {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<{ key: string; data?: T; error?: string } | null>(null);
  const key = path ? `${path}#${attempt}` : null;

  useEffect(() => {
    if (!path || !key) return;
    let alive = true;
    ownerRequest<T>(path)
      .then((data) => alive && setResult({ key, data }))
      .catch((err: unknown) =>
        alive && setResult({ key, error: err instanceof Error ? err.message : "Could not load this page" }),
      );
    return () => {
      alive = false;
    };
  }, [path, key]);

  const reload = useCallback(() => setAttempt((n) => n + 1), []);
  const current = result?.key === key;
  return {
    data: result?.data ?? null,
    loading: !!key && !current,
    error: current ? result?.error ?? null : null,
    reload,
  };
}
