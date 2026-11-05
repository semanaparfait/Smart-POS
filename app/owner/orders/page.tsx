"use client";

import { Fragment, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Bike, Download, Receipt, ShieldCheck, Store } from "lucide-react";
import { ordersSince, useOwnerData } from "@/stores/owner/api";
import type { Order } from "@/app/owner/types";
import { Avatar, Badge, Card, EmptyState, ErrorState, PageHeader, SearchInput, Skeleton, Tabs, dayKey, formatDate, personName, rwf, toNumber } from "@/app/owner/components/ui";
import { LinkButton } from "@/app/owner/components/forms";
import { PAYMENT_LABELS, isPaid, sumOf } from "@/app/owner/sales";
import { downloadCsv, orderNumber, paidAt } from "@/app/owner/finance/money";

type Period = "today" | "week" | "month" | "all";
type StatusFilter = "all" | "paid" | "open" | "cancelled";
type CheckFilter = "all" | "awaiting" | "verified" | "flagged";
type OrderCheck = CheckFilter | "unpaid";

interface Check {
  date: string;
  worker: { id: string };
  status: "VERIFIED" | "FLAGGED";
  decidedByName: string;
}

const STATUS: Record<string, { label: string; tone: "ink" | "lime" | "muted" | "danger" }> = {
  COMPLETED: { label: "Paid", tone: "ink" },
  CANCELLED: { label: "Cancelled", tone: "danger" },
  PENDING: { label: "New", tone: "lime" },
  PREPARING: { label: "Preparing", tone: "lime" },
  READY: { label: "Ready", tone: "lime" },
  SERVED: { label: "Served", tone: "muted" },
};
const CHECK_META: Record<OrderCheck, { label: string; cls: string }> = {
  verified: { label: "Money checked", cls: "bg-ink text-lime" },
  flagged: { label: "Money flagged", cls: "bg-rose-50 text-rose-700" },
  awaiting: { label: "Not checked", cls: "bg-lime/40 text-ink" },
  unpaid: { label: "Not paid yet", cls: "bg-ivory text-ink/55 ring-1 ring-inset ring-ink/10" },
  all: { label: "", cls: "" },
};

const periodStart = (period: Period) => {
  const now = new Date();
  if (period === "today") return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (period === "week") return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
  if (period === "month") return new Date(now.getFullYear(), now.getMonth(), 1);
  return null;
};

const matchesStatus = (order: Order, status: StatusFilter) =>
  status === "all" ||
  (status === "paid" && isPaid(order)) ||
  (status === "cancelled" && order.status === "CANCELLED") ||
  (status === "open" && !isPaid(order) && order.status !== "CANCELLED");

const paymentText = (order: Order) => (order.payments ?? []).map((p) => PAYMENT_LABELS[p.method] ?? p.method).join(" + ") || "—";
const dayLabel = (iso: string) => {
  const d = new Date(iso).toDateString();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return d === new Date().toDateString() ? "Today" : d === yesterday.toDateString() ? "Yesterday" : formatDate(iso);
};

