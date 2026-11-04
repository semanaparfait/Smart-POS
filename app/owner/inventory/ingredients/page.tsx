"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { AlertTriangle, CalendarClock, Clock, Pencil, Plus, Power, Salad, Trash2, Wallet } from "lucide-react";
import { ownerRequest, useOwnerData } from "@/stores/owner/api";
import type { Product } from "@/app/owner/types";
import { Card, EmptyState, ErrorState, PageHeader, SearchInput, Skeleton, StatCard, Tabs, rwf, toNumber } from "@/app/owner/components/ui";
import { Button, LinkButton } from "@/app/owner/components/forms";
import { INGREDIENTS, MONEY_UNIT, formatQty, formatStock, historyOf, isLowStock, isOut, restockOf, wasteOf } from "@/app/owner/inventory/stock";

const EXPIRING_DAYS = 7;
type Filter = "all" | "low" | "out" | "expiring" | "setup";

// What stops an ingredient being tracked properly, in plain words.
const missing = (p: Product) =>
  [p.unit !== MONEY_UNIT && !(toNumber(p.buyingPrice) > 0) && "no cost, so dish costs are too low", p.lowStockLevel === null && "no alert level"].filter(
    Boolean,
  ) as string[];
const isExpiring = (p: Product) => !!p.expiryDate && new Date(`${p.expiryDate.slice(0, 10)}T00:00:00`).getTime() - Date.now() < EXPIRING_DAYS * 86_400_000;

function ActiveButton({ ingredient, onDone }: { ingredient: Product; onDone: () => void }) {
  const [busy, setBusy] = useState(false);
  const toggle = async () => {
    setBusy(true);
    try {
      await ownerRequest(`/products/${ingredient.id}/${ingredient.active ? "deactivate" : "activate"}`, { method: "PATCH" });
      toast.success(`${ingredient.name} ${ingredient.active ? "deactivated" : "activated"}`);
      onDone();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update the ingredient");
    } finally {
      setBusy(false);
    }
  };
  return (
    <Button
      small
      tone="quiet"
      icon={Power}
      busy={busy}
      onClick={toggle}
      aria-label={`${ingredient.active ? "Deactivate" : "Activate"} ${ingredient.name}`}
      title={ingredient.active ? "Deactivate" : "Activate"}
      className={`px-2.5 ${ingredient.active ? "text-rose-600" : ""}`}
    />
  );
}

