"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, Banknote, Boxes, Receipt } from "lucide-react";
import { useOwnerData } from "@/stores/owner/api";
import { ErrorState, Skeleton, rwf } from "@/app/owner/components/ui";
import { COUNTED, METHOD_LABEL, qty, when, type Closing } from "../closing";

// One closed day: the summary the owners got, in full.
export default function ClosingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const closing = useOwnerData<Closing>(`/day-closings/${id}`);
  const c = closing.data;
  if (closing.error && !c) return <ErrorState message={closing.error} onRetry={closing.reload} />;
  if (!c) return <Skeleton className="mx-auto h-96 max-w-4xl" />;

  const counted = c.stock.filter((s) => s.counted !== null);
  const off = counted.filter((s) => s.difference !== 0);
  const stockValue = off.reduce((s, r) => s + r.value, 0);
  const day = new Date(`${c.businessDay}T12:00:00`).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-10">
      <div>
        <Link href="/owner/close-day/history" className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink/55 hover:text-ink">
          <ArrowLeft className="h-4 w-4" /> Past closings
        </Link>
        <h1 className="mt-3 text-2xl font-bold tracking-[-0.02em] text-ink">{day}</h1>
        <p className="mt-1 text-sm text-ink/60">
          {when(c.openedAt)} to {when(c.closedAt)} · closed by {c.closedByName}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { icon: Receipt, label: "Sales", value: rwf(c.orders.paidTotal), hint: `${c.orders.paid} paid · ${c.orders.cancelled} cancelled` },
          {
            icon: Banknote,
            label: "Money",
            value: Math.round(c.money.difference) === 0 ? "Matches" : c.money.difference < 0 ? `${rwf(-c.money.difference)} missing` : `${rwf(c.money.difference)} over`,
            hint: "Cash, MoMo and card counted",
            bad: Math.round(c.money.difference) < 0,
          },
          {
            icon: Boxes,
            label: "Stock",
            value: !counted.length ? "Not counted" : off.length ? `${off.length} off` : "All match",
            hint: counted.length ? `${counted.length} products counted${off.length ? ` · worth ${rwf(stockValue)}` : ""}` : "System numbers kept",
            bad: off.length > 0,
          },
        ].map(({ icon: Icon, label, value, hint, bad }) => (
          <div key={label} className="rounded-2xl border border-ink/10 bg-white p-5">
            <p className="flex items-center gap-1.5 text-[13px] font-medium text-ink/60">
              <Icon className="h-4 w-4" /> {label}
            </p>
            <p className={`mt-2 text-xl font-bold tracking-[-0.01em] ${bad ? "text-rose-600" : "text-ink"}`}>{value}</p>
            <p className="mt-1 text-xs text-ink/55">{hint}</p>
          </div>
        ))}
      </div>

      <section className="rounded-2xl border border-ink/10 bg-white">
        <h2 className="border-b border-ink/6 px-5 py-3 text-sm font-semibold text-ink">Money</h2>
        <table className="w-full text-sm">
          <tbody className="divide-y divide-ink/6">
            {COUNTED.map((m) => {
              const diff = c.money.counted[m] - c.money.expected[m];
              return (
                <tr key={m}>
                  <td className="px-5 py-2.5 text-ink">{METHOD_LABEL[m]}</td>
                  <td className="px-3 py-2.5 text-right text-ink/60">Expected {rwf(c.money.expected[m])}</td>
                  <td className="px-3 py-2.5 text-right text-ink">Counted {rwf(c.money.counted[m])}</td>
                  <td className={`px-5 py-2.5 text-right font-semibold ${Math.round(diff) === 0 ? "text-emerald-700" : diff < 0 ? "text-rose-600" : "text-ink"}`}>
                    {Math.round(diff) === 0 ? "Matches" : rwf(diff)}
                  </td>
                </tr>
              );
            })}
            <tr>
              <td className="px-5 py-2.5 text-ink/60">{METHOD_LABEL.CREDIT}</td>
              <td className="px-3 py-2.5 text-right text-ink/60" colSpan={3}>
                {rwf(c.money.expected.CREDIT)} given on credit
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="rounded-2xl border border-ink/10 bg-white">
        <h2 className="border-b border-ink/6 px-5 py-3 text-sm font-semibold text-ink">Stock</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-sm">
            <thead>
              <tr className="border-b border-ink/6 text-left text-[11px] font-semibold uppercase tracking-[0.1em] text-ink/45">
                <th className="px-5 py-2">Product</th>
                <th className="px-2 py-2 text-right">Opening</th>
                <th className="px-2 py-2 text-right">In</th>
                <th className="px-2 py-2 text-right">Sold</th>
                <th className="px-2 py-2 text-right">Wasted</th>
                <th className="px-2 py-2 text-right">Expected</th>
                <th className="px-2 py-2 text-right">Counted</th>
                <th className="px-5 py-2 text-right">Difference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/6">
              {[...c.stock]
                .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
                .map((r) => (
                  <tr key={r.productId} className={r.difference ? "bg-rose-50/40" : ""}>
                    <td className="px-5 py-2 text-ink">
                      {r.name} <span className="text-xs text-ink/45">{r.unit}</span>
                    </td>
                    <td className="px-2 py-2 text-right text-ink/60">{qty(r.opening)}</td>
                    <td className="px-2 py-2 text-right text-ink/60">{r.received ? `+${qty(r.received)}` : "—"}</td>
                    <td className="px-2 py-2 text-right text-ink/60">{r.sold ? `−${qty(r.sold)}` : "—"}</td>
                    <td className="px-2 py-2 text-right text-ink/60">{r.wasted ? `−${qty(r.wasted)}` : "—"}</td>
                    <td className="px-2 py-2 text-right font-semibold text-ink">{qty(r.expected)}</td>
                    <td className="px-2 py-2 text-right text-ink">{r.counted === null ? "—" : qty(r.counted)}</td>
                    <td className={`px-5 py-2 text-right font-semibold ${r.counted === null ? "text-ink/30" : r.difference === 0 ? "text-emerald-700" : "text-rose-600"}`}>
                      {r.counted === null ? "—" : r.difference === 0 ? "Matches" : `${r.difference > 0 ? "+" : ""}${qty(r.difference)} · ${rwf(r.value)}`}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>

      {c.note && <p className="rounded-2xl bg-ivory px-5 py-4 text-sm text-ink/80">“{c.note}”</p>}
    </div>
  );
}
