"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { CheckCircle2, ClipboardList } from "lucide-react";
import { ownerRequest, useOwnerData } from "@/stores/owner/api";
import type { Product } from "@/app/owner/types";
import { Card, EmptyState, ErrorState, PageHeader, Skeleton, Tabs, rwf, toNumber } from "@/app/owner/components/ui";
import { Button } from "@/app/owner/components/forms";
import { formatQty, quantityOnly } from "@/app/owner/inventory/stock";

type Scope = "ingredients" | "all";

// Walk the storeroom, type what is really there, and see what is missing.
export default function StockCountPage() {
  const router = useRouter();
  const { data, loading, error, reload } = useOwnerData<Product[]>("/products");
  const [scope, setScope] = useState<Scope>("ingredients");
  const [counts, setCounts] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const rows = useMemo(
    () => (data ?? []).filter((p) => p.active && p.trackStock && (scope === "all" || p.isIngredient)).sort((a, b) => a.name.localeCompare(b.name)),
    [data, scope],
  );
  // Only rows that were counted and came out different.
  const changed = rows.filter((p) => counts[p.id] !== undefined && counts[p.id] !== "" && Number(counts[p.id]) !== toNumber(p.stockQuantity));
  const difference = changed.reduce((sum, p) => sum + (Number(counts[p.id]) - toNumber(p.stockQuantity)) * toNumber(p.buyingPrice), 0);

  const save = async () => {
    if (!changed.length) return toast("No differences to save");
    setSaving(true);
    const failed: string[] = [];
    // One at a time, so a problem with one row keeps the others.
    for (const product of changed) {
      try {
        const form = new FormData();
        form.append("stockQuantity", counts[product.id]);
        await ownerRequest(`/products/${product.id}`, { method: "PATCH", body: form });
      } catch {
        failed.push(product.name);
      }
    }
    setSaving(false);
    if (failed.length) {
      reload();
      return toast.error(`Some counts were not saved: ${failed.join(", ")}`);
    }
    toast.success(`Stock count saved: ${changed.length} updated`);
    // Straight to what the count means: how much is missing that sales don't explain.
    router.push("/owner/inventory/usage");
  };

  if (error) return <ErrorState message={error} onRetry={reload} />;

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Inventory" title="Stock count" description="Type what is really there. Leave a row empty to skip it." />
      <Tabs
        options={[
          { value: "ingredients", label: "Ingredients" },
          { value: "all", label: "Everything counted" },
        ]}
        value={scope}
        onChange={setScope}
      />
      <Card>
        {loading ? (
          <div className="space-y-2 p-5">
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
          </div>
        ) : rows.length === 0 ? (
          <EmptyState icon={ClipboardList} title="Nothing to count" text="Products appear here when their stock is tracked." />
        ) : (
          <ul className="divide-y divide-ink/6">
            {rows.map((p) => {
              const counted = counts[p.id] ?? "";
              const diff = counted === "" ? null : Number(counted) - toNumber(p.stockQuantity);
              return (
                <li key={p.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink">{p.name}</p>
                    <p className="text-xs text-ink/55">
                      Expected {formatQty(p.stockQuantity)} {p.unit}
                    </p>
                  </div>
                  {diff !== null && (
                    <span className={`text-sm font-semibold ${diff < 0 ? "text-rose-600" : "text-ink"}`}>
                      {diff > 0 ? "+" : ""}
                      {formatQty(diff)}
                    </span>
                  )}
                  <div className="relative w-36">
                    <input
                      inputMode="decimal"
                      value={counted}
                      onChange={(e) => setCounts((prev) => ({ ...prev, [p.id]: quantityOnly(e.target.value) }))}
                      placeholder="Count"
                      aria-label={`Counted ${p.name}`}
                      className="h-10 w-full rounded-xl border border-ink/12 bg-white pl-3 pr-16 text-sm text-ink outline-none focus:border-ink focus:ring-4 focus:ring-lime/40"
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 max-w-14 -translate-y-1/2 truncate text-xs font-semibold text-ink/45">{p.unit}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
      <div className="sticky bottom-4 z-10 flex flex-wrap items-center gap-3 rounded-2xl border border-ink/10 bg-white/95 px-4 py-3 shadow-[0_8px_24px_rgba(32,40,59,0.10)] backdrop-blur">
        <div className="mr-auto">
          <p className="text-sm font-semibold text-ink">
            {changed.length} difference{changed.length === 1 ? "" : "s"}
          </p>
          <p className={`text-xs ${difference < 0 ? "text-rose-600" : "text-ink/55"}`}>
            {difference > 0 ? "+" : ""}
            {rwf(difference)} at current cost
          </p>
        </div>
        <Button icon={CheckCircle2} busy={saving} onClick={save}>
          Save count
        </Button>
      </div>
    </div>
  );
}
