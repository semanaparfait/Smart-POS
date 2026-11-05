"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { AlertTriangle, CheckCheck, History, Lock, RotateCw } from "lucide-react";
import { ownerRequest, useOwnerData } from "@/stores/owner/api";
import { ErrorState, SearchInput, Skeleton, rwf } from "@/app/owner/components/ui";
import { Button, Field, FormSection, LinkButton, MoneyInput, TextArea } from "@/app/owner/components/forms";
import { COUNTED, METHOD_LABEL, qty, when, type Closing, type Preview } from "./closing";

// The end of the business day: no order left open, the money counted, the
// stock counted. The owners get the summary on their phone and WhatsApp.
export default function CloseDayPage() {
  const router = useRouter();
  const preview = useOwnerData<Preview>("/day-closings/preview");
  const [money, setMoney] = useState<Record<string, string>>({});
  const [counts, setCounts] = useState<Record<string, string>>({});
  const [note, setNote] = useState("");
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(false);
  const p = preview.data;

  if (preview.error && !p) return <ErrorState message={preview.error} onRetry={preview.reload} />;
  if (!p)
    return (
      <div className="mx-auto max-w-5xl space-y-4">
        <Skeleton className="h-24" />
        <Skeleton className="h-64" />
      </div>
    );

  const counted = (m: string) => Number(money[m] || 0);
  const expectedCounted = COUNTED.reduce((s, m) => s + p.money.expected[m], 0);
  const countedTotal = COUNTED.reduce((s, m) => s + counted(m), 0);
  const moneyFilled = COUNTED.every((m) => money[m] !== undefined && money[m] !== "");
  const difference = countedTotal - expectedCounted;

  const q = search.trim().toLowerCase();
  const rows = p.stock.filter((r) => !q || r.name.toLowerCase().includes(q));
  const countedRows = p.stock.filter((r) => counts[r.productId] !== undefined && counts[r.productId] !== "");
  const off = countedRows.filter((r) => Number(counts[r.productId]) !== r.expected);
  const blocked = p.openOrders.length > 0;

  const close = async () => {
    if (blocked) return toast.error("Pay or cancel the open orders first.");
    if (!moneyFilled) return toast.error("Enter the cash, MoMo and card you counted (0 when there is none).");
    setBusy(true);
    try {
      const saved = await ownerRequest<Closing>("/day-closings", {
        method: "POST",
        body: JSON.stringify({
          counted: { CASH: counted("CASH"), MOMO: counted("MOMO"), CARD: counted("CARD") },
          stock: countedRows.map((r) => ({ productId: r.productId, counted: Number(counts[r.productId]) })),
          note: note || undefined,
        }),
      });
      toast.success("Day closed. The owners got the summary.");
      router.push(`/owner/close-day/${saved.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not close the day");
      setBusy(false);
      preview.reload();
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-ink/45">Finance</p>
          <h1 className="mt-1 text-2xl font-bold tracking-[-0.02em] text-ink md:text-[28px]">Close the day</h1>
          <p className="mt-1 text-sm text-ink/60">
            Since {when(p.from)}
            {p.lastClosedAt ? " (the last closing)" : " (midnight: no closing yet)"}. The owners get the summary on their phone and WhatsApp.
          </p>
        </div>
        <div className="flex gap-2">
          <LinkButton href="/owner/close-day/history" tone="outline" icon={History}>
            Past closings
          </LinkButton>
          <Button tone="outline" icon={RotateCw} busy={preview.loading} onClick={preview.reload}>
            Refresh
          </Button>
        </div>
      </div>

      {/* 1. Open orders block closing */}
      {blocked ? (
        <section className="rounded-2xl border border-rose-200 bg-rose-50/60 p-5">
          <p className="flex items-center gap-2 text-sm font-bold text-rose-800">
            <AlertTriangle className="h-4 w-4" /> {p.openOrders.length} order{p.openOrders.length === 1 ? " is" : "s are"} still open
          </p>
          <p className="mt-1 text-sm text-rose-800/80">Take payment or cancel each one, then press Refresh. The day can&apos;t close while money is still owed on an order.</p>
          <ul className="mt-3 divide-y divide-rose-200/70 rounded-xl bg-white">
            {p.openOrders.map((o) => (
              <li key={o.id}>
                <Link href={`/owner/orders/${o.id}`} className="flex flex-wrap items-center gap-3 px-4 py-2.5 text-sm hover:bg-ivory">
                  <span className="font-semibold text-ink">#{o.id.replace(/-/g, "").slice(-6).toUpperCase()}</span>
                  <span className="flex-1 text-ink/60">
                    {o.staff}
                    {o.customerName ? ` · ${o.customerName}` : ""} · {when(o.createdAt)}
                  </span>
                  <span className="text-xs text-ink/55">{o.status.toLowerCase()}</span>
                  <span className="font-semibold text-ink">{rwf(o.total)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <p className="flex items-center gap-2 rounded-2xl bg-emerald-50 px-5 py-3 text-sm font-medium text-emerald-800">
          <CheckCheck className="h-4 w-4" /> No open orders. {p.orders.paid} paid · {rwf(p.orders.paidTotal)} in sales · {p.orders.cancelled} cancelled.
        </p>
      )}

      {/* 2. Money */}
      <FormSection title="Money" description="Count the drawer and check MoMo and card. Expected comes from today's sales and service payments, less till expenses.">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="text-left text-[11px] font-semibold uppercase tracking-[0.1em] text-ink/45">
                <th className="py-2">Method</th>
                <th className="py-2 text-right">Expected</th>
                <th className="py-2 pl-4">Counted</th>
                <th className="py-2 text-right">Difference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/6">
              {COUNTED.map((m) => {
                const filled = money[m] !== undefined && money[m] !== "";
                const diff = counted(m) - p.money.expected[m];
                return (
                  <tr key={m}>
                    <td className="py-2.5 font-medium text-ink">{METHOD_LABEL[m]}</td>
                    <td className="py-2.5 text-right tabular-nums text-ink/70">{rwf(p.money.expected[m])}</td>
                    <td className="py-2 pl-4">
                      <div className="max-w-48">
                        <MoneyInput value={money[m] ?? ""} onChange={(v) => setMoney((x) => ({ ...x, [m]: v }))} />
                      </div>
                    </td>
                    <td className={`py-2.5 text-right font-semibold tabular-nums ${!filled ? "text-ink/30" : Math.round(diff) === 0 ? "text-emerald-700" : diff < 0 ? "text-rose-600" : "text-ink"}`}>
                      {!filled ? "—" : Math.round(diff) === 0 ? "Matches" : rwf(diff)}
                    </td>
                  </tr>
                );
              })}
              <tr>
                <td className="py-2.5 text-ink/60">{METHOD_LABEL.CREDIT}</td>
                <td className="py-2.5 text-right tabular-nums text-ink/60">{rwf(p.money.expected.CREDIT)}</td>
                <td className="py-2.5 pl-4 text-xs text-ink/45" colSpan={2}>
                  Not counted: customers still owe it.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className={`flex flex-wrap justify-between gap-2 rounded-xl px-4 py-3 text-sm ${!moneyFilled ? "bg-ivory text-ink/60" : Math.round(difference) === 0 ? "bg-emerald-50 text-emerald-800" : difference < 0 ? "bg-rose-50 text-rose-800" : "bg-lime/40 text-ink"}`}>
          <span>
            Sales {rwf(p.money.sales)}
            {p.money.services ? ` · services ${rwf(p.money.services)}` : ""}
            {p.money.tillExpenses ? ` · till expenses −${rwf(p.money.tillExpenses)}` : ""}
          </span>
          <span className="font-semibold">
            {!moneyFilled ? "Enter what you counted" : Math.round(difference) === 0 ? "All money matches" : difference < 0 ? `${rwf(-difference)} missing` : `${rwf(difference)} more than expected`}
          </span>
        </div>
        {p.moneyChecks.flagged > 0 && (
          <p className="text-xs text-rose-700">
            {p.moneyChecks.flagged} worker money check{p.moneyChecks.flagged === 1 ? " was" : "s were"} flagged today.
          </p>
        )}
      </FormSection>

      {/* 3. Stock */}
      <FormSection title="Stock" description="Count what is really there. Opening + received − sold − wasted = expected. Products you don't count keep the system number.">
        <div className="flex flex-wrap items-center gap-2">
          <div className="min-w-60 flex-1">
            <SearchInput value={search} onChange={setSearch} placeholder="Find a product" />
          </div>
          <Button
            small
            tone="outline"
            onClick={() => setCounts(Object.fromEntries(p.stock.map((r) => [r.productId, String(r.expected)])))}
          >
            Fill all with expected
          </Button>
          <Button small tone="quiet" onClick={() => setCounts({})}>
            Clear
          </Button>
        </div>
        <p className="text-xs text-ink/55">
          {countedRows.length} of {p.stock.length} counted
          {off.length ? ` · ${off.length} don't match` : countedRows.length ? " · all match" : ""}
        </p>
        <div className="max-h-[520px] overflow-auto rounded-xl border border-ink/10">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="sticky top-0 bg-white">
              <tr className="border-b border-ink/8 text-left text-[11px] font-semibold uppercase tracking-[0.1em] text-ink/45">
                <th className="px-3 py-2">Product</th>
                <th className="px-2 py-2 text-right">Opening</th>
                <th className="px-2 py-2 text-right">In</th>
                <th className="px-2 py-2 text-right">Sold</th>
                <th className="px-2 py-2 text-right">Wasted</th>
                <th className="px-2 py-2 text-right">Expected</th>
                <th className="px-3 py-2">Counted</th>
                <th className="px-3 py-2 text-right">Difference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/6">
              {rows.map((r) => {
                const value = counts[r.productId] ?? "";
                const diff = value === "" ? null : Number(value) - r.expected;
                return (
                  <tr key={r.productId} className={diff ? "bg-rose-50/40" : ""}>
                    <td className="px-3 py-2">
                      <span className="font-medium text-ink">{r.name}</span> <span className="text-xs text-ink/45">{r.unit}</span>
                    </td>
                    <td className="px-2 py-2 text-right tabular-nums text-ink/60">{qty(r.opening)}</td>
                    <td className="px-2 py-2 text-right tabular-nums text-ink/60">{r.received ? `+${qty(r.received)}` : "—"}</td>
                    <td className="px-2 py-2 text-right tabular-nums text-ink/60">{r.sold ? `−${qty(r.sold)}` : "—"}</td>
                    <td className="px-2 py-2 text-right tabular-nums text-ink/60">{r.wasted ? `−${qty(r.wasted)}` : "—"}</td>
                    <td className="px-2 py-2 text-right font-semibold tabular-nums text-ink">{qty(r.expected)}</td>
                    <td className="px-3 py-1.5">
                      <input
                        inputMode="decimal"
                        value={value}
                        onChange={(e) => setCounts((c) => ({ ...c, [r.productId]: e.target.value.replace(/[^0-9.]/g, "") }))}
                        placeholder="—"
                        aria-label={`Counted ${r.name}`}
                        className="h-9 w-24 rounded-lg border border-ink/12 bg-white px-2.5 text-right text-sm text-ink outline-none focus:border-ink focus:ring-4 focus:ring-lime/40"
                      />
                    </td>
                    <td className={`px-3 py-2 text-right font-semibold tabular-nums ${diff === null ? "text-ink/30" : diff === 0 ? "text-emerald-700" : "text-rose-600"}`}>
                      {diff === null ? "—" : diff === 0 ? "Matches" : `${diff > 0 ? "+" : ""}${qty(diff)}`}
                    </td>
                  </tr>
                );
              })}
              {!rows.length && (
                <tr>
                  <td colSpan={8} className="px-3 py-6 text-center text-ink/55">
                    {p.stock.length ? "No product matches." : "No product counts stock."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </FormSection>

      <FormSection title="Note" description="Optional, sent with the summary. e.g. why money is short.">
        <Field label="Note">
          <TextArea value={note} onChange={(e) => setNote(e.target.value)} />
        </Field>
      </FormSection>

      <div className="sticky bottom-4 z-10 flex flex-wrap items-center justify-end gap-3 rounded-2xl border border-ink/10 bg-white/95 px-4 py-3 shadow-[0_8px_24px_rgba(32,40,59,0.10)] backdrop-blur">
        <span className="mr-auto text-xs text-ink/55">
          {blocked ? "Pay or cancel the open orders first." : "Counted stock replaces the system number, so tomorrow opens with what is really there."}
        </span>
        <Button tone="lime" icon={Lock} busy={busy} disabled={blocked} onClick={close}>
          Close the day
        </Button>
      </div>
    </div>
  );
}
