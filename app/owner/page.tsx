"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowRight, Banknote, Check, ChevronRight, Cpu, Hourglass, ImageIcon, Package, Receipt, RotateCw, ShieldCheck, Tag, TrendingDown, TrendingUp, WifiOff, type LucideIcon } from "lucide-react";
import useAuthStore from "@/stores/auth/authstore";
import { useOwnerData } from "@/stores/owner/api";
import type { Device, Order, OrderItem, Product } from "@/app/owner/types";
import { Avatar, Badge, Card, ErrorState, Skeleton, Tabs, dayKey, rwf, toNumber } from "@/app/owner/components/ui";
import { Button } from "@/app/owner/components/forms";
import { PAYMENT_LABELS } from "@/app/owner/sales";
import { orderNumber, paidAt } from "@/app/owner/finance/money";

type Period = "today" | "7d" | "30d";
const PERIODS: Record<Period, { label: string; days: number; previous: string }> = {
  today: { label: "Today", days: 1, previous: "Yesterday" },
  "7d": { label: "7 days", days: 7, previous: "Previous 7 days" },
  "30d": { label: "30 days", days: 30, previous: "Previous 30 days" },
};
const METHODS = ["CASH", "MOMO", "CARD", "CREDIT"] as const;
const DAY = 86_400_000;
const STATUS: Record<string, { label: string; tone: "ink" | "lime" | "muted" | "danger" }> = {
  COMPLETED: { label: "Paid", tone: "ink" },
  CANCELLED: { label: "Cancelled", tone: "danger" },
  PENDING: { label: "Pending", tone: "lime" },
  PREPARING: { label: "Preparing", tone: "lime" },
  READY: { label: "Ready", tone: "lime" },
  SERVED: { label: "Served", tone: "muted" },
};

interface Check {
  date: string;
  worker: { id: string };
}

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
// When an order "happened": the payment time for paid orders, otherwise when it was made.
const orderTime = (o: Order) => new Date(o.status === "COMPLETED" ? paidAt(o) : o.createdAt).getTime();
const greeting = (h: number) => (h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening");
const itemCount = (o: Order) => (o.items ?? []).reduce((s, i) => s + (i.quantity || 0), 0);

function Delta({ current, previous, label }: { current: number; previous: number; label: string }) {
  if (!previous) return <span className="text-ink/45">Nothing {label} to compare</span>;
  const pct = Math.round(((current - previous) / previous) * 100);
  const up = pct >= 0;
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <span className={`inline-flex items-center gap-1 font-semibold ${up ? "text-emerald-600" : "text-rose-600"}`}>
      <Icon className="h-3.5 w-3.5" />
      {Math.abs(pct)}% <span className="font-normal text-ink/50">vs {label}</span>
    </span>
  );
}

function Kpi({ icon: Icon, label, value, footer }: { icon: LucideIcon; label: string; value: string; footer: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-ink/10 bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-ink/55">{label}</p>
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ivory">
          <Icon className="h-4.5 w-4.5 text-ink/70" />
        </span>
      </div>
      <p className="mt-2 truncate text-2xl font-extrabold tracking-[-0.02em] text-ink">{value}</p>
      <div className="mt-1 text-xs">{footer}</div>
    </div>
  );
}

// A labelled row with a thin bar showing its share of the largest row.
function BarRow({ leading, title, subtitle, value, ratio }: { leading: React.ReactNode; title: string; subtitle?: string; value: string; ratio: number }) {
  return (
    <div className="flex items-center gap-3">
      {leading}
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className="truncate text-sm font-semibold text-ink">{title}</p>
          <p className="text-sm font-bold text-ink">{value}</p>
        </div>
        <div className="mt-1.5 flex items-center gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ivory">
            <div className="h-full rounded-full bg-ink" style={{ width: `${Math.max(2, ratio * 100)}%` }} />
          </div>
          {subtitle && <span className="w-16 text-right text-[11px] text-ink/50">{subtitle}</span>}
        </div>
      </div>
    </div>
  );
}

