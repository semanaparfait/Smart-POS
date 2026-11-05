"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Bike, Crown, Phone, UserPlus } from "lucide-react";
import useAuthStore from "@/stores/auth/authstore";
import { everyWhileVisible, ordersSince, useOwnerData } from "@/stores/owner/api";
import type { Order } from "@/app/owner/types";
import { Card, EmptyState, ErrorState, PageHeader, Skeleton, Tabs, dayKey, initials, rwf, toNumber } from "@/app/owner/components/ui";
import { LinkButton } from "@/app/owner/components/forms";
import FeatureOff from "@/app/owner/components/FeatureOff";
import { isPaid } from "@/app/owner/sales";

type Period = "today" | "yesterday" | "week" | "month";
type Status = "WAITING" | "ON_THE_WAY" | "DELIVERED" | "NOT_DELIVERED";
interface Rider {
  id: string;
  name: string;
  phone?: string | null;
}

const statusOf = (o: Order): Status => (o.deliveryStatus as Status) ?? "WAITING";
const inPeriod = (iso: string, period: Period) => {
  const day = dayKey(new Date(iso));
  const today = new Date();
  const shift = (n: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + n);
    return dayKey(d);
  };
  if (period === "today") return day === dayKey(today);
  if (period === "yesterday") return day === shift(-1);
  if (period === "week") return day >= shift(-6);
  return day >= dayKey(new Date(today.getFullYear(), today.getMonth(), 1));
};
const minutesBetween = (from: string, to: string | number) => Math.max(0, Math.round((new Date(to).getTime() - new Date(from).getTime()) / 60_000));
const duration = (min: number | null) => (min === null ? "—" : min < 60 ? `${min} min` : `${Math.floor(min / 60)} h ${min % 60} min`);

type Stats = { rider: Rider; current: Order[]; delivered: number; failed: number; avgTrip: number | null; collected: number };

// What each rider carried in the period, and what they carry right now.
const statsFor = (rider: Rider, orders: Order[], open: Order[]): Stats => {
  const mine = orders.filter((o) => o.rider?.id === rider.id);
  const done = mine.filter((o) => statusOf(o) === "DELIVERED");
  const trips = done.filter((o) => o.sentAt && o.deliveredAt).map((o) => minutesBetween(o.sentAt!, o.deliveredAt!));
  return {
    rider,
    current: open.filter((o) => o.rider?.id === rider.id),
    delivered: done.length,
    failed: mine.filter((o) => statusOf(o) === "NOT_DELIVERED").length,
    avgTrip: trips.length ? Math.round(trips.reduce((s, m) => s + m, 0) / trips.length) : null,
    collected: done.filter((o) => o.payOnDelivery && isPaid(o)).reduce((s, o) => s + toNumber(o.total), 0),
  };
};

