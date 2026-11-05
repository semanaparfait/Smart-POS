"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { CheckCircle2, CookingPot, FolderOpen, FolderTree, ImageIcon, Package, Pencil, Plus, Power, TrendingUp } from "lucide-react";
import { ownerRequest, useOwnerData } from "@/stores/owner/api";
import { Button, LinkButton } from "@/app/owner/components/forms";
import type { Category, Product } from "@/app/owner/types";
import { Card, EmptyState, ErrorState, PageHeader, SearchInput, Skeleton, StatCard, formatDate, toNumber } from "@/app/owner/components/ui";
import { PRODUCTS } from "@/app/owner/inventory/stock";

// One tap: on or off the till, or in or out of the kitchen. Products are never
// deleted, since past sales and receipts still point to them.
function RowActions({ product, onChanged }: { product: Product; onChanged: () => void }) {
  const [busy, setBusy] = useState<"kitchen" | "active" | null>(null);
  const run = async (key: "kitchen" | "active", work: () => Promise<unknown>, done: string) => {
    setBusy(key);
    try {
      await work();
      toast.success(done);
      onChanged();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update product");
    } finally {
      setBusy(null);
    }
  };
  const toggleKitchen = () => {
    const form = new FormData();
    form.append("sendToKitchen", String(!product.sendToKitchen));
    return run("kitchen", () => ownerRequest(`/products/${product.id}`, { method: "PATCH", body: form }), product.sendToKitchen ? `${product.name} stays out of the kitchen` : `${product.name} goes to the kitchen`);
  };
  const toggleActive = () =>
    run(
      "active",
      () => ownerRequest(`/products/${product.id}/${product.active ? "deactivate" : "activate"}`, { method: "PATCH" }),
      product.active ? `${product.name} is off the till` : `${product.name} is back on the till`,
    );
  return (
    <div className="flex justify-end gap-1">
      <Button
        small
        tone={product.sendToKitchen ? "primary" : "quiet"}
        icon={CookingPot}
        busy={busy === "kitchen"}
        onClick={toggleKitchen}
        aria-label={`${product.sendToKitchen ? "Remove from" : "Send to"} kitchen: ${product.name}`}
        title={product.sendToKitchen ? "Goes to the kitchen" : "Not sent to the kitchen"}
        className={`px-2.5 ${product.sendToKitchen ? "text-lime" : ""}`}
      />
      <Link href={`${PRODUCTS}/${product.id}`} aria-label={`Edit ${product.name}`} title="Edit" className="flex h-8 w-8 items-center justify-center rounded-lg text-ink/60 ring-1 ring-inset ring-ink/10 hover:bg-ivory hover:text-ink">
        <Pencil className="h-4 w-4" />
      </Link>
      <Button
        small
        tone="quiet"
        icon={Power}
        busy={busy === "active"}
        onClick={toggleActive}
        aria-label={`${product.active ? "Deactivate" : "Activate"} ${product.name}`}
        title={product.active ? "Deactivate" : "Activate"}
        className={`px-2.5 ${product.active ? "text-rose-600" : ""}`}
      />
    </div>
  );
}

