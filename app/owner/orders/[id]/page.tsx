"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, CheckCircle2, CircleX, Flag, Hourglass, ImageIcon, Package, PlusCircle, ShieldCheck, User, Wallet } from "lucide-react";
import { useOwnerData } from "@/stores/owner/api";
import type { Order } from "@/app/owner/types";
import { Avatar, Card, ErrorState, Skeleton, rwf, toNumber } from "@/app/owner/components/ui";
import { orderNumber } from "@/app/owner/finance/money";
import { PAYMENT_LABELS } from "@/app/owner/sales";

interface Check {
  date: string;
  worker: { id: string };
  status: "VERIFIED" | "FLAGGED";
  decidedAt: string;
  decidedByName: string;
}

const STATUS: Record<string, { label: string; cls: string }> = {
  PENDING: { label: "Waiting for payment", cls: "bg-lime/40 text-ink" },
  PREPARING: { label: "Preparing", cls: "bg-lime/40 text-ink" },
  READY: { label: "Ready", cls: "bg-lime/40 text-ink" },
  SERVED: { label: "Served", cls: "bg-lime/40 text-ink" },
  COMPLETED: { label: "Paid", cls: "bg-ink text-lime" },
  CANCELLED: { label: "Cancelled", cls: "bg-rose-50 text-rose-700" },
};

const dateTime = (value?: string | null) =>
  value ? new Date(value).toLocaleString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

function Row({ label, value, strong, danger }: { label: string; value: string; strong?: boolean; danger?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <span className={`text-sm ${strong ? "font-bold text-ink" : "text-ink/60"}`}>{label}</span>
      <span className={`text-sm ${strong ? "font-extrabold" : "font-semibold"} ${danger ? "text-rose-600" : "text-ink"}`}>{value}</span>
    </div>
  );
}

function Fact({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ivory">
        <Icon className="h-4 w-4 text-ink" />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] text-ink/50">{label}</p>
        <p className="truncate text-sm font-semibold text-ink">{value}</p>
      </div>
    </div>
  );
}

