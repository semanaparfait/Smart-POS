"use client";

import { useState } from "react";
import { ChevronDown, Receipt } from "lucide-react";
import type { Order } from "@/app/owner/types";
import { Badge, EmptyState, SearchInput, dayKey, rwf, toNumber } from "@/app/owner/components/ui";
import { PAYMENT_LABELS } from "@/app/owner/sales";
import { downloadCsv, orderNumber, paidAt } from "@/app/owner/finance/money";
import { Choice, ORDER_STATUS, SmallButton, stamp, title } from "./parts";

const method = (m: string) => PAYMENT_LABELS[String(m).toUpperCase()] ?? m;
const staffOf = (o: Order) => o.user?.employee?.name ?? o.user?.name ?? "—";

export function OrderRow({ order }: { order: Order }) {
  const [open, setOpen] = useState(false);
  const s = ORDER_STATUS[order.status] ?? { label: title(order.status), tone: "muted" as const };
  return (
    <li>
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex w-full flex-wrap items-center gap-3 px-5 py-3 text-left hover:bg-ivory/60">
        <span className="w-20 text-sm font-semibold text-ink">{orderNumber(order)}</span>
        <span className="w-28 text-xs text-ink/55">{stamp(order.createdAt)}</span>
        <span className="min-w-0 flex-1 truncate text-sm text-ink/75">
          {staffOf(order)}
          {order.type === "DELIVERY" && <span className="ml-1.5 text-[11px] text-ink/45">Delivery</span>}
        </span>
        <span className="w-28 truncate text-xs text-ink/55">{(order.payments ?? []).map((p) => method(String(p.method))).join(" + ") || "—"}</span>
        <Badge tone={s.tone}>{s.label}</Badge>
        <span className="w-28 text-right text-sm font-bold text-ink">{rwf(order.total)}</span>
        <ChevronDown className={`h-4 w-4 text-ink/35 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="space-y-1 border-t border-ink/6 bg-ivory/40 px-5 py-3 text-xs text-ink/75">
          {(order.items ?? []).map((i) => (
            <p key={i.id} className="flex justify-between gap-3">
              <span>
                {i.quantity} × {i.product?.name ?? "Item"} <span className="text-ink/45">at {rwf(i.unitPrice)}</span>
              </span>
              <span className="font-semibold">{rwf(i.totalPrice)}</span>
            </p>
          ))}
          {order.tax !== undefined && toNumber(order.tax) > 0 && (
            <p className="flex justify-between border-t border-ink/8 pt-1">
              <span>Subtotal {rwf(order.subtotal)} · Tax</span>
              <span className="font-semibold">{rwf(order.tax)}</span>
            </p>
          )}
          {order.type === "DELIVERY" && (
            <p className="border-t border-ink/8 pt-1">
              Deliver to {order.customerName ?? "—"} {order.customerPhone ? `(${order.customerPhone})` : ""} · {order.deliveryAddress ?? order.deliveryArea ?? "—"} · Fee {rwf(order.deliveryFee)} ·{" "}
              {title(order.deliveryStatus)}
              {order.rider ? ` · Rider ${order.rider.employee?.name ?? order.rider.name}` : order.outsideRider ? ` · Rider ${order.outsideRider}` : ""}
              {order.deliveryProblem ? ` · Problem: ${order.deliveryProblem}` : ""}
            </p>
          )}
          {(order.payments ?? []).map((p, i) => (
            <p key={p.id ?? i} className="flex justify-between gap-3 border-t border-ink/8 pt-1">
              <span>
                {method(String(p.method))}
                {p.creditOwnerName ? ` · ${p.creditOwnerName}${p.creditOwnerPhone ? ` (${p.creditOwnerPhone})` : ""}` : ""}
                {p.takenBy ? ` · taken by ${p.takenBy}` : ""}
              </span>
              <span className="font-semibold">{rwf(p.amount)}</span>
            </p>
          ))}
          {order.note && <p className="italic">“{order.note}”</p>}
          {order.status === "COMPLETED" && <p className="text-ink/45">Paid {stamp(paidAt(order))}</p>}
        </div>
      )}
    </li>
  );
}

type When = "today" | "7" | "30" | "all";

export default function OrdersTab({ orders, now, companyName }: { orders: Order[]; now: number; companyName: string }) {
  const [search, setSearch] = useState("");
  const [when, setWhen] = useState<When>("30");
  const [status, setStatus] = useState("ALL");
  const [kind, setKind] = useState("ALL");
  const [shown, setShown] = useState(100);

  const since = when === "all" ? "" : when === "today" ? dayKey(new Date(now)) : dayKey(new Date(now - (Number(when) - 1) * 86_400_000));
  const q = search.trim().toLowerCase();
  const list = orders.filter(
    (o) =>
      (!since || dayKey(new Date(o.createdAt)) >= since) &&
      (status === "ALL" || o.status === status) &&
      (kind === "ALL" || (o.type ?? "IN_STORE") === kind) &&
      (!q || [orderNumber(o), staffOf(o), o.customerName, ...(o.items ?? []).map((i) => i.product?.name)].some((v) => v?.toLowerCase().includes(q))),
  );
  const paid = list.filter((o) => o.status === "COMPLETED");

  const exportCsv = () =>
    downloadCsv(`${companyName}-orders.csv`, [
      ["Order", "Date", "Staff", "Type", "Status", "Payment", "Total"],
      ...list.map((o) => [orderNumber(o), o.createdAt, staffOf(o), title(o.type ?? "IN_STORE"), ORDER_STATUS[o.status]?.label ?? o.status, (o.payments ?? []).map((p) => method(String(p.method))).join(" + "), toNumber(o.total)]),
    ]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Choice value={when} onChange={setWhen} options={[{ value: "today", label: "Today" }, { value: "7", label: "7 days" }, { value: "30", label: "30 days" }, { value: "all", label: "All" }]} />
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-8 rounded-lg border border-ink/12 bg-white px-2 text-xs text-ink">
          <option value="ALL">Every status</option>
          {Object.entries(ORDER_STATUS).map(([k, v]) => (
            <option key={k} value={k}>
              {v.label}
            </option>
          ))}
        </select>
        <select value={kind} onChange={(e) => setKind(e.target.value)} className="h-8 rounded-lg border border-ink/12 bg-white px-2 text-xs text-ink">
          <option value="ALL">In store and delivery</option>
          <option value="IN_STORE">In store</option>
          <option value="DELIVERY">Delivery</option>
        </select>
        <SmallButton onClick={exportCsv} disabled={!list.length}>
          Download CSV
        </SmallButton>
      </div>
      <SearchInput value={search} onChange={setSearch} placeholder="Order, staff, customer or product" />
      <p className="text-xs text-ink/55">
        {list.length} orders · {paid.length} paid · {rwf(paid.reduce((s, o) => s + toNumber(o.total), 0))}
      </p>
      <ul className="divide-y divide-ink/6 rounded-xl border border-ink/10">
        {list.slice(0, shown).map((o) => (
          <OrderRow key={o.id} order={o} />
        ))}
        {!list.length && <EmptyState icon={Receipt} title="No orders here" />}
      </ul>
      {list.length > shown && (
        <SmallButton onClick={() => setShown((n) => n + 100)}>Load more ({list.length - shown} left)</SmallButton>
      )}
    </div>
  );
}
