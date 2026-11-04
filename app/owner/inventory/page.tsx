"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Layers, PackageX, PackagePlus } from "lucide-react";
import { useOwnerData } from "@/stores/owner/api";
import type { Product } from "@/app/owner/types";
import { Card, EmptyState, ErrorState, PageHeader, SearchInput, Skeleton, StatCard, toNumber } from "@/app/owner/components/ui";
import { LinkButton } from "@/app/owner/components/forms";
import { INVENTORY, formatQty, historyOf, isLowStock, restockOf } from "@/app/owner/inventory/stock";

// Every product whose stock is counted, with what is left.
export default function StockLevels() {
  const { data, loading, error, reload } = useOwnerData<Product[]>("/products");
  const [search, setSearch] = useState("");

  const tracked = useMemo(() => (data ?? []).filter((p) => p.trackStock && p.active), [data]);
  const shown = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tracked.filter((p) => !q || p.name.toLowerCase().includes(q)).sort((a, b) => toNumber(a.stockQuantity) - toNumber(b.stockQuantity));
  }, [tracked, search]);

  if (error) return <ErrorState message={error} onRetry={reload} />;

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Inventory" title="Stock levels" description="Stock drops when an order is paid, not at checkout." />

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard tone="dark" label="Counted" value={tracked.length.toLocaleString()} icon={Layers} />
          <StatCard label="Low" value={tracked.filter(isLowStock).length.toLocaleString()} icon={AlertTriangle} />
          <StatCard label="Out" value={tracked.filter((p) => toNumber(p.stockQuantity) <= 0).length.toLocaleString()} icon={PackageX} />
        </div>
      )}

      <Card>
        <div className="border-b border-ink/6 p-4">
          <SearchInput value={search} onChange={setSearch} placeholder="Search products" />
        </div>
        {loading ? (
          <div className="space-y-2 p-5">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12" />
            ))}
          </div>
        ) : shown.length === 0 ? (
          <EmptyState icon={Layers} title="Nothing to show" text="Turn on Track stock on a product to count it here." />
        ) : (
          <ul className="divide-y divide-ink/6">
            {shown.map((p) => {
              const low = isLowStock(p) || toNumber(p.stockQuantity) <= 0;
              return (
                <li key={p.id} className="flex items-center gap-3 px-5 py-3">
                  <Link href={historyOf(p.id)} className="min-w-0 flex-1 hover:opacity-70">
                    <p className="truncate text-sm font-semibold text-ink">{p.name}</p>
                    <p className="truncate text-xs text-ink/55">{p.lowStockLevel !== null ? `Alert at ${formatQty(p.lowStockLevel)}` : "No alert set"}</p>
                  </Link>
                  <span className={`text-sm font-semibold ${low ? "text-rose-600" : "text-ink"}`}>
                    {formatQty(p.stockQuantity)} {p.unit}
                  </span>
                  <LinkButton small icon={PackagePlus} href={restockOf(p.id, INVENTORY)}>
                    Restock
                  </LinkButton>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
