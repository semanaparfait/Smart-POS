"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Clock, Layers, Pencil, PackagePlus } from "lucide-react";
import { useOwnerData } from "@/stores/owner/api";
import { usePaged } from "@/app/owner/inventory/usePaged";
import type { AuditEntry, Page, Product, StockMovement } from "@/app/owner/types";
import { Card, EmptyState, ErrorState, Skeleton } from "@/app/owner/components/ui";
import { Button, LinkButton } from "@/app/owner/components/forms";
import { AuditRow, MovementRow } from "@/app/owner/inventory/StockParts";
import { INGREDIENTS, INVENTORY, PRODUCTS, formatQty, historyOf, restockOf, whoLine } from "@/app/owner/inventory/stock";

// One product's history: why the stock changed, and who edited it.
export default function ProductHistory() {
  const { id } = useParams<{ id: string }>();
  const { data: product, error, reload } = useOwnerData<Product>(`/products/${id}`);
  const { items: movements, total, loading, error: movementError, more } = usePaged<StockMovement>(`/products/${id}/stock-movements`);
  const edits = useOwnerData<Page<AuditEntry>>(`/audit-logs?entityName=products&entityId=${id}&limit=50`);

  if (error) return <ErrorState message={error} onRetry={reload} />;

  const unit = product?.unit ?? "";
  const editHref = product?.isIngredient ? `${INGREDIENTS}/${id}` : `${PRODUCTS}/${id}`;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href={product?.isIngredient ? INGREDIENTS : INVENTORY} className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink/55 hover:text-ink">
        <ArrowLeft className="h-4 w-4" />
        {product?.isIngredient ? "Ingredients" : "Stock levels"}
      </Link>
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-ink/45">Inventory</p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-[-0.02em] text-ink md:text-[28px]">{product?.name ?? "Product history"}</h1>
          {product && <p className="mt-1 text-sm text-ink/60">{whoLine(product)}</p>}
        </div>
        {product && (
          <div className="flex flex-wrap gap-2">
            <LinkButton tone="outline" icon={Pencil} href={editHref}>
              Edit
            </LinkButton>
            {product.trackStock && (
              <LinkButton icon={PackagePlus} href={restockOf(id, historyOf(id))}>
                Restock
              </LinkButton>
            )}
          </div>
        )}
      </div>

      {product?.trackStock && (
        <div className="rounded-2xl bg-ink p-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/50">In stock</p>
          <p className="mt-1 text-3xl font-semibold text-lime">
            {formatQty(product.stockQuantity)} {unit}
          </p>
        </div>
      )}

      <Card title="Stock history">
        <div className="px-5">
          {movements.length === 0 ? (
            loading ? (
              <div className="space-y-2 py-5">
                <Skeleton className="h-12" />
                <Skeleton className="h-12" />
              </div>
            ) : (
              <EmptyState icon={Layers} title={movementError ? "Could not load stock history" : "No stock changes yet"} text={movementError ?? "Sales, restocks and counts will show here."} />
            )
          ) : (
            movements.map((m) => <MovementRow key={m.id} movement={m} unit={unit} />)
          )}
        </div>
        {movements.length < total && (
          <div className="border-t border-ink/6 p-3 text-center">
            <Button tone="quiet" busy={loading} onClick={more}>
              Load more
            </Button>
          </div>
        )}
      </Card>

      <Card title="Changes">
        <div className="px-5">
          {(edits.data?.data ?? []).length === 0 ? (
            <EmptyState icon={Clock} title={edits.error ? "Could not load changes" : "No changes yet"} text={edits.error ?? "Edits to this product will show here."} />
          ) : (
            edits.data!.data.map((entry) => <AuditRow key={entry.id} entry={entry} />)
          )}
        </div>
      </Card>
    </div>
  );
}
