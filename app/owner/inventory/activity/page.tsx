"use client";

import { useState } from "react";
import { Clock } from "lucide-react";
import { useOwnerData } from "@/stores/owner/api";
import type { AuditEntry, Product } from "@/app/owner/types";
import { Card, EmptyState, ErrorState, PageHeader, Skeleton, Tabs } from "@/app/owner/components/ui";
import { Button } from "@/app/owner/components/forms";
import { AuditRow } from "@/app/owner/inventory/StockParts";
import { historyOf } from "@/app/owner/inventory/stock";
import { usePaged } from "@/app/owner/inventory/usePaged";

type Action = "" | "CREATE" | "UPDATE" | "DELETE";

// Who changed which product, newest first.
export default function ActivityLogsPage() {
  const products = useOwnerData<Product[]>("/products");
  const [action, setAction] = useState<Action>("");
  const { items, total, loading, error, more, retry } = usePaged<AuditEntry>(`/audit-logs?entityName=products${action ? `&action=${action}` : ""}`);

  const nameOf = (entry: AuditEntry) =>
    products.data?.find((p) => p.id === entry.entityId)?.name ?? (typeof entry.changes?.name === "string" ? entry.changes.name : "a product");

  if (error && items.length === 0) return <ErrorState message={error} onRetry={retry} />;

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Inventory" title="Activity logs" description="Who added or changed products, and when." />
      <Tabs
        options={[
          { value: "", label: "All" },
          { value: "CREATE", label: "Added" },
          { value: "UPDATE", label: "Edited" },
          { value: "DELETE", label: "Deleted" },
        ]}
        value={action}
        onChange={setAction}
      />
      <Card>
        <div className="px-5">
          {items.length === 0 ? (
            loading ? (
              <div className="space-y-2 py-5">
                <Skeleton className="h-12" />
                <Skeleton className="h-12" />
              </div>
            ) : (
              <EmptyState icon={Clock} title="No activity yet" text="Product changes will show here." />
            )
          ) : (
            items.map((entry) => (
              <AuditRow key={entry.id} entry={entry} name={nameOf(entry)} href={entry.entityId && entry.action !== "DELETE" ? historyOf(entry.entityId) : undefined} />
            ))
          )}
        </div>
        {items.length < total && (
          <div className="border-t border-ink/6 p-3 text-center">
            <Button tone="quiet" busy={loading} onClick={more}>
              Load more
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