// Every sale from every till: each worker's orders, and whether their money was checked.
export default function OwnerOrders() {
  const router = useRouter();
  const [period, setPeriod] = useState<Period>("today");
  // Only the period on screen is loaded ("All" loads everything).
  const { data, loading, error, reload } = useOwnerData<Order[]>(ordersSince(periodStart(period)));
  const checks = useOwnerData<Check[]>("/money-checks");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [check, setCheck] = useState<CheckFilter>("all");
  const [workerId, setWorkerId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // A paid order is checked when its worker's money for that day was counted.
  const checkOf = useMemo(() => {
    const list = checks.data ?? [];
    return (o: Order): { check: OrderCheck; by?: string } => {
      if (o.status !== "COMPLETED") return { check: "unpaid" };
      const who = (o.collectedBy ?? o.user)?.id;
      const record = list.find((c) => c.date === dayKey(new Date(paidAt(o))) && c.worker.id === who);
      return record ? { check: record.status === "FLAGGED" ? "flagged" : "verified", by: record.decidedByName } : { check: "awaiting" };
    };
  }, [checks.data]);

  const inPeriod = useMemo(() => {
    const from = periodStart(period);
    return (data ?? []).filter((o) => !from || new Date(o.createdAt) >= from).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [data, period]);

  const workers = useMemo(() => {
    const byId = new Map<string, { id: string; name: string; count: number }>();
    for (const o of inPeriod) {
      if (!o.user) continue;
      const w = byId.get(o.user.id) ?? { id: o.user.id, name: personName(o.user), count: 0 };
      w.count += 1;
      byId.set(o.user.id, w);
    }
    return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [inPeriod]);

  const byWorker = inPeriod.filter((o) => !workerId || o.user?.id === workerId);
  const checkCounts = { all: byWorker.length, awaiting: 0, verified: 0, flagged: 0 };
  for (const o of byWorker) {
    const c = checkOf(o).check;
    if (c !== "unpaid" && c !== "all") checkCounts[c] += 1;
  }
  const query = search.trim().toLowerCase();
  const visible = byWorker.filter(
    (o) =>
      matchesStatus(o, status) &&
      (check === "all" || checkOf(o).check === check) &&
      (!query ||
        [orderNumber(o), o.customerName, personName(o.user), ...(o.items ?? []).map((i) => i.product?.name)].filter(Boolean).some((v) => String(v).toLowerCase().includes(query))),
  );
  const count = (s: StatusFilter) => byWorker.filter((o) => matchesStatus(o, s)).length;
  const paid = byWorker.filter(isPaid);
  const moneyOf = (c: OrderCheck) => sumOf(paid.filter((o) => checkOf(o).check === c));
  const selected = workers.find((w) => w.id === workerId);

  const exportCsv = () =>
    downloadCsv(`orders-${new Date().toISOString().slice(0, 10)}.csv`, [
      ["Date", "Order", "Type", "Customer", "Staff", "Items", "Payment", "Total", "Status", "Money check"],
      ...visible.map((o) => [
        new Date(o.createdAt).toLocaleString("en-GB"),
        orderNumber(o),
        o.type === "DELIVERY" ? "Delivery" : "In store",
        o.customerName ?? "",
        personName(o.user),
        (o.items ?? []).map((i) => `${i.quantity} x ${i.product?.name ?? ""}`).join("; "),
        paymentText(o),
        String(toNumber(o.total)),
        STATUS[o.status]?.label ?? o.status,
        CHECK_META[checkOf(o).check].label,
      ]),
    ]);

  if (error) return <ErrorState message={error} onRetry={reload} />;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Sales"
        title="Orders"
        description="See each worker's orders and whether their money was checked."
        actions={
          <>
            <LinkButton tone="outline" icon={ShieldCheck} href="/owner/money-checks">
              Check money
            </LinkButton>
            <button
              type="button"
              onClick={exportCsv}
              disabled={!visible.length}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-ink px-4 text-sm font-semibold text-white hover:bg-ink-soft disabled:opacity-50"
            >
              <Download className="h-4 w-4 text-lime" />
              Export
            </button>
          </>
        }
      />

      <div className="flex flex-wrap gap-3">
        <Tabs options={[{ value: "today", label: "Today" }, { value: "week", label: "Last 7 days" }, { value: "month", label: "This month" }, { value: "all", label: "All" }]} value={period} onChange={setPeriod} />
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setWorkerId(null)}
          aria-pressed={!workerId}
          className={`inline-flex h-10 items-center gap-2 rounded-xl px-3.5 text-sm font-semibold transition-colors ${!workerId ? "bg-ink text-white" : "bg-white text-ink ring-1 ring-inset ring-ink/12 hover:bg-ivory"}`}
        >
          All workers <span className="text-xs opacity-60">{inPeriod.length}</span>
        </button>
        {workers.map((w) => {
          const on = workerId === w.id;
          return (
            <button
              key={w.id}
              type="button"
              onClick={() => setWorkerId(w.id)}
              aria-pressed={on}
              className={`inline-flex h-10 items-center gap-2 rounded-xl pl-1.5 pr-3.5 text-sm font-semibold transition-colors ${on ? "bg-ink text-white" : "bg-white text-ink ring-1 ring-inset ring-ink/12 hover:bg-ivory"}`}
            >
              <Avatar name={w.name} size={28} />
              {w.name} <span className="text-xs opacity-60">{w.count}</span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl bg-ink p-5 text-white">
          <p className="text-xs text-white/60">{selected ? selected.name : "All orders"}</p>
          <p className="mt-2 text-2xl font-extrabold">{byWorker.length.toLocaleString()}</p>
          <p className="mt-1 text-xs text-white/60">{rwf(sumOf(paid))} paid</p>
        </div>
        <div className="rounded-2xl border border-ink/10 bg-white p-5">
          <p className="text-xs text-ink/55">Money checked</p>
          <p className="mt-2 text-2xl font-extrabold text-ink">{rwf(moneyOf("verified"))}</p>
          <p className="mt-1 text-xs text-ink/50">{checkCounts.verified} orders</p>
        </div>
        <div className="rounded-2xl border border-ink/10 bg-white p-5">
          <p className="text-xs text-ink/55">Not checked</p>
          <p className="mt-2 text-2xl font-extrabold text-ink">{rwf(moneyOf("awaiting"))}</p>
          <p className="mt-1 text-xs text-ink/50">{checkCounts.awaiting} orders</p>
        </div>
        <div className="rounded-2xl border border-ink/10 bg-white p-5">
          <p className="text-xs text-ink/55">{checkCounts.flagged > 0 ? "Money flagged" : "Open or cancelled"}</p>
          {checkCounts.flagged > 0 ? (
            <>
              <p className="mt-2 text-2xl font-extrabold text-rose-600">{rwf(moneyOf("flagged"))}</p>
              <p className="mt-1 text-xs text-ink/50">{checkCounts.flagged} orders</p>
            </>
          ) : (
            <p className="mt-2 text-2xl font-extrabold text-ink">
              {count("open")} <span className="text-base font-semibold text-ink/40">/ {count("cancelled")}</span>
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-3">
          <Tabs
            options={[
              { value: "all", label: "All", count: byWorker.length },
              { value: "paid", label: "Paid", count: count("paid") },
              { value: "open", label: "Open", count: count("open") },
              { value: "cancelled", label: "Cancelled", count: count("cancelled") },
            ]}
            value={status}
            onChange={setStatus}
          />
          <Tabs
            options={[
              { value: "all", label: "Any check", count: checkCounts.all },
              { value: "awaiting", label: "Not checked", count: checkCounts.awaiting },
              { value: "verified", label: "Checked", count: checkCounts.verified },
              { value: "flagged", label: "Flagged", count: checkCounts.flagged },
            ]}
            value={check}
            onChange={setCheck}
          />
        </div>
        <SearchInput value={search} onChange={setSearch} placeholder="Order, customer, staff or product" />
      </div>

      <Card>
        {loading ? (
          <div className="space-y-2 p-5">
            {[0, 1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-12" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <EmptyState icon={Receipt} title="No orders here" text="Try another worker or filter." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead>
                <tr className="border-b border-ink/8 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-ink/45">
                  <th className="px-5 py-3">Order</th>
                  <th className="px-5 py-3">Staff</th>
                  <th className="px-5 py-3">Items</th>
                  <th className="px-5 py-3">Payment</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Money</th>
                  <th className="px-5 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((order, i) => {
                  const s = STATUS[order.status] ?? { label: order.status, tone: "muted" as const };
                  const items = order.items ?? [];
                  const c = checkOf(order);
                  const newDay = i === 0 || dayKey(new Date(visible[i - 1].createdAt)) !== dayKey(new Date(order.createdAt));
                  return (
                    <Fragment key={order.id}>
                      {newDay && (
                        <tr className="bg-ivory/70">
                          <td colSpan={7} className="px-5 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-ink/50">
                            {dayLabel(order.createdAt)} · {visible.filter((o) => dayKey(new Date(o.createdAt)) === dayKey(new Date(order.createdAt))).length}
                          </td>
                        </tr>
                      )}
                      <tr onClick={() => router.push(`/owner/orders/${order.id}`)} className="cursor-pointer border-t border-ink/6 transition-colors hover:bg-ivory/70">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ivory text-ink/60">
                              {order.type === "DELIVERY" ? <Bike className="h-4 w-4" /> : <Store className="h-4 w-4" />}
                            </span>
                            <div>
                              <p className="font-semibold text-ink">{orderNumber(order)}</p>
                              <p className="text-xs text-ink/50">{new Date(order.createdAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-ink/80">{personName(order.user)}</td>
                        <td className="max-w-56 truncate px-5 py-3.5 text-ink/70">{items.length ? items.map((it) => `${it.quantity}× ${it.product?.name ?? ""}`).join(", ") : "—"}</td>
                        <td className="px-5 py-3.5 text-ink/70">{paymentText(order)}</td>
                        <td className="px-5 py-3.5">
                          <Badge tone={s.tone}>{s.label}</Badge>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${CHECK_META[c.check].cls}`}>{CHECK_META[c.check].label}</span>
                          {c.by && <p className="mt-0.5 text-[11px] text-ink/45">by {c.by}</p>}
                        </td>
                        <td className="px-5 py-3.5 text-right font-bold text-ink">{rwf(order.total)}</td>
                      </tr>
                    </Fragment>
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
