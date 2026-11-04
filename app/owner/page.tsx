"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Banknote,
  CalendarRange,
  Clock3,
  MonitorSmartphone,
  ShoppingBag,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import useAuthStore from "@/stores/auth/authstore";
import { useOwnerData } from "@/stores/owner/api";
import type { Device, Order, Product } from "@/app/owner/types";
import {
  Avatar,
  Badge,
  Card,
  EmptyState,
  ErrorState,
  PageHeader,
  Skeleton,
  StatCard,
  rwf,
  shortRwf,
  toNumber,
} from "@/app/owner/components/ui";
import { PAYMENT_LABELS, change, dailySales, paymentMix, salesSummary, topProducts, topStaff } from "@/app/owner/sales";

const greeting = () => {
  const hour = new Date().getHours();
  return hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
};

// "+12% vs yesterday". On a dark card the colours are lighter so they stay readable.
function Trend({ percent, label, dark = false }: { percent: number | null; label: string; dark?: boolean }) {
  if (percent === null) return <span>No sales {label} to compare</span>;
  const up = percent >= 0;
  const Icon = up ? TrendingUp : TrendingDown;
  const color = up ? (dark ? "text-lime" : "text-emerald-600") : dark ? "text-rose-300" : "text-rose-600";
  return (
    <span className={`inline-flex items-center gap-1 font-semibold ${color}`}>
      <Icon className="h-3.5 w-3.5" />
      {up ? "+" : ""}
      {percent}% <span className="font-normal text-current opacity-80">vs {label}</span>
    </span>
  );
}