// This period as a solid line and the one before as a dashed one.
function TrendChart({ points, currentLabel, previousLabel, labelEvery }: { points: { label: string; current: number | null; previous: number }[]; currentLabel: string; previousLabel: string; labelEvery: number }) {
  const W = 640;
  const H = 200;
  const pad = { l: 8, r: 8, t: 12, b: 26 };
  const max = Math.max(1, ...points.map((p) => Math.max(p.current ?? 0, p.previous)));
  const x = (i: number) => pad.l + (points.length <= 1 ? 0 : (i / (points.length - 1)) * (W - pad.l - pad.r));
  const y = (v: number) => pad.t + (1 - v / max) * (H - pad.t - pad.b);
  const line = (values: (number | null)[]) =>
    values
      .map((v, i) => (v === null ? null : `${x(i).toFixed(1)},${y(v).toFixed(1)}`))
      .filter(Boolean)
      .join(" ");
  const current = points.map((p) => p.current);
  const lastIdx = current.reduce<number>((acc, v, i) => (v !== null ? i : acc), -1);
  return (
    <div className="px-5 pb-4">
      <div className="mb-2 flex gap-4 text-[11px] text-ink/60">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-0.5 w-4 rounded bg-ink" /> {currentLabel}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-0.5 w-4 rounded border-t-2 border-dashed border-ink/35" /> {previousLabel}
        </span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-52 w-full" role="img" aria-label="Sales trend">
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <line key={f} x1={pad.l} x2={W - pad.r} y1={y(max * f)} y2={y(max * f)} stroke="currentColor" className="text-ink/6" />
        ))}
        <polyline points={line(points.map((p) => p.previous))} fill="none" stroke="currentColor" strokeWidth={2} strokeDasharray="5 4" className="text-ink/30" />
        <polyline points={line(current)} fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinejoin="round" className="text-ink" />
        {lastIdx >= 0 && <circle cx={x(lastIdx)} cy={y(current[lastIdx]!)} r={4.5} className="fill-lime stroke-ink" strokeWidth={2} />}
        {points.map((p, i) =>
          i % labelEvery === 0 ? (
            <text key={i} x={x(i)} y={H - 6} textAnchor="middle" className="fill-ink/45 text-[11px]">
              {p.label}
            </text>
          ) : null,
        )}
      </svg>
      <p className="text-right text-[11px] text-ink/45">Highest {rwf(max)}</p>
    </div>
  );
}

function Thumb({ item }: { item: OrderItem }) {
  const src = item.product?.images?.[0]?.thumbnailUrl ?? item.product?.images?.[0]?.url;
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-ivory">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- the API's storage
        <img src={src} alt="" className="h-full w-full object-cover" />
      ) : (
        <ImageIcon className="h-4 w-4 text-ink/35" />
      )}
    </span>
  );
}

function AttentionRow({ icon: Icon, title, detail, count, href, danger }: { icon: LucideIcon; title: string; detail: string; count: number; href: string; danger?: boolean }) {
  const clear = count === 0;
  return (
    <Link href={href} className="flex items-center gap-3 px-5 py-3 hover:bg-ivory/60">
      <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${clear ? "bg-emerald-50 text-emerald-600" : danger ? "bg-rose-50 text-rose-600" : "bg-lime/40 text-ink"}`}>
        {clear ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-ink">{title}</span>
        <span className="block truncate text-xs text-ink/55">{clear ? "All clear" : detail}</span>
      </span>
      {!clear && <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${danger ? "bg-rose-600 text-white" : "bg-ink text-lime"}`}>{count}</span>}
      <ChevronRight className="h-4 w-4 text-ink/30" />
    </Link>
  );
}