// Everything used to make the food: what is left, what it cost, what to reorder.
export default function IngredientsPage() {
  const { data, loading, error, reload } = useOwnerData<Product[]>("/products");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const ingredients = useMemo(() => (data ?? []).filter((p) => p.isIngredient), [data]);
  const shown = useMemo(() => {
    const q = search.trim().toLowerCase();
    return ingredients
      .filter((p) => !q || p.name.toLowerCase().includes(q))
      .filter(
        (p) =>
          filter === "all" ||
          (filter === "low" && isLowStock(p)) ||
          (filter === "out" && isOut(p)) ||
          (filter === "expiring" && isExpiring(p)) ||
          (filter === "setup" && missing(p).length > 0),
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [ingredients, search, filter]);
  const totalValue = ingredients.reduce((sum, p) => sum + Math.max(0, toNumber(p.stockQuantity)) * toNumber(p.buyingPrice), 0);

  if (error) return <ErrorState message={error} onRetry={reload} />;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Inventory"
        title="Ingredients"
        description="What your food is made from. Sales take these out of stock through recipes."
        actions={
          <LinkButton icon={Plus} href={`${INGREDIENTS}/new`}>
            Add ingredient
          </LinkButton>
        }
      />
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard tone="dark" label="Ingredients" value={ingredients.length.toLocaleString()} icon={Salad} />
          <StatCard label="Stock value" value={rwf(totalValue)} icon={Wallet} />
          <StatCard label="Low or out" value={ingredients.filter((p) => isLowStock(p) || isOut(p)).length.toLocaleString()} icon={AlertTriangle} />
          <StatCard label="Expiring soon" value={ingredients.filter(isExpiring).length.toLocaleString()} icon={CalendarClock} />
        </div>
      )}

      <Card>
        <div className="flex flex-col gap-3 border-b border-ink/6 p-4 lg:flex-row lg:items-center lg:justify-between">
          <SearchInput value={search} onChange={setSearch} placeholder="Search ingredients" />
          <Tabs
            options={[
              { value: "all", label: "All" },
              { value: "low", label: "Low" },
              { value: "out", label: "Out" },
              { value: "expiring", label: `Expiring in ${EXPIRING_DAYS} days` },
              { value: "setup", label: "Needs setup" },
            ]}
            value={filter}
            onChange={setFilter}
          />
        </div>
        {loading ? (
          <div className="space-y-2 p-5">
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
          </div>
        ) : shown.length === 0 ? (
          <EmptyState
            icon={Salad}
            title={ingredients.length ? "Nothing here" : "No ingredients yet"}
            text={ingredients.length ? "Try another search or filter." : "Add what your food is made from, then use it in recipes."}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] text-sm">
              <thead>
                <tr className="border-b border-ink/8 text-[11px] font-bold uppercase tracking-[0.12em] text-ink/45">
                  <th className="px-5 py-3 text-left">Ingredient</th>
                  <th className="px-5 py-3 text-right">In stock</th>
                  <th className="px-5 py-3 text-right">Alert at</th>
                  <th className="px-5 py-3 text-right">Cost</th>
                  <th className="px-5 py-3 text-right">Value</th>
                  <th className="px-5 py-3 text-right">Expiry</th>
                  <th className="px-5 py-3" aria-label="Actions" />
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/6">
                {shown.map((p) => {
                  const stock = toNumber(p.stockQuantity);
                  const problems = missing(p);
                  return (
                    <tr key={p.id} className={p.active ? "" : "opacity-50"}>
                      <td className="px-5 py-3">
                        <p className="font-semibold text-ink">{p.name}</p>
                        {problems.length > 0 && <p className="text-[11px] text-rose-600">{problems.join(", ")}</p>}
                      </td>
                      <td className={`px-5 py-3 text-right font-semibold ${isLowStock(p) || isOut(p) ? "text-rose-600" : "text-ink"}`}>{formatStock(stock, p)}</td>
                      <td className="px-5 py-3 text-right text-ink/65">{p.lowStockLevel === null ? "—" : formatQty(p.lowStockLevel)}</td>
                      <td className="px-5 py-3 text-right text-ink/65">{rwf(p.buyingPrice)}</td>
                      <td className="px-5 py-3 text-right text-ink">{rwf(Math.max(0, stock) * toNumber(p.buyingPrice))}</td>
                      <td className={`px-5 py-3 text-right ${isExpiring(p) ? "text-rose-600" : "text-ink/65"}`}>{p.expiryDate?.slice(0, 10) ?? "—"}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <LinkButton small href={restockOf(p.id, INGREDIENTS)}>
                            Restock
                          </LinkButton>
                          <IconLink href={wasteOf(p.id, INGREDIENTS)} label={`Record waste of ${p.name}`} icon={Trash2} />
                          <IconLink href={historyOf(p.id)} label={`History of ${p.name}`} icon={Clock} />
                          <IconLink href={`${INGREDIENTS}/${p.id}`} label={`Edit ${p.name}`} icon={Pencil} />
                          <ActiveButton ingredient={p} onDone={reload} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

function IconLink({ href, label, icon: Icon }: { href: string; label: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <Link href={href} aria-label={label} title={label} className="flex h-8 w-8 items-center justify-center rounded-lg text-ink/60 ring-1 ring-inset ring-ink/10 hover:bg-ivory hover:text-ink">
      <Icon className="h-4 w-4" />
    </Link>
  );
}
