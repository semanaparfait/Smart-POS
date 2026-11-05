import { useCallback, useEffect, useState } from "react";
import { API_URL } from "@/config/api";
import useAuthStore from "@/stores/auth/authstore";

// Calls the SmartPOS API as the signed-in owner. Throws the server's own
// message, e.g. "Delivery is not turned on for your company".
export async function ownerRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!API_URL) throw new Error("NEXT_PUBLIC_API_URL is not set");
  const auth = useAuthStore.getState();
  const send = (token: string | null) =>
    fetch(`${API_URL}/api/v1${path}`, {
      ...init,
      headers: {
        // A photo upload (FormData) sets its own type.
        ...(typeof init.body === "string" ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init.headers,
      },
    });

  let response = await send(auth.token ?? (await auth.renew()));
  // The sign-in key ran out: renew it once from the cookie and try again.
  if (response.status === 401) {
    const fresh = await useAuthStore.getState().renew();
    if (fresh) response = await send(fresh);
  }

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

// Orders since a moment (made, changed or still open), so a page only loads
// what it shows. The time is the start of that day, so the address stays the
// same all day and isn't fetched again on every render.
export function ordersSince(since: Date | string | number | null, extra: Record<string, string> = {}) {
  if (since === null) return `/orders${Object.keys(extra).length ? `?${new URLSearchParams(extra)}` : ""}`;
  const day =
    typeof since === "number"
      ? new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - since)
      : typeof since === "string"
        ? new Date(`${since.slice(0, 10)}T00:00:00`)
        : new Date(since.getFullYear(), since.getMonth(), since.getDate());
  return `/orders?${new URLSearchParams({ ...extra, from: day.toISOString() })}`;
}

// Every paid order with a credit payment, however old (credit stays owed).
export const CREDIT_ORDERS = "/orders?credit=true";

// Runs `refresh` every `ms` while the tab is on screen. A hidden tab asks the
// server nothing; coming back after a while refreshes at once. Returns the
// clean-up, for useEffect.
export function everyWhileVisible(refresh: () => void, ms: number) {
  let last = Date.now();
  const run = () => {
    last = Date.now();
    refresh();
  };
  const timer = setInterval(() => {
    if (document.visibilityState === "visible") run();
  }, ms);
  const onVisible = () => {
    if (document.visibilityState === "visible" && Date.now() - last >= ms) run();
  };
  document.addEventListener("visibilitychange", onVisible);
  return () => {
    clearInterval(timer);
    document.removeEventListener("visibilitychange", onVisible);
  };
}