export default function OwnerDashboard() {
  const user = useAuthStore((s) => s.user);
  const orders = useOwnerData<Order[]>("/orders");
  const devices = useOwnerData<Device[]>("/devices");
  const checks = useOwnerData<Check[]>("/money-checks");
  const lowStock = useOwnerData<Product[]>("/products/low-stock");
  const [period, setPeriod] = useState<Period>("today");
  const [now, setNow] = useState(() => Date.now());
  const cfg = PERIODS[period];

  const refresh = () => {
    orders.reload();
    devices.reload();
    checks.reload();
    lowStock.reload();
    setNow(Date.now());
  };

  // This window, and the same-length window before it ("same time yesterday" for Today).
  const windowStart = startOfDay(new Date(now)).getTime() - (cfg.days - 1) * DAY;
  const span = cfg.days * DAY;

  const stats = (() => {
    const all = orders.data ?? [];
    const inRange = (o: Order, from: number, to: number) => {
      const t = orderTime(o);
      return t >= from && t <= to;
    };
    const cur = all.filter((o) => inRange(o, windowStart, now));
    const prev = all.filter((o) => inRange(o, windowStart - span, now - span));
    const done = (list: Order[]) => list.filter((o) => o.status === "COMPLETED");
    const sum = (list: Order[]) => list.reduce((s, o) => s + toNumber(o.total), 0);
    const curDone = done(cur);
    const prevDone = done(prev);

    const methods: Record<(typeof METHODS)[number], number> = { CASH: 0, MOMO: 0, CARD: 0, CREDIT: 0 };
    let unrecorded = 0;
    for (const o of curDone) {
      const ps = o.payments ?? [];
      if (!ps.length) unrecorded += toNumber(o.total);
      for (const p of ps) {
        const m = String(p.method).toUpperCase() as (typeof METHODS)[number];
        if (m in methods) methods[m] += toNumber(p.amount);
      }
    }
    const products = new Map<string, { item: OrderItem; name: string; qty: number; revenue: number }>();
    const staff = new Map<string, { name: string; sales: number; orders: number }>();
    for (const o of curDone) {
      for (const item of o.items ?? []) {
        const id = item.product?.id ?? item.id;
        const row = products.get(id) ?? { item, name: item.product?.name?.trim() || "Item", qty: 0, revenue: 0 };
        row.qty += item.quantity;
        row.revenue += toNumber(item.totalPrice);
        products.set(id, row);
      }
      const id = o.user?.id ?? "unknown";
      const row = staff.get(id) ?? { name: o.user?.employee?.name ?? o.user?.name ?? "Unknown", sales: 0, orders: 0 };
      row.sales += toNumber(o.total);
      row.orders += 1;
      staff.set(id, row);
    }

    // Hours for Today (a running total), days otherwise.
    let points: { label: string; current: number | null; previous: number }[];
    if (period === "today") {
      const curH = new Array(24).fill(0);
      const prevH = new Array(24).fill(0);
      for (const o of done(all)) {
        const t = orderTime(o);
        if (t >= windowStart && t <= now) curH[new Date(t).getHours()] += toNumber(o.total);
        else if (t >= windowStart - DAY && t < windowStart) prevH[new Date(t).getHours()] += toNumber(o.total);
      }
      const nowH = new Date(now).getHours();
      // The trading day, 6:00 to 22:00, wider if sales happened outside it.
      const active = curH.map((v, h) => (v || prevH[h] ? h : -1)).filter((h) => h >= 0);
      const from = Math.min(6, ...active);
      const to = Math.max(22, ...active);
      points = Array.from({ length: to - from + 1 }, (_, i) => from + i).map((h) => ({
        label: `${String(h).padStart(2, "0")}:00`,
        current: h <= nowH ? curH.slice(from, h + 1).reduce((a, b) => a + b, 0) : null,
        previous: prevH.slice(from, h + 1).reduce((a, b) => a + b, 0),
      }));
    } else {
      const curD = new Array(cfg.days).fill(0);
      const prevD = new Array(cfg.days).fill(0);
      for (const o of done(all)) {
        const t = orderTime(o);
        if (t >= windowStart && t <= now) curD[Math.floor((t - windowStart) / DAY)] += toNumber(o.total);
        else if (t >= windowStart - span && t < windowStart) prevD[Math.floor((t - (windowStart - span)) / DAY)] += toNumber(o.total);
      }
      points = curD.map((v, i) => ({
        label: new Date(windowStart + i * DAY).toLocaleDateString("en-GB", cfg.days <= 7 ? { weekday: "short" } : { day: "numeric", month: "short" }),
        current: v,
        previous: prevD[i],
      }));
    }

    // Things to act on, whatever the period.
    const pending = all.filter((o) => o.status === "PENDING");
    const todayStart = startOfDay(new Date(now)).getTime();
    const today = dayKey(new Date(now));
    const sellersToday = new Set(all.filter((o) => o.status === "COMPLETED" && orderTime(o) >= todayStart && o.user?.id).map((o) => (o.collectedBy ?? o.user)!.id));
    const toVerify = [...sellersToday].filter((id) => !(checks.data ?? []).some((c) => c.date === today && c.worker.id === id)).length;
    const devs = devices.data ?? [];

    return {
      sales: sum(curDone),
      prevSales: sum(prevDone),
      paidOrders: curDone.length,
      prevPaidOrders: prevDone.length,
      items: curDone.reduce((s, o) => s + itemCount(o), 0),
      pendingInPeriod: cur.filter((o) => o.status === "PENDING").length,
      cancelled: cur.filter((o) => o.status === "CANCELLED").length,
      methods,
      unrecorded,
      products: [...products.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 5),
      staff: [...staff.values()].sort((a, b) => b.sales - a.sales).slice(0, 5),
      points,
      recent: [...cur].sort((a, b) => orderTime(b) - orderTime(a)).slice(0, 6),
      attention: {
        pending: pending.length,
        pendingValue: sum(pending),
        toVerify,
        sellersToday: sellersToday.size,
        devicesPending: devs.filter((d) => d.registrationStatus === "PENDING" || d.registrationStatus === "REQUESTED").length,
        devicesOffline: devs.filter((d) => d.registrationStatus === "REGISTERED" && !d.online).length,
        devicesOnline: devs.filter((d) => d.online).length,
      },
    };
  })();

  if (orders.error && !orders.data) return <ErrorState message={orders.error} onRetry={orders.reload} />;

  const avg = stats.paidOrders ? stats.sales / stats.paidOrders : 0;
  const prevAvg = stats.prevPaidOrders ? stats.prevSales / stats.prevPaidOrders : 0;
  const paymentTotal = METHODS.reduce((s, m) => s + stats.methods[m], 0);
  const maxMethod = Math.max(1, ...METHODS.map((m) => stats.methods[m]));
  const compareLabel = period === "today" ? "same time yesterday" : cfg.previous.toLowerCase();
  const firstName = (user?.name ?? "").split(" ")[0];
  const a = stats.attention;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-ink/45">
            {new Date(now).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-[-0.02em] text-ink md:text-[28px]">
            {greeting(new Date(now).getHours())}
            {firstName ? `, ${firstName}` : ""}
          </h1>
          <p className="mt-1 text-sm text-ink/60">Here&apos;s how {user?.company?.name ?? "your business"} is doing.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Tabs options={(Object.keys(PERIODS) as Period[]).map((k) => ({ value: k, label: PERIODS[k].label }))} value={period} onChange={setPeriod} />
          <Button tone="outline" icon={RotateCw} busy={orders.loading && !!orders.data} onClick={refresh}>
            Refresh
          </Button>
        </div>
      </div>

      {orders.loading && !orders.data ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Kpi icon={Banknote} label="Sales" value={rwf(stats.sales)} footer={<Delta current={stats.sales} previous={stats.prevSales} label={compareLabel} />} />
            <Kpi
              icon={Receipt}
              label="Paid orders"
              value={String(stats.paidOrders)}
              footer={
                <span className="text-ink/55">
                  {stats.pendingInPeriod} pending · {stats.cancelled} cancelled
                </span>
              }
            />
            <Kpi icon={Tag} label="Average sale" value={rwf(avg)} footer={<Delta current={avg} previous={prevAvg} label={compareLabel} />} />
            <Kpi icon={Package} label="Items sold" value={stats.items.toLocaleString()} footer={<span className="text-ink/55">{stats.paidOrders ? `${(stats.items / stats.paidOrders).toFixed(1)} per order` : "No sales yet"}</span>} />
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <div className="xl:col-span-2">
              <Card
                title={period === "today" ? "Sales through the day" : "Sales per day"}
                description={period === "today" ? "Running total, compared with yesterday at the same hour" : `Each day, compared with the ${cfg.previous.toLowerCase()}`}
              >
                <TrendChart
                  points={stats.points}
                  currentLabel={period === "today" ? "Today" : `Last ${cfg.label}`}
                  previousLabel={cfg.previous}
                  labelEvery={period === "today" ? 3 : period === "7d" ? 1 : 5}
                />
              </Card>
            </div>
            <Card
              title="How customers paid"
              description={paymentTotal ? `${rwf(paymentTotal)} in recorded payments` : undefined}
              action={
                <Link href="/owner/money-checks" className="text-xs font-bold text-ink hover:underline">
                  Verify
                </Link>
              }
            >
              <div className="space-y-4 p-5">
                {paymentTotal === 0 && stats.unrecorded === 0 ? (
                  <p className="text-sm text-ink/55">No payments in this period.</p>
                ) : (
                  <>
                    {METHODS.map((m) => (
                      <BarRow
                        key={m}
                        leading={<span className={`h-2.5 w-2.5 rounded-full ${m === "CREDIT" ? "bg-rose-500" : "bg-ink"}`} />}
                        title={PAYMENT_LABELS[m]}
                        value={rwf(stats.methods[m])}
                        subtitle={`${paymentTotal ? Math.round((stats.methods[m] / paymentTotal) * 100) : 0}%`}
                        ratio={stats.methods[m] / maxMethod}
                      />
                    ))}
                    {stats.unrecorded > 0 && <p className="text-xs text-ink/55">{rwf(stats.unrecorded)} of sales has no payment method recorded.</p>}
                    {stats.methods.CREDIT > 0 && (
                      <Link href="/owner/finance/credits" className="flex items-center justify-between rounded-xl bg-rose-50 px-3.5 py-2.5 text-sm text-rose-700 hover:bg-rose-100">
                        <span>
                          <b>{rwf(stats.methods.CREDIT)}</b> given on credit
                        </span>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    )}
                  </>
                )}
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card
              title="Best sellers"
              description="By sales in this period"
              action={
                <Link href="/owner/products" className="text-xs font-bold text-ink hover:underline">
                  Products
                </Link>
              }
            >
              <div className="space-y-4 p-5">
                {stats.products.length === 0 ? (
                  <p className="text-sm text-ink/55">No products sold in this period.</p>
                ) : (
                  stats.products.map((p) => <BarRow key={p.name} leading={<Thumb item={p.item} />} title={p.name} value={rwf(p.revenue)} subtitle={`${p.qty} sold`} ratio={p.revenue / (stats.products[0]?.revenue || 1)} />)
                )}
              </div>
            </Card>
            <Card
              title="Staff sales"
              description="Who sold the most"
              action={
                <Link href="/owner/workers" className="text-xs font-bold text-ink hover:underline">
                  Workers
                </Link>
              }
            >
              <div className="space-y-4 p-5">
                {stats.staff.length === 0 ? (
                  <p className="text-sm text-ink/55">No sales in this period.</p>
                ) : (
                  stats.staff.map((s) => (
                    <BarRow
                      key={s.name}
                      leading={<Avatar name={s.name} size={34} />}
                      title={s.name}
                      value={rwf(s.sales)}
                      subtitle={`${s.orders} order${s.orders === 1 ? "" : "s"}`}
                      ratio={s.sales / (stats.staff[0]?.sales || 1)}
                    />
                  ))
                )}
              </div>
            </Card>
            <Card title="Needs attention">
              <div className="divide-y divide-ink/6">
                <AttentionRow icon={Hourglass} title="Unpaid orders" detail={`${rwf(a.pendingValue)} waiting at checkout`} count={a.pending} href="/owner/orders" />
                <AttentionRow icon={ShieldCheck} title="Takings to verify today" detail={`${a.toVerify} of ${a.sellersToday} workers not checked`} count={a.toVerify} href="/owner/money-checks" />
                <AttentionRow icon={Cpu} title="Devices waiting for approval" detail="New terminals asking to join" count={a.devicesPending} href="/owner/devices" />
                <AttentionRow icon={WifiOff} title="Approved devices offline" detail={`${a.devicesOnline} online right now`} count={a.devicesOffline} href="/owner/devices" danger />
                <AttentionRow icon={AlertTriangle} title="Running low" detail="Products at or below their alert level" count={(lowStock.data ?? []).length} href="/owner/inventory/low-stock" danger />
              </div>
            </Card>
          </div>

          <Card
            title="Latest orders"
            description={`In the ${period === "today" ? "day so far" : `last ${cfg.label}`}`}
            action={
              <Link href="/owner/orders" className="text-xs font-bold text-ink hover:underline">
                All orders
              </Link>
            }
          >
            {stats.recent.length === 0 ? (
              <p className="px-5 py-4 text-sm text-ink/55">No orders in this period yet.</p>
            ) : (
              <ul className="divide-y divide-ink/6">
                {stats.recent.map((o) => {
                  const s = STATUS[o.status] ?? { label: o.status, tone: "muted" as const };
                  const methods = (o.payments ?? []).map((p) => PAYMENT_LABELS[String(p.method).toUpperCase()] ?? p.method);
                  return (
                    <li key={o.id}>
                      <Link href={`/owner/orders/${o.id}`} className="flex flex-wrap items-center gap-4 px-5 py-3 hover:bg-ivory/60">
                        <span className="w-20 text-sm font-semibold text-ink">{orderNumber(o)}</span>
                        <span className="w-14 text-xs text-ink/55">{new Date(orderTime(o)).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</span>
                        <span className="min-w-0 flex-1 truncate text-sm text-ink/75">{o.user?.employee?.name ?? o.user?.name ?? "—"}</span>
                        <span className="w-28 truncate text-xs text-ink/55">{methods.length ? methods.join(" + ") : "—"}</span>
                        <Badge tone={s.tone}>{s.label}</Badge>
                        <span className="w-28 text-right text-sm font-bold text-ink">{rwf(o.total)}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