export default function OwnerProducts() {
  const { data, loading, error, reload } = useOwnerData<Product[]>("/products");
  const categoryList = useOwnerData<Category[]>("/categories");
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");

  // Ingredients have their own page under Inventory.
  const forSale = useMemo(() => (data ?? []).filter((p) => !p.isIngredient).sort((a, b) => a.name.localeCompare(b.name)), [data]);
  const categories = categoryList.data ?? [];
  const query = search.trim().toLowerCase();
  const visible = forSale.filter(
    (p) => (category === "all" || p.category?.id === category) && (!query || p.name.toLowerCase().includes(query) || p.barCode?.toLowerCase().includes(query)),
  );

  const active = forSale.filter((p) => p.active).length;
  const margins = forSale
    .map((p) => {
      const sell = toNumber(p.sellingPrice);
      return sell > 0 ? ((sell - toNumber(p.buyingPrice)) / sell) * 100 : null;
    })
    .filter((m): m is number => m !== null);
  const avgMargin = margins.length ? Math.round(margins.reduce((a, b) => a + b, 0) / margins.length) : 0;

  if (error) return <ErrorState message={error} onRetry={reload} />;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Inventory"
        title="Products"
        description="Manage your catalog, prices and availability. Click a product to change it."
        actions={
          <>
            <LinkButton tone="outline" icon={FolderTree} href={`${PRODUCTS}/categories`}>
              Categories
            </LinkButton>
            <LinkButton icon={Plus} href={`${PRODUCTS}/new`}>
              New product
            </LinkButton>
          </>
        }
      />

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard tone="dark" label="Total products" value={forSale.length.toLocaleString()} icon={Package} hint="In your catalog" />
          <StatCard label="Active" value={active.toLocaleString()} icon={CheckCircle2} hint={`${forSale.length - active} inactive`} />
          <StatCard label="Categories" value={categories.length.toLocaleString()} icon={FolderOpen} hint="Product groups" />
          <StatCard label="Avg. margin" value={`${avgMargin}%`} icon={TrendingUp} hint="Across priced products" />
        </div>
      )}

      <Card>
        <div className="space-y-3 border-b border-ink/6 p-4">
          <div className="flex items-center justify-between gap-3">
            <SearchInput value={search} onChange={setSearch} placeholder="Search by name or barcode" />
            <span className="rounded-full bg-ivory px-2.5 py-1 text-xs font-semibold text-ink/60">{visible.length}</span>
          </div>
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {[{ id: "all", name: "All" }, ...categories].map((c) => {
                const on = category === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCategory(c.id)}
                    aria-pressed={on}
                    className={`h-8 rounded-full px-3.5 text-xs font-semibold transition-colors ${on ? "bg-ink text-lime" : "bg-white text-ink/65 ring-1 ring-inset ring-ink/12 hover:bg-ivory"}`}
                  >
                    {c.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>
        {loading ? (
          <div className="space-y-2 p-5">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-14" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <EmptyState
            icon={Package}
            title={forSale.length === 0 ? "No products yet" : "No matching products"}
            text={forSale.length === 0 ? "Add your first product to start selling." : "Try another search or category."}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] text-sm">
              <thead>
                <tr className="border-b border-ink/8 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-ink/45">
                  <th className="px-5 py-3">Product</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3 text-right">Buy price</th>
                  <th className="px-5 py-3 text-right">Sell price</th>
                  <th className="px-5 py-3 text-right">Margin</th>
                  <th className="px-5 py-3 text-center">Status</th>
                  <th className="px-5 py-3 text-right">Updated</th>
                  <th className="px-5 py-3" aria-label="Actions" />
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/6">
                {visible.map((p) => {
                  const buy = toNumber(p.buyingPrice);
                  const sell = toNumber(p.sellingPrice);
                  const profit = sell - buy;
                  const pct = sell > 0 ? Math.round((profit / sell) * 100) : 0;
                  const photo = p.images?.[0]?.thumbnailUrl ?? p.images?.[0]?.url;
                  const by = (p.updatedBy ?? p.createdBy)?.name;
                  return (
                    <tr key={p.id} className="transition-colors hover:bg-ivory/60">
                      <td className="px-5 py-3">
                        <Link href={`${PRODUCTS}/${p.id}`} className="flex items-center gap-3">
                          <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-ivory ring-1 ring-ink/10">
                            {photo ? (
                              // eslint-disable-next-line @next/next/no-img-element -- photos come from the API's storage
                              <img loading="lazy" decoding="async" src={photo} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <ImageIcon className="h-4.5 w-4.5 text-ink/35" />
                            )}
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate font-semibold text-ink">{p.name}</span>
                            <span className="block truncate font-mono text-[11px] text-ink/45">{p.barCode || "No barcode"}</span>
                          </span>
                        </Link>
                      </td>
                      <td className="px-5 py-3">
                        {p.category?.name ? <span className="rounded-lg bg-ivory px-2 py-1 text-xs font-semibold text-ink/70">{p.category.name}</span> : <span className="text-ink/35">—</span>}
                      </td>
                      <td className="px-5 py-3 text-right font-mono text-ink/70">{buy.toLocaleString()} RWF</td>
                      <td className="px-5 py-3 text-right font-mono font-semibold text-ink">{sell.toLocaleString()} RWF</td>
                      <td className="px-5 py-3 text-right">
                        <span className={`font-mono font-semibold ${profit < 0 ? "text-rose-600" : "text-ink"}`}>
                          {profit >= 0 ? "+" : ""}
                          {profit.toLocaleString()}
                        </span>
                        <span className="block text-[11px] text-ink/45">{pct}%</span>
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                            p.active ? "bg-lime text-ink" : "bg-ivory text-rose-600 ring-1 ring-inset ring-ink/10"
                          }`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${p.active ? "bg-ink" : "bg-rose-600"}`} />
                          {p.active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <span className="block text-xs text-ink/70">{formatDate(p.updatedAt)}</span>
                        {by && <span className="block text-[11px] text-ink/45">by {by}</span>}
                      </td>
                      <td className="px-5 py-3">
                        <RowActions product={p} onChanged={reload} />
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
