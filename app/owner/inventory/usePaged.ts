"use client";

import { useEffect, useState } from "react";
import { ownerRequest } from "@/stores/owner/api";
import type { Page } from "@/app/owner/types";

// A list the server sends 50 at a time, with "Load more". A new `base` starts
// again from the first page.
export function usePaged<T>(base: string) {
  const [page, setPage] = useState(1);
  const [attempt, setAttempt] = useState(0);
  const [store, setStore] = useState<{ base: string; items: T[]; total: number; done: string | null; error: string | null }>({
    base,
    items: [],
    total: 0,
    done: null,
    error: null,
  });
  const key = `${base}#${page}#${attempt}`;

  // Another filter: forget the old rows (React's pattern for state that follows a prop).
  if (store.base !== base) {
    setStore({ base, items: [], total: 0, done: null, error: null });
    setPage(1);
  }

  useEffect(() => {
    let alive = true;
    ownerRequest<Page<T>>(`${base}${base.includes("?") ? "&" : "?"}page=${page}&limit=50`)
      .then(
        (result) =>
          alive &&
          setStore((s) => ({
            base,
            items: page === 1 || s.base !== base ? result.data : [...s.items, ...result.data],
            total: result.total,
            done: key,
            error: null,
          })),
      )
      .catch((err: unknown) => alive && setStore((s) => ({ ...s, done: key, error: err instanceof Error ? err.message : "Could not load this" })));
    return () => {
      alive = false;
    };
  }, [base, page, key]);

  return {
    items: store.base === base ? store.items : [],
    total: store.total,
    loading: store.done !== key,
    error: store.error,
    more: () => setPage((p) => p + 1),
    retry: () => setAttempt((n) => n + 1),
  };
}
