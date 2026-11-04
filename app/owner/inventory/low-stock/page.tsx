"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, PackagePlus } from "lucide-react";
import { useOwnerData } from "@/stores/owner/api";
import type { Product } from "@/app/owner/types";
import { Card, EmptyState, ErrorState, PageHeader, Skeleton, Tabs } from "@/app/owner/components/ui";
import { LinkButton } from "@/app/owner/components/forms";
import { expiryLabel, formatQty, historyOf, restockOf } from "@/app/owner/inventory/stock";

type View = "low" | "7" | "30" | "90";
const VIEWS: { value: View; label: string }[] = [
  { value: "low", label: "Low stock" },
  { value: "7", label: "Expiring in 7 days" },
  { value: "30", label: "30 days" },
  { value: "90", label: "90 days" },
];

// What to reorder, and what to sell soon.
export default function LowStockPage() {
  const [view, setView] = useState<View>("low");
  const { data, loading, error, reload } = useOwnerData<Product[]>(view === "low" ? "/products/low-stock" : `/products/expiring?days=${view}`);
  const rows = data ?? [];

  if (error) return <ErrorState message={error} onRetry={reload} />;

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Inventory" title="Low stock & expiry" description="What to reorder and what to sell soon." />
      <Tabs options={VIEWS} value={view} onChange={setView} />
      <Card>
        {loading && rows.length === 0 ? (
          <div className="space-y-2 p-5">
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
          </div>
        ) : rows.length === 0 ? (
          <EmptyState icon={CheckCircle2} title="All good" text={view === "low" ? "Nothing is at its alert level." : "Nothing expires in this time."} />
        ) : (
          <ul className="divide-y divide-ink/6">
            {rows.map((p) => (
              <li key={p.id} className="flex items-center gap-3 px-5 py-3">
                <Link href={historyOf(p.id)} className="min-w-0 flex-1 hover:opacity-70">
                  <p className="truncate text-sm font-semibold text-ink">{p.name}</p>
                  <p className="truncate text-xs text-rose-600">
                    {view === "low"
                      ? `${formatQty(p.stockQuantity)} ${p.unit} left · alert at ${formatQty(p.lowStockLevel)}`
                      : p.expiryDate
                        ? expiryLabel(p.expiryDate)
                        : ""}
                  </p>
                </Link>
                {view === "low" && (
                  <LinkButton small icon={PackagePlus} href={restockOf(p.id, "/owner/inventory/low-stock")}>
                    Restock
                  </LinkButton>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
