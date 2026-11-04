"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useOwnerData } from "@/stores/owner/api";
import type { IngredientUsage, Page, Product, StockMovement } from "@/app/owner/types";
import { Badge, SearchInput, rwf, toNumber } from "@/app/owner/components/ui";
import { MOVEMENT_REASON, expiryLabel, formatQty, formatStock, isLowStock, isOut } from "@/app/owner/inventory/stock";
import { Choice, Empty, Loading, Panel, stamp, type CompanyDetails } from "./parts";

function Movements({ productId }: { productId: string }) {
  const moves = useOwnerData<Page<StockMovement>>(`/products/${productId}/stock-movements?limit=50`);
  return (
    <div className="border-t border-ink/6 bg-ivory/40 px-4 py-3">
      <Loading {...moves}>
        {(page) => (
          <ul className="max-h-72 space-y-1 overflow-y-auto text-xs text-ink/75">
            {page.data.map((m) => (
              <li key={m.id} className="flex flex-wrap justify-between gap-2">
                <span>
                  {stamp(m.createdAt)} · {MOVEMENT_REASON[m.reason] ?? m.reason} · {m.user?.name ?? "—"}
                  {m.note ? ` · ${m.note}` : ""}
                </span>
                <span className={`font-semibold ${toNumber(m.change) < 0 ? "text-rose-600" : "text-emerald-700"}`}>
                  {toNumber(m.change) > 0 ? "+" : ""}
                  {formatQty(m.change)} → {formatQty(m.quantityAfter)}
                </span>
              </li>
            ))}
            {!page.data.length && <li>No stock changes yet.</li>}
            {page.total > page.data.length && <li className="text-ink/45">Showing the latest {page.data.length} of {page.total}.</li>}
          </ul>
        )}
      </Loading>
    </div>
  );
}