// Paid sales of the last 14 days as bars; today is highlighted.
function SalesChart({ orders }: { orders: Order[] }) {
  const days = dailySales(orders);
  const max = Math.max(...days.map((d) => d.total), 1);
  const total = days.reduce((sum, d) => sum + d.total, 0);

  return (
    <Card title="Sales, last 14 days" description={`${rwf(total)} in paid sales`}>
      <div className="flex h-56 items-end gap-1.5 px-5 pb-4 pt-6 sm:gap-2.5">
        {days.map(({ date, total: dayTotal }, i) => {
          const today = i === days.length - 1;
          return (
            <div key={date.toISOString()} className="group flex h-full flex-1 flex-col items-center justify-end gap-2">
              <span className="text-[10px] font-semibold text-ink/0 transition-colors group-hover:text-ink/70">
                {shortRwf(dayTotal)}
              </span>
              <div
                className={`w-full rounded-t-lg transition-all ${today ? "bg-lime" : "bg-ink/80 group-hover:bg-ink"}`}
                style={{ height: `${Math.max((dayTotal / max) * 100, dayTotal ? 4 : 1.5)}%` }}
                title={`${date.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}: ${rwf(dayTotal)}`}
              />
              <span className={`text-[10px] ${today ? "font-bold text-ink" : "text-ink/45"}`}>
                {today ? "Today" : date.toLocaleDateString("en-GB", { day: "numeric" })}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function RankList({
  title,
  description,
  rows,
  empty,
}: {
  title: string;
  description: string;
  rows: { name: string; detail: string; total: number }[];
  empty: string;
}) {
  const max = Math.max(...rows.map((r) => r.total), 1);
  return (
    <Card title={title} description={description}>
      {rows.length === 0 ? (
        <EmptyState title={empty} />
      ) : (
        <ol className="divide-y divide-ink/6">
          {rows.map((row, i) => (
            <li key={row.name} className="px-5 py-3">
              <div className="flex items-center gap-3">
                <span className="w-4 text-xs font-bold text-ink/35">{i + 1}</span>
                <Avatar name={row.name} size={30} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">{row.name}</p>
                  <p className="text-[11px] text-ink/50">{row.detail}</p>
                </div>
                <p className="text-sm font-bold text-ink">{rwf(row.total)}</p>
              </div>
              <div className="ml-7 mt-2 h-1.5 overflow-hidden rounded-full bg-ivory">
                <div className="h-full rounded-full bg-lime" style={{ width: `${(row.total / max) * 100}%` }} />
              </div>
            </li>
          ))}
        </ol>
      )}
    </Card>
  );
}

export default function OwnerOverview() {
  const user = useAuthStore((s) => s.user);
  const orders = useOwnerData<Order[]>("/orders");
  const lowStock = useOwnerData<Product[]>("/products/low-stock");
  const devices = useOwnerData<Device[]>("/devices");

  if (orders.error) return <ErrorState message={orders.error} onRetry={orders.reload} />;

  const all = orders.data ?? [];
  const summary = salesSummary(all);
  const mix = paymentMix(summary.monthOrders);
  const mixTotal = mix.reduce((sum, m) => sum + m.total, 0);
  const approved = (devices.data ?? []).filter((d) => d.registrationStatus === "REGISTERED");
  const waiting = (devices.data ?? []).filter((d) => d.registrationStatus === "PENDING" || d.registrationStatus === "REQUESTED");
  const online = approved.filter((d) => d.online).length;
  const firstName = user?.name?.split(" ")[0];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
        title={`${greeting()}${firstName ? `, ${firstName}` : ""}`}
        description={`Here's how ${user?.company?.name ?? "your business"} is doing.`}
        actions={
          <Link
            href="/owner/orders"
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-ink px-4 text-sm font-semibold text-white hover:bg-ink-soft"
          >
            All orders
            <ArrowRight className="h-4 w-4 text-lime" />
          </Link>
        }
      />

      {waiting.length > 0 && (
        <Link
          href="/owner/devices"
          className="flex items-center gap-3 rounded-2xl bg-lime/35 px-5 py-3.5 text-sm text-ink ring-1 ring-inset ring-lime transition hover:bg-lime/50"
        >
          <MonitorSmartphone className="h-5 w-5" />
          <span className="flex-1">
            <b>{waiting.length} device{waiting.length > 1 ? "s" : ""}</b> waiting for your approval
          </span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      )}

      {orders.loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            tone="dark"
            label="Sales today"
            value={rwf(summary.today)}
            icon={Banknote}
            hint={<Trend dark percent={change(summary.today, summary.yesterday)} label="yesterday" />}
          />
          <StatCard
            label="This month"
            value={rwf(summary.month)}
            icon={CalendarRange}
            hint={<Trend percent={change(summary.month, summary.lastMonthSoFar)} label="last month" />}
          />
          <StatCard
            label="Orders this month"
            value={summary.monthCount.toLocaleString()}
            icon={ShoppingBag}
            hint={`Average sale ${rwf(summary.averageSale)}`}
          />
          <StatCard
            label="Open right now"
            value={summary.open.toLocaleString()}
            icon={Clock3}
            hint="Not paid or cancelled yet"
          />
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          {orders.loading ? <Skeleton className="h-72" /> : <SalesChart orders={all} />}
        </div>

        <Card title="How customers paid" description="This month">
          {mix.length === 0 ? (
            <EmptyState title="No payments yet this month" />
          ) : (
            <div className="space-y-4 p-5">
              <div className="flex h-3 overflow-hidden rounded-full bg-ivory">
                {mix.map((m, i) => (
                  <div
                    key={m.method}
                    className={["bg-ink", "bg-lime", "bg-ink/45", "bg-lime-dark"][i % 4]}
                    style={{ width: `${(m.total / mixTotal) * 100}%` }}
                  />
                ))}
              </div>
              <ul className="space-y-3">
                {mix.map((m, i) => (
                  <li key={m.method} className="flex items-center gap-3 text-sm">
                    <span className={`h-2.5 w-2.5 rounded-full ${["bg-ink", "bg-lime", "bg-ink/45", "bg-lime-dark"][i % 4]}`} />
                    <span className="flex-1 font-medium text-ink">{PAYMENT_LABELS[m.method] ?? m.method}</span>
                    <span className="text-ink/50">{Math.round((m.total / mixTotal) * 100)}%</span>
                    <span className="w-28 text-right font-semibold text-ink">{rwf(m.total)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <RankList
          title="Best sellers"
          description="This month, by sales"
          empty="Nothing sold yet this month"
          rows={topProducts(summary.monthOrders).map((p) => ({ name: p.name, detail: `${p.quantity} sold`, total: p.total }))}
        />
        <RankList
          title="Top staff"
          description="This month, by paid sales"
          empty="No sales yet this month"
          rows={topStaff(summary.monthOrders).map((s) => ({ name: s.name, detail: `${s.orders} orders`, total: s.total }))}
        />

        <div className="space-y-6">
          <Card
            title="Running low"
            description="Products at or below their alert level"
            action={
              <Link href="/owner/products" className="text-xs font-semibold text-ink/60 hover:text-ink">
                View all
              </Link>
            }
          >
            {lowStock.loading ? (
              <div className="space-y-2 p-5">
                <Skeleton className="h-8" />
                <Skeleton className="h-8" />
              </div>
            ) : (lowStock.data ?? []).length === 0 ? (
              <EmptyState title="Stock looks good" text="Nothing is below its alert level." />
            ) : (
              <ul className="divide-y divide-ink/6">
                {(lowStock.data ?? []).slice(0, 5).map((p) => (
                  <li key={p.id} className="flex items-center gap-3 px-5 py-3 text-sm">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-rose-500" />
                    <span className="min-w-0 flex-1 truncate font-medium text-ink">{p.name}</span>
                    <Badge tone={toNumber(p.stockQuantity) <= 0 ? "danger" : "lime"}>
                      {toNumber(p.stockQuantity).toLocaleString()} {p.unit}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card title="Devices">
            <div className="flex items-center gap-4 p-5">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-ink text-lime">
                <MonitorSmartphone className="h-5 w-5" />
              </span>
              <div className="flex-1">
                <p className="text-2xl font-extrabold text-ink">
                  {online}
                  <span className="text-base font-semibold text-ink/40"> / {approved.length}</span>
                </p>
                <p className="text-xs text-ink/55">online now</p>
              </div>
              <Link href="/owner/devices" className="text-xs font-semibold text-ink/60 hover:text-ink">
                Manage
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
