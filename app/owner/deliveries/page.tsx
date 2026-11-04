"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Bike, CircleDollarSign, Download, MapPin, Phone, Route, Truck } from "lucide-react";
import useAuthStore from "@/stores/auth/authstore";
import { useOwnerData } from "@/stores/owner/api";
import type { Order } from "@/app/owner/types";
import { Badge, Card, EmptyState, ErrorState, PageHeader, SearchInput, Skeleton, StatCard, Tabs, formatDate, personName, rwf, toNumber } from "@/app/owner/components/ui";
import { Button } from "@/app/owner/components/forms";
import FeatureOff from "@/app/owner/components/FeatureOff";
import { PAYMENT_LABELS, isPaid } from "@/app/owner/sales";

type Period = "today" | "yesterday" | "week" | "month" | "all";
type DeliveryStatus = "WAITING" | "ON_THE_WAY" | "DELIVERED" | "NOT_DELIVERED";

const STATUS: Record<DeliveryStatus, { label: string; tone: "lime" | "muted" | "ink" | "danger"; bar: string }> = {
  WAITING: { label: "Waiting", tone: "lime", bar: "bg-lime" },
  ON_THE_WAY: { label: "On the way", tone: "muted", bar: "bg-lime" },
  DELIVERED: { label: "Delivered", tone: "ink", bar: "bg-ink" },
  NOT_DELIVERED: { label: "Not delivered", tone: "danger", bar: "bg-rose-500" },
};

const statusOf = (o: Order): DeliveryStatus => (o.deliveryStatus as DeliveryStatus) ?? "WAITING";
const riderOf = (o: Order) => (o.rider ? personName(o.rider) : o.outsideRider ?? null);

// [start, end) of a period; null = no limit.
const periodRange = (period: Period): [Date, Date] | null => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  if (period === "today") return [today, tomorrow];
  if (period === "yesterday") return [new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1), today];
  if (period === "week") return [new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6), tomorrow];
  if (period === "month") return [new Date(now.getFullYear(), now.getMonth(), 1), tomorrow];
  return null;
};

const paymentText = (o: Order) => {
  if (isPaid(o))
    return `${(o.payments ?? []).map((p) => `${PAYMENT_LABELS[p.method] ?? p.method} ${rwf(p.amount)}`).join(" + ")}${o.payOnDelivery ? " · at the door" : ""}`;
  if (o.payOnDelivery) return statusOf(o) === "NOT_DELIVERED" ? "Not paid (cancelled)" : `To collect at the door: ${rwf(o.total)}`;
  return "Not paid yet";
};

