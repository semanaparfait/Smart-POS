"use client";

import { useState } from "react";
import { BarChart3, ClipboardList, Info, ShieldAlert, Trash2, UtensilsCrossed } from "lucide-react";
import { useOwnerData } from "@/stores/owner/api";
import type { IngredientUsage } from "@/app/owner/types";
import { Card, EmptyState, ErrorState, PageHeader, Skeleton, StatCard, Tabs, rwf } from "@/app/owner/components/ui";
import { LinkButton } from "@/app/owner/components/forms";
import { formatQty } from "@/app/owner/inventory/stock";

type Days = "7" | "30" | "90";
// Above this share of what recipes used, unexplained loss is worth looking into.
const WATCH_PCT = 5;
const missingOf = (row: IngredientUsage) => Math.max(0, -row.counted);
// Unexplained loss as a share of what recipes used and staff recorded as waste.
const shareOf = (row: IngredientUsage) => (row.used + row.wasted > 0 ? Math.round((missingOf(row) / (row.used + row.wasted)) * 100) : 0);

// Where the ingredients went, and how much went missing that nothing explains.
export default function UsagePage() {
  const [days, setDays] = useState<Days>("30");
  const { data, loading, error, reload } = useOwnerData<IngredientUsage[]>(`/products/ingredient-usage?days=${days}`);
  const rows = data ?? [];

  const usedValue = rows.reduce((sum, r) => sum + r.used * r.cost, 0);
  const wastedValue = rows.reduce((sum, r) => sum + r.wasted * r.cost, 0);
  const missingValue = rows.reduce((sum, r) => sum + missingOf(r) * r.cost, 0);
  const counted = rows.some((r) => r.counted !== 0);
  const wastePct = usedValue + wastedValue > 0 ? Math.round((wastedValue / (usedValue + wastedValue)) * 100) : 0;
  // Biggest money loss first, so the owner starts with what matters most.
  const sorted = [...rows].sort((a, b) => missingOf(b) * b.cost - missingOf(a) * a.cost || b.used - a.used);

  if (error) return <ErrorState message={error} onRetry={reload} />;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Inventory"
        title="Usage and losses"
        description="What recipes used, what was wasted, and what is missing. Values use today's cost."
        actions={
          <LinkButton icon={ClipboardList} href="/owner/inventory/count">
            Count stock
          </LinkButton>
        }
      />
      <Tabs
        options={[
          { value: "7", label: "7 days" },
          { value: "30", label: "30 days" },
          { value: "90", label: "90 days" },
        ]}
        value={days}
        onChange={setDays}
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard tone="dark" label="Used in food" value={rwf(usedValue)} icon={UtensilsCrossed} hint="Taken out by recipes" />
        <StatCard label="Wasted" value={rwf(wastedValue)} icon={Trash2} hint={`${wastePct}% of what was used`} />
        <StatCard label="Unexplained loss" value={counted ? rwf(missingValue) : "No count yet"} icon={ShieldAlert} hint="Missing at a stock count" />
      </div>
      <div className="flex items-start gap-2.5 rounded-2xl border border-ink/10 bg-white p-4">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-ink/45" />
        <p className="text-xs leading-5 text-ink/70">
          {counted
            ? "Unexplained loss is stock a count found missing that no sale or recorded waste explains. It usually means waste nobody recorded, recipe amounts set too low, or theft. Check the ingredients at the top first."
            : "Count your stock to see what is missing. SmartPOS compares the count with what recipes and recorded waste say should be left, and shows the difference here."}
        </p>
      </div>
      <Card>
        {loading && rows.length === 0 ? (
          <div className="space-y-2 p-5">
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
          </div>
        ) : rows.length === 0 ? (
          <EmptyState icon={BarChart3} title="Nothing to show" text="Add ingredients and recipes, and usage will build up with each sale." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] text-sm">
              <thead>
                <tr className="border-b border-ink/8 text-[11px] font-bold uppercase tracking-[0.12em] text-ink/45">
                  <th className="px-5 py-3 text-left">Ingredient</th>
                  <th className="px-5 py-3 text-right">Used</th>
                  <th className="px-5 py-3 text-right">Wasted</th>
                  <th className="px-5 py-3 text-right">Received</th>
                  <th className="px-5 py-3 text-right">Count difference</th>
                  <th className="px-5 py-3 text-right">Missing value</th>
                  <th className="px-5 py-3 text-right">Of use</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/6">
                {sorted.map((row) => {
                  const missing = missingOf(row);
                  const share = shareOf(row);
                  const watch = missing > 0 && share >= WATCH_PCT;
                  return (
                    <tr key={row.id}>
                      <td className="px-5 py-3">
                        <p className="font-semibold text-ink">{row.name}</p>
                        {watch && <p className="text-[11px] text-rose-600">Worth checking</p>}
                      </td>
                      <td className="px-5 py-3 text-right font-semibold text-ink">
                        {formatQty(row.used)} {row.unit}
                      </td>
                      <td className="px-5 py-3 text-right text-ink/65">
                        {formatQty(row.wasted)} {row.unit}
                      </td>
                      <td className="px-5 py-3 text-right text-ink/65">
                        {formatQty(row.received)} {row.unit}
                      </td>
                      <td className={`px-5 py-3 text-right font-semibold ${row.counted < 0 ? "text-rose-600" : "text-ink"}`}>
                        {row.counted === 0 ? "—" : `${row.counted > 0 ? "+" : ""}${formatQty(row.counted)} ${row.unit}`}
                      </td>
                      <td className={`px-5 py-3 text-right ${missing > 0 ? "text-rose-600" : "text-ink/65"}`}>{missing > 0 ? rwf(missing * row.cost) : "—"}</td>
                      <td className={`px-5 py-3 text-right ${watch ? "text-rose-600" : "text-ink/65"}`}>{missing > 0 ? `${share}%` : "—"}</td>
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