function Face({ name, out, size = 48 }: { name: string; out: boolean; size?: number }) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full border-2 font-bold ${out ? "border-ink bg-lime text-ink" : "border-white bg-ivory text-ink/70"}`}
      style={{ width: size, height: size, fontSize: size * 0.34 }}
    >
      {initials(name)}
    </span>
  );
}

function RiderCard({ stats, top, now }: { stats: Stats; top: boolean; now: number }) {
  const { rider, current, delivered, failed, avgTrip, collected } = stats;
  const out = current.length > 0;
  const tried = delivered + failed;
  const rate = tried ? Math.round((delivered / tried) * 100) : null;
  return (
    <div className="space-y-4 rounded-2xl border border-ink/10 bg-white p-5">
      <div className="flex items-center gap-3">
        <Face name={rider.name} out={out} />
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 truncate font-bold text-ink">
            {rider.name}
            {top && <Crown className="h-4 w-4 text-lime-dark" aria-label="Most deliveries" />}
          </p>
          {rider.phone ? (
            <a href={`tel:${rider.phone}`} className="inline-flex items-center gap-1 text-xs text-ink/60 hover:underline">
              <Phone className="h-3 w-3" /> {rider.phone}
            </a>
          ) : (
            <p className="text-xs text-ink/45">No phone</p>
          )}
        </div>
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${out ? "bg-lime text-ink" : "bg-ivory text-ink/60"}`}>{out ? "Out now" : "Available"}</span>
      </div>
      {out && (
        <ul className="space-y-2">
          {current.map((o) => {
            const toCollect = o.payOnDelivery && !isPaid(o);
            return (
              <li key={o.id}>
                <Link href={`/owner/orders/${o.id}`} className="flex items-center gap-3 rounded-xl bg-ivory px-3 py-2.5 hover:bg-ink/5">
                  <Bike className="h-4 w-4 text-ink/55" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink">{o.customerName ?? "Customer"}</p>
                    <p className="truncate text-xs text-ink/55">{[o.deliveryAddress, o.deliveryArea].filter(Boolean).join(" · ") || "No place given"}</p>
                  </div>
                  <div className="text-right text-xs">
                    <p className="font-semibold text-ink">{o.sentAt ? duration(minutesBetween(o.sentAt, now)) : "—"}</p>
                    <p className={toCollect ? "font-semibold text-rose-600" : "text-ink/50"}>{toCollect ? `Collect ${rwf(o.total)}` : "Paid"}</p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
      <div className="grid grid-cols-3 gap-2 text-center">
        {[
          ["Delivered", delivered.toLocaleString()],
          ["Average trip", duration(avgTrip)],
          ["Collected at doors", collected > 0 ? rwf(collected) : "—"],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl bg-ivory/70 px-2 py-2.5">
            <p className="truncate text-sm font-bold text-ink">{value}</p>
            <p className="text-[11px] text-ink/50">{label}</p>
          </div>
        ))}
      </div>
      <div>
        <div className="h-1.5 overflow-hidden rounded-full bg-ivory">
          <div className="h-full rounded-full bg-ink" style={{ width: `${rate ?? 0}%` }} />
        </div>
        <p className="mt-1 text-xs text-ink/55">{rate === null ? "No trips yet" : `${rate}% delivered${failed ? ` · ${failed} not delivered` : ""}`}</p>
      </div>
    </div>
  );
}

// The delivery team: who is out now, what they carry and how they did.
export default function RidersPage() {
  const on = useAuthStore((s) => s.user?.company?.features?.delivery !== false);
  // Deliveries of the last month cover every period on this page.
  const orders = useOwnerData<Order[]>(on ? ordersSince(31, { type: "DELIVERY" }) : null);
  const riders = useOwnerData<Rider[]>(on ? "/deliveries/riders" : null);
  const [period, setPeriod] = useState<Period>("today");
  const [now, setNow] = useState(() => Date.now());

  // Keeps trips and their timers moving.
  useEffect(() => {
    if (!on) return;
    const stopRefresh = everyWhileVisible(() => {
      orders.reload();
      riders.reload();
    }, 60_000);
    const tick = setInterval(() => setNow(Date.now()), 30_000);
    return () => {
      stopRefresh();
      clearInterval(tick);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [on]);

  const deliveries = useMemo(() => (orders.data ?? []).filter((o) => o.type === "DELIVERY"), [orders.data]);
  const inRange = useMemo(() => deliveries.filter((o) => inPeriod(o.createdAt, period)), [deliveries, period]);
  // Trips on the road count whatever day they started.
  const open = useMemo(() => deliveries.filter((o) => statusOf(o) === "ON_THE_WAY"), [deliveries]);
  const team = useMemo(
    () =>
      (riders.data ?? [])
        .map((r) => statsFor(r, inRange, open))
        .sort((a, b) => b.current.length - a.current.length || b.delivered - a.delivered || a.rider.name.localeCompare(b.rider.name)),
    [riders.data, inRange, open],
  );
  // Outside services typed at the till, by name.
  const outside = useMemo(() => {
    const byName = new Map<string, { trips: number; delivered: number }>();
    for (const o of inRange) {
      if (!o.outsideRider || o.rider) continue;
      const e = byName.get(o.outsideRider) ?? { trips: 0, delivered: 0 };
      e.trips += 1;
      if (statusOf(o) === "DELIVERED") e.delivered += 1;
      byName.set(o.outsideRider, e);
    }
    return [...byName.entries()].sort((a, b) => b[1].trips - a[1].trips);
  }, [inRange]);

  if (!on) return <FeatureOff feature="Delivery" />;
  if (riders.error) return <ErrorState message={riders.error} onRetry={riders.reload} />;

  const topId = team.reduce<Stats | null>((best, s) => (s.delivered > (best?.delivered ?? 0) ? s : best), null)?.rider.id;
  const outNow = team.filter((s) => s.current.length > 0);
  const delivered = team.reduce((s, r) => s + r.delivered, 0);
  const collected = team.reduce((s, r) => s + r.collected, 0);
  const tripTimes = inRange.filter((o) => o.rider && statusOf(o) === "DELIVERED" && o.sentAt && o.deliveredAt).map((o) => minutesBetween(o.sentAt!, o.deliveredAt!));
  const avgTrip = tripTimes.length ? Math.round(tripTimes.reduce((s, m) => s + m, 0) / tripTimes.length) : null;
  const waiting = deliveries.filter((o) => statusOf(o) === "WAITING" && o.status !== "CANCELLED");
  const carrying = outNow.reduce((s, r) => s + r.current.filter((o) => o.payOnDelivery && !isPaid(o)).reduce((t, o) => t + toNumber(o.total), 0), 0);
  const periodLabel = { today: "Today", yesterday: "Yesterday", week: "Last 7 days", month: "This month" }[period];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Deliveries"
        title="Riders"
        description="Your delivery team: who is out now, what they carry and how they did."
        actions={
          <LinkButton tone="outline" icon={Bike} href="/owner/deliveries">
            All deliveries
          </LinkButton>
        }
      />
      {riders.loading && !riders.data ? (
        <Skeleton className="h-64" />
      ) : team.length === 0 ? (
        <Card>
          <EmptyState icon={Bike} title="No riders yet" text={'Give a worker a role with the "Deliver orders" permission and they show up here.'} />
          <div className="pb-6 text-center">
            <LinkButton icon={UserPlus} href="/owner/workers">
              Go to Workers
            </LinkButton>
          </div>
        </Card>
      ) : (
        <>
          <div className="rounded-2xl bg-ink p-6 text-white">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xl font-extrabold">
                  {outNow.length} of {team.length} riders out
                </p>
                <p className="text-sm text-white/60">{carrying > 0 ? `${rwf(carrying)} to collect at doors` : "No money to collect on the road"}</p>
              </div>
              <div className="flex">
                {team.slice(0, 6).map((s, i) => (
                  <span key={s.rider.id} style={{ marginLeft: i ? -10 : 0 }}>
                    <Face name={s.rider.name} out={s.current.length > 0} size={40} />
                  </span>
                ))}
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-4 border-t border-white/10 pt-5 lg:grid-cols-4">
              {[
                ["Delivered", delivered.toLocaleString(), periodLabel],
                ["Average trip", duration(avgTrip), "From leaving to the door"],
                ["Collected at doors", rwf(collected), ""],
                ["Waiting for a rider", waiting.length.toLocaleString(), waiting.length ? "Ready to send from the till" : "Nothing waiting"],
              ].map(([label, value, hint]) => (
                <div key={label}>
                  <p className="text-xs text-white/55">{label}</p>
                  <p className="text-2xl font-extrabold text-lime">{value}</p>
                  {hint && <p className="text-[11px] text-white/45">{hint}</p>}
                </div>
              ))}
            </div>
          </div>
          <Tabs
            options={[
              { value: "today", label: "Today" },
              { value: "yesterday", label: "Yesterday" },
              { value: "week", label: "Last 7 days" },
              { value: "month", label: "This month" },
            ]}
            value={period}
            onChange={setPeriod}
          />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {team.map((s) => (
              <RiderCard key={s.rider.id} stats={s} top={s.rider.id === topId} now={now} />
            ))}
          </div>
          {outside.length > 0 && (
            <Card title="Outside delivery services" description="Typed at the till for orders your riders did not take">
              <ul className="divide-y divide-ink/6">
                {outside.map(([name, s]) => (
                  <li key={name} className="flex items-center gap-3 px-5 py-3">
                    <Face name={name} out={false} size={32} />
                    <span className="flex-1 text-sm font-semibold text-ink">{name}</span>
                    <span className="text-xs text-ink/55">
                      {s.delivered}/{s.trips} delivered
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