function downloadCsv(orders: Order[]) {
  const rows = [
    ["Placed", "Customer", "Phone", "Address", "Area", "Items", "Fee", "Total", "Payment", "Status", "Placed by", "Taken by", "Money with", "On the way", "Delivered", "Problem", "Note"],
    ...orders.map((o) => [
      new Date(o.createdAt).toLocaleString("en-GB"),
      o.customerName ?? "",
      o.customerPhone ?? "",
      o.deliveryAddress ?? "",
      o.deliveryArea ?? "",
      (o.items ?? []).map((i) => `${i.quantity} x ${i.product?.name ?? ""}`).join("; "),
      String(toNumber(o.deliveryFee)),
      String(toNumber(o.total)),
      paymentText(o),
      STATUS[statusOf(o)].label,
      personName(o.user),
      riderOf(o) ?? "",
      o.collectedBy ? personName(o.collectedBy) : "",
      o.sentAt ? new Date(o.sentAt).toLocaleString("en-GB") : "",
      o.deliveredAt ? new Date(o.deliveredAt).toLocaleString("en-GB") : "",
      o.deliveryProblem ?? "",
      o.note ?? "",
    ]),
  ];
  const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  link.download = `deliveries-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

function DeliveryCard({ order }: { order: Order }) {
  const status = STATUS[statusOf(order)];
  const steps = [
    { label: "Placed", at: order.createdAt, by: personName(order.user) },
    isPaid(order)
      ? { label: order.payOnDelivery ? "Paid at the door" : "Paid", at: order.payments?.[0]?.createdAt ?? null, by: order.collectedBy ? personName(order.collectedBy) : personName(order.user) }
      : null,
    order.sentAt ? { label: "On the way", at: order.sentAt, by: riderOf(order) } : null,
    order.deliveredAt ? { label: "Delivered", at: order.deliveredAt, by: riderOf(order) } : null,
    statusOf(order) === "NOT_DELIVERED" ? { label: "Not delivered", at: order.updatedAt ?? null, by: order.deliveryProblem ?? null } : null,
  ].filter(Boolean) as { label: string; at: string | null; by: string | null }[];

  return (
    <div className="overflow-hidden rounded-2xl border border-ink/10 bg-white">
      <div className={`h-1 ${status.bar}`} />
      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-bold text-ink">{order.customerName ?? "Customer"}</p>
            {(order.deliveryAddress || order.deliveryArea) && (
              <p className="mt-0.5 flex items-center gap-1 text-sm text-ink/60">
                <MapPin className="h-3.5 w-3.5" />
                {[order.deliveryAddress, order.deliveryArea].filter(Boolean).join(" · ")}
              </p>
            )}
            {order.customerPhone && (
              <a href={`tel:${order.customerPhone}`} className="mt-0.5 flex items-center gap-1 text-sm text-ink underline">
                <Phone className="h-3.5 w-3.5" />
                {order.customerPhone}
              </a>
            )}
          </div>
          <div className="text-right">
            <Badge tone={status.tone}>{status.label}</Badge>
            <p className="mt-1.5 text-lg font-extrabold text-ink">{rwf(order.total)}</p>
          </div>
        </div>

        <div className="rounded-xl bg-ivory p-3 text-sm">
          {(order.items ?? []).map((item) => (
            <div key={item.id} className="flex justify-between gap-2">
              <span className="truncate text-ink/80">
                {item.quantity} × {item.product?.name}
              </span>
              <span className="text-ink/70">{rwf(item.totalPrice)}</span>
            </div>
          ))}
          <div className="mt-1 flex justify-between border-t border-ink/10 pt-1">
            <span className="text-ink/60">Delivery fee</span>
            <span className="text-ink/70">{toNumber(order.deliveryFee) > 0 ? rwf(order.deliveryFee) : "Free"}</span>
          </div>
        </div>

        <dl className="space-y-1 text-sm">
          <div className="flex gap-2">
            <dt className="w-24 shrink-0 text-ink/50">Payment</dt>
            <dd className="text-ink">{paymentText(order)}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-24 shrink-0 text-ink/50">Taken by</dt>
            <dd className="text-ink">{riderOf(order) ?? "Not recorded"}</dd>
          </div>
          {order.collectedBy && (
            <div className="flex gap-2">
              <dt className="w-24 shrink-0 text-ink/50">Money with</dt>
              <dd className="text-ink">{personName(order.collectedBy)}</dd>
            </div>
          )}
          <div className="flex gap-2">
            <dt className="w-24 shrink-0 text-ink/50">Placed by</dt>
            <dd className="text-ink">{personName(order.user)}</dd>
          </div>
          {order.note && (
            <div className="flex gap-2">
              <dt className="w-24 shrink-0 text-ink/50">Note</dt>
              <dd className="text-ink">{order.note}</dd>
            </div>
          )}
          {order.deliveryProblem && (
            <div className="flex gap-2">
              <dt className="w-24 shrink-0 text-ink/50">Problem</dt>
              <dd className="text-rose-600">{order.deliveryProblem}</dd>
            </div>
          )}
        </dl>

        <ol className="space-y-1.5 border-t border-ink/6 pt-3">
          {steps.map((s, i) => (
            <li key={s.label} className="flex items-center gap-2 text-xs">
              <span className={`h-2 w-2 rounded-full ${i === steps.length - 1 ? "bg-ink" : "bg-ink/25"}`} />
              <span className="w-24 font-semibold text-ink">{s.label}</span>
              <span className="text-ink/55">{[s.at ? formatDate(s.at, true) : null, s.by].filter(Boolean).join(" · ")}</span>
            </li>
          ))}
        </ol>
        <Link href={`/owner/orders/${order.id}`} className="inline-flex items-center gap-1 text-xs font-bold text-ink hover:underline">
          Open full order <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

export default function OwnerDeliveries() {
  const user = useAuthStore((s) => s.user);
  const on = user?.company?.features?.delivery !== false;
  const { data, loading, error, reload } = useOwnerData<Order[]>(on ? "/orders" : null);
  const [period, setPeriod] = useState<Period>("today");
  const [status, setStatus] = useState<"all" | DeliveryStatus>("all");
  const [search, setSearch] = useState("");

  // Keeps up with deliveries moving along.
  useEffect(() => {
    if (!on) return;
    const timer = setInterval(reload, 60_000);
    return () => clearInterval(timer);
  }, [on, reload]);

  const inPeriod = useMemo(() => {
    const range = periodRange(period);
    return (data ?? [])
      .filter((o) => o.type === "DELIVERY" && (!range || (new Date(o.createdAt) >= range[0] && new Date(o.createdAt) < range[1])))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [data, period]);

  if (!on) return <FeatureOff feature="Delivery" />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  const query = search.trim().toLowerCase();
  const visible = inPeriod.filter(
    (o) =>
      (status === "all" || statusOf(o) === status) &&
      (!query || [o.customerName, o.customerPhone, o.deliveryAddress, o.deliveryArea, riderOf(o)].some((v) => v?.toLowerCase().includes(query))),
  );
  const count = (s: DeliveryStatus) => inPeriod.filter((o) => statusOf(o) === s).length;
  const delivered = inPeriod.filter((o) => statusOf(o) === "DELIVERED");
  const fees = delivered.reduce((sum, o) => sum + toNumber(o.deliveryFee), 0);
  const atDoors = delivered.filter((o) => o.payOnDelivery && isPaid(o)).reduce((sum, o) => sum + toNumber(o.total), 0);
  const toCollect = inPeriod
    .filter((o) => o.payOnDelivery && !isPaid(o) && ["WAITING", "ON_THE_WAY"].includes(statusOf(o)))
    .reduce((sum, o) => sum + toNumber(o.total), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Sales"
        title="Deliveries"
        description="Every delivery: who ordered, what, where, who took it and the money."
        actions={
          <Button icon={Download} disabled={!visible.length} onClick={() => downloadCsv(visible)}>
            Export
          </Button>
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
          <StatCard tone="dark" label="Deliveries" value={inPeriod.length.toLocaleString()} icon={Truck} hint={`${count("DELIVERED")} delivered · ${count("NOT_DELIVERED")} not delivered`} />
          <StatCard label="Still going" value={(count("WAITING") + count("ON_THE_WAY")).toLocaleString()} icon={Route} hint={toCollect ? `${rwf(toCollect)} to collect at doors` : "Nothing to collect"} />
          <StatCard label="Delivery fees" value={rwf(fees)} icon={Bike} hint="From delivered orders" />
          <StatCard label="Collected at doors" value={rwf(atDoors)} icon={CircleDollarSign} hint="Paid when it arrived" />
        </div>
      )}

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-3">
          <Tabs
            options={[
              { value: "today", label: "Today" },
              { value: "yesterday", label: "Yesterday" },
              { value: "week", label: "Last 7 days" },
              { value: "month", label: "This month" },
              { value: "all", label: "All" },
            ]}
            value={period}
            onChange={setPeriod}
          />
          <Tabs
            options={[
              { value: "all", label: "All", count: inPeriod.length },
              ...(Object.keys(STATUS) as DeliveryStatus[]).map((s) => ({ value: s, label: STATUS[s].label, count: count(s) })),
            ]}
            value={status}
            onChange={setStatus}
          />
        </div>
        <SearchInput value={search} onChange={setSearch} placeholder="Customer, phone, place or rider" />
      </div>

      {loading ? (
        <Skeleton className="h-64" />
      ) : visible.length === 0 ? (
        <Card>
          <EmptyState icon={Truck} title="No deliveries here" text="Try another day or filter." />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {visible.map((o) => (
            <DeliveryCard key={o.id} order={o} />
          ))}
        </div>
      )}
    </div>
  );
}