function ProductRow({ p }: { p: Product }) {
  const [open, setOpen] = useState(false);
  const low = p.trackStock && isLowStock(p);
  return (
    <li>
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex w-full flex-wrap items-center gap-3 px-4 py-2.5 text-left text-sm hover:bg-ivory/60">
        <span className="min-w-0 flex-1">
          <span className="block truncate font-semibold text-ink">
            {p.name}
            {p.isIngredient && <span className="ml-1.5 text-[11px] font-normal text-ink/45">Ingredient</span>}
          </span>
          <span className="block truncate text-xs text-ink/55">
            {p.category?.name ?? "No category"}
            {p.barCode ? ` · ${p.barCode}` : ""}
            {p.supplier ? ` · ${p.supplier}` : ""}
            {p.expiryDate ? ` · ${expiryLabel(p.expiryDate)}` : ""}
          </span>
        </span>
        <span className="w-24 text-right text-xs text-ink/60">Buy {rwf(p.buyingPrice)}</span>
        <span className="w-24 text-right font-semibold text-ink">{p.isIngredient ? "—" : rwf(p.sellingPrice)}</span>
        <span className={`w-28 text-right text-xs ${low ? "font-semibold text-rose-600" : "text-ink/70"}`}>{p.trackStock ? formatStock(p.stockQuantity, p) : "Not counted"}</span>
        <Badge tone={p.active ? "success" : "muted"}>{p.active ? (p.isIngredient ? "In use" : "On sale") : "Off"}</Badge>
        <ChevronDown className={`h-4 w-4 text-ink/35 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (p.trackStock ? <Movements productId={p.id} /> : <p className="border-t border-ink/6 bg-ivory/40 px-4 py-3 text-xs text-ink/60">Stock is not counted for this one.</p>)}
    </li>
  );
}

type Kind = "all" | "products" | "ingredients" | "off";

export function ProductsTab({ products, details }: { products: Product[]; details: CompanyDetails }) {
  const [search, setSearch] = useState("");
  const [kind, setKind] = useState<Kind>("all");
  const [category, setCategory] = useState("ALL");
  const q = search.trim().toLowerCase();
  const list = products.filter(
    (p) =>
      (kind === "all" || (kind === "products" && !p.isIngredient) || (kind === "ingredients" && p.isIngredient) || (kind === "off" && !p.active)) &&
      (category === "ALL" || p.category?.id === category) &&
      (!q || [p.name, p.barCode, p.sku, p.supplier].some((v) => v?.toLowerCase().includes(q))),
  );
  const stockValue = products.filter((p) => p.trackStock).reduce((s, p) => s + Math.max(0, toNumber(p.stockQuantity)) * toNumber(p.buyingPrice), 0);
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Choice value={kind} onChange={setKind} options={[{ value: "all", label: "All" }, { value: "products", label: "Products" }, { value: "ingredients", label: "Ingredients" }, { value: "off", label: "Off sale" }]} />
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="h-8 rounded-lg border border-ink/12 bg-white px-2 text-xs text-ink">
          <option value="ALL">Every category</option>
          {details.categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <SearchInput value={search} onChange={setSearch} placeholder="Name, barcode or supplier" />
      <p className="text-xs text-ink/55">
        {list.length} shown · stock worth {rwf(stockValue)} at buying price · open one to see its stock history
      </p>
      <Panel heading={`Products · ${products.length}`}>
        {list.map((p) => (
          <ProductRow key={p.id} p={p} />
        ))}
        {!list.length && <Empty text="Nothing here." />}
      </Panel>
      <Panel heading={`Categories · ${details.categories.length}`}>
        {details.categories.map((c) => (
          <li key={c.id} className="flex justify-between gap-3 px-4 py-2.5 text-sm">
            <span className="font-semibold text-ink">{c.name}</span>
            <span className="text-xs text-ink/55">{(() => { const n = products.filter((p) => p.category?.id === c.id).length; return `${n} ${n === 1 ? "product" : "products"}`; })()}</span>
          </li>
        ))}
        {!details.categories.length && <Empty text="No categories." />}
      </Panel>
    </div>
  );
}

type View = "low" | "expiring" | "usage";

export function StockTab({ companyId }: { companyId: string }) {
  const [view, setView] = useState<View>("low");
  const [days, setDays] = useState("30");
  const q = `companyId=${companyId}`;
  const low = useOwnerData<Product[]>(view === "low" ? `/products/low-stock?${q}` : null);
  const expiring = useOwnerData<Product[]>(view === "expiring" ? `/products/expiring?days=${days}&${q}` : null);
  const usage = useOwnerData<IngredientUsage[]>(view === "usage" ? `/products/ingredient-usage?days=${days}&${q}` : null);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Choice value={view} onChange={setView} options={[{ value: "low", label: "Running low" }, { value: "expiring", label: "Expiring" }, { value: "usage", label: "Usage & losses" }]} />
        {view !== "low" && <Choice value={days} onChange={setDays} options={[{ value: "7", label: "7 days" }, { value: "30", label: "30 days" }, { value: "90", label: "90 days" }]} />}
      </div>

      {view === "low" && (
        <Loading {...low}>
          {(rows) => (
            <Panel heading={`Running low · ${rows.length}`}>
              {rows.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
                  <span className="truncate font-semibold text-ink">{p.name}</span>
                  <span className={`text-xs font-semibold ${isOut(p) ? "text-rose-600" : "text-ink/70"}`}>
                    {isOut(p) ? "Out · " : ""}
                    {formatStock(p.stockQuantity, p)} (alert at {formatQty(p.lowStockLevel)})
                  </span>
                </li>
              ))}
              {!rows.length && <Empty text="Stock looks good." />}
            </Panel>
          )}
        </Loading>
      )}

      {view === "expiring" && (
        <Loading {...expiring}>
          {(rows) => (
            <Panel heading={`Expiring in ${days} days · ${rows.length}`}>
              {rows.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
                  <span className="truncate font-semibold text-ink">{p.name}</span>
                  <span className="text-xs text-ink/70">
                    {p.expiryDate ? expiryLabel(p.expiryDate) : "—"} · {formatStock(p.stockQuantity, p)}
                  </span>
                </li>
              ))}
              {!rows.length && <Empty text="Nothing expires soon." />}
            </Panel>
          )}
        </Loading>
      )}

      {view === "usage" && (
        <Loading {...usage}>
          {(rows) => {
            const lost = rows.reduce((s, r) => s + (r.wasted + Math.max(0, -r.counted)) * r.cost, 0);
            return (
              <div className="overflow-x-auto rounded-xl border border-ink/10">
                <p className="border-b border-ink/6 px-4 py-2.5 text-xs font-bold text-ink/60">
                  Ingredients, last {days} days · lost {rwf(lost)}
                </p>
                <table className="w-full min-w-[620px] text-sm">
                  <thead>
                    <tr className="border-b border-ink/8 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-ink/45">
                      <th className="px-4 py-2">Ingredient</th>
                      <th className="px-4 py-2 text-right">Received</th>
                      <th className="px-4 py-2 text-right">Used</th>
                      <th className="px-4 py-2 text-right">Wasted</th>
                      <th className="px-4 py-2 text-right">Count gap</th>
                      <th className="px-4 py-2 text-right">Used worth</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink/6">
                    {rows.map((r) => (
                      <tr key={r.id}>
                        <td className="px-4 py-2 font-semibold text-ink">{r.name}</td>
                        <td className="px-4 py-2 text-right text-ink/70">
                          {formatQty(r.received)} {r.unit}
                        </td>
                        <td className="px-4 py-2 text-right text-ink/70">
                          {formatQty(r.used)} {r.unit}
                        </td>
                        <td className={`px-4 py-2 text-right ${r.wasted ? "text-rose-600" : "text-ink/70"}`}>
                          {formatQty(r.wasted)} {r.unit}
                        </td>
                        <td className={`px-4 py-2 text-right ${r.counted < 0 ? "text-rose-600" : "text-ink/70"}`}>
                          {formatQty(r.counted)} {r.unit}
                        </td>
                        <td className="px-4 py-2 text-right font-semibold text-ink">{rwf(r.used * r.cost)}</td>
                      </tr>
                    ))}
                    {!rows.length && (
                      <tr>
                        <td colSpan={6} className="px-4 py-3 text-ink/55">
                          No ingredients used.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            );
          }}
        </Loading>
      )}
    </div>
  );
}