// One order: what was bought, how it was paid, who served it and its history.
export default function OrderPage() {
  const { id } = useParams<{ id: string }>();
  const { data: order, loading, error, reload } = useOwnerData<Order>(`/orders/${id}`);
  const checks = useOwnerData<Check[]>("/money-checks");

  const back = (
    <Link href="/owner/orders" className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink/55 hover:text-ink">
      <ArrowLeft className="h-4 w-4" /> Orders
    </Link>
  );
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!order)
    return (
      <div className="space-y-6">
        {back}
        {loading && <Skeleton className="h-64" />}
      </div>
    );

  const status = STATUS[order.status] ?? { label: order.status, cls: "bg-ivory text-ink" };
  const payments = order.payments ?? [];
  const paid = payments.reduce((s, p) => s + toNumber(p.amount), 0);
  const balance = Math.max(toNumber(order.total) - paid, 0);
  const items = order.items ?? [];
  const count = items.reduce((s, i) => s + i.quantity, 0);
  const servedBy = order.user;
  const paidDay = (payments[0]?.createdAt ?? order.updatedAt ?? order.createdAt).slice(0, 10);
  const check = servedBy ? (checks.data ?? []).find((c) => c.date === paidDay && c.worker.id === (order.collectedBy ?? servedBy).id) : undefined;
  const timeline = [
    { icon: PlusCircle, label: "Order created", at: order.createdAt },
    order.status === "COMPLETED"
      ? { icon: CheckCircle2, label: "Paid and completed", at: payments[0]?.createdAt ?? order.updatedAt }
      : order.status === "CANCELLED"
        ? { icon: CircleX, label: "Cancelled", at: order.updatedAt }
        : { icon: Hourglass, label: "Waiting for payment", at: null },
  ];

  return (
    <div className="space-y-6">
      {back}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-ink/45">Orders</p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-[-0.02em] text-ink md:text-[28px]">Order {orderNumber(order)}</h1>
        <p className="mt-1 text-sm text-ink/60">{dateTime(order.createdAt)}</p>
      </div>

      <div className="flex flex-wrap items-center gap-x-8 gap-y-4 rounded-2xl border border-ink/10 bg-white p-5">
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${status.cls}`}>{status.label}</span>
        <Fact icon={User} label="Served by" value={servedBy?.employee?.name ?? servedBy?.name ?? "Unknown"} />
        {order.status === "COMPLETED" && (
          <Fact
            icon={check?.status === "FLAGGED" ? Flag : ShieldCheck}
            label={check?.status === "FLAGGED" ? "Money flagged by" : "Money checked by"}
            value={check ? `${check.decidedByName} · ${new Date(check.decidedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}` : "Not checked yet"}
          />
        )}
        <Fact icon={Package} label="Items" value={`${count} item${count === 1 ? "" : "s"}`} />
        <Fact icon={Wallet} label="Paid with" value={payments.length ? payments.map((p) => PAYMENT_LABELS[String(p.method).toUpperCase()] ?? p.method).join(" + ") : "—"} />
        <p className={`ml-auto text-2xl font-extrabold ${order.status === "CANCELLED" ? "text-ink/35" : "text-ink"}`}>{rwf(order.total)}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_360px]">
        <Card title="Items" description={`${items.length} product${items.length === 1 ? "" : "s"} · ${count} item${count === 1 ? "" : "s"}`}>
          <ul className="divide-y divide-ink/6">
            {items.map((item) => {
              const photo = item.product?.images?.[0]?.thumbnailUrl ?? item.product?.images?.[0]?.url;
              const unit = item.quantity ? toNumber(item.totalPrice) / item.quantity : toNumber(item.unitPrice);
              return (
                <li key={item.id} className="flex items-center gap-3 px-5 py-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-ivory">
                    {photo ? (
                      // eslint-disable-next-line @next/next/no-img-element -- the API's storage
                      <img loading="lazy" decoding="async" src={photo} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <ImageIcon className="h-4 w-4 text-ink/35" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink">{item.product?.name?.trim() || "Item"}</p>
                    {item.product?.barCode && <p className="font-mono text-[11px] text-ink/45">{item.product.barCode}</p>}
                    {item.note && <p className="text-xs text-ink/55">{item.note}</p>}
                  </div>
                  <span className="text-xs text-ink/55">
                    {item.quantity} × {rwf(unit)}
                  </span>
                  <span className="w-28 text-right text-sm font-bold text-ink">{rwf(item.totalPrice)}</span>
                </li>
              );
            })}
            {items.length === 0 && <li className="px-5 py-4 text-sm text-ink/55">No items.</li>}
          </ul>
          <div className="border-t border-ink/8 px-5 py-3">
            {order.subtotal !== undefined && <Row label="Subtotal" value={rwf(order.subtotal)} />}
            {order.tax !== undefined && <Row label="Tax" value={rwf(order.tax)} />}
            <Row strong label={order.status === "COMPLETED" ? "Total paid" : order.status === "PENDING" ? "Amount due" : "Total"} value={rwf(order.total)} />
          </div>
        </Card>

        <div className="space-y-6">
          <Card title="Payment">
            <div className="space-y-3 p-5">
              {payments.length === 0 ? (
                <p className="text-sm text-ink/55">
                  {order.status === "PENDING" ? "Not paid yet." : order.status === "CANCELLED" ? "Cancelled before payment." : "No payment details were recorded for this order."}
                </p>
              ) : (
                <>
                  {payments.map((p, i) => {
                    const credit = String(p.method).toUpperCase() === "CREDIT";
                    return (
                      <div key={p.id ?? i} className="rounded-xl bg-ivory/70 p-3">
                        <Row label={PAYMENT_LABELS[String(p.method).toUpperCase()] ?? String(p.method)} value={rwf(p.amount)} danger={credit} />
                        {credit && (
                          <div className="mt-1 border-t border-ink/8 pt-1">
                            <Row label="Customer" value={p.creditOwnerName || "—"} />
                            <Row label="Phone" value={p.creditOwnerPhone || "—"} />
                            <Row label="Taken by" value={p.takenBy || "—"} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                  <Row label="Total received" value={rwf(paid)} />
                  {balance > 0 && <Row label="Balance" value={rwf(balance)} danger />}
                </>
              )}
            </div>
          </Card>

          <Card title="Served by">
            <div className="flex items-center gap-3 p-5">
              <Avatar name={servedBy?.employee?.name ?? servedBy?.name} size={42} />
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-ink">{servedBy?.employee?.name ?? servedBy?.name ?? "Unknown"}</p>
                <p className="text-xs text-ink/55">
                  {[servedBy?.role?.toLowerCase(), servedBy?.employee?.shift && `${servedBy.employee.shift.toLowerCase()} shift`].filter(Boolean).join(" · ") || "Staff"}
                </p>
                {(servedBy?.phone || servedBy?.email) && <p className="truncate text-xs text-ink/55">{[servedBy?.phone, servedBy?.email].filter(Boolean).join(" · ")}</p>}
              </div>
            </div>
          </Card>

          <Card title="History">
            <ul className="space-y-3 p-5">
              {timeline.map((t) => (
                <li key={t.label} className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ivory">
                    <t.icon className="h-4 w-4 text-ink" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-ink">{t.label}</p>
                    <p className="text-xs text-ink/50">{t.at ? dateTime(t.at) : "Not yet"}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>

          {order.note && (
            <Card title="Note">
              <p className="p-5 text-sm text-ink/75">{order.note}</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
