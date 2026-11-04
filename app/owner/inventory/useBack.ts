"use client";

import { useSearchParams } from "next/navigation";

const LABELS: [string, string][] = [
  ["/owner/inventory/ingredients", "Ingredients"],
  ["/owner/inventory/low-stock", "Low stock & expiry"],
  ["/owner/inventory/", "Product history"],
  ["/owner/inventory", "Stock levels"],
  ["/owner/products", "Products"],
];

// Where a stock page goes back to: the `?back=` it was opened with, if it is one
// of the owner's own pages.
export function useBack(fallback: string) {
  const given = useSearchParams().get("back");
  const back = given?.startsWith("/owner/") ? given : fallback;
  const label = LABELS.find(([prefix]) => back.startsWith(prefix))?.[1] ?? "Back";
  return { back, label };
}
