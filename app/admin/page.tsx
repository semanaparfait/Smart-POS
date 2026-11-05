"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowUpRight,
  Ban,
  Banknote,
  Building2,
  Check,
  ChevronRight,
  CreditCard,
  Inbox,
  Monitor,
  MonitorOff,
  Plus,
  Receipt,
  RotateCw,
  TrendingDown,
  type LucideIcon,
} from "lucide-react";
import { BILLING_META, PLAN_LABEL, attentionOf, usePlatform, type PlatformCompany } from "@/app/admin/components/Platform";
import { industryOf } from "@/app/admin/tabs/companies/components/FetchCompany";
import { dayKey, rwf, shortRwf, timeAgo } from "@/app/owner/components/ui";

const greeting = (hour: number) => (hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening");
const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : 0);

function Kpi({ icon: Icon, label, value, hint, foot, wide }: { icon: LucideIcon; label: string; value: string; hint: string; foot?: React.ReactNode; wide?: boolean }) {
  return (
    <div className={`flex flex-col rounded-2xl border border-ink/10 bg-white p-5 shadow-xs ${wide ? "lg:col-span-3" : "lg:col-span-2"} 2xl:col-span-1`}>
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-medium text-ink/60">{label}</p>
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink text-lime">
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-3 text-[26px] font-bold leading-none tracking-[-0.02em] text-ink tabular-nums">{value}</p>
      <p className="mt-2 text-xs text-ink/55">{hint}</p>
      {foot && <div className="mt-4 border-t border-ink/6 pt-3 text-xs text-ink/60">{foot}</div>}
    </div>
  );
}

function Card({ title, sub, action, children, className = "" }: { title: string; sub?: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-ink/10 bg-white shadow-xs ${className}`}>
      <header className="flex items-start justify-between gap-3 border-b border-ink/6 px-5 py-4">
        <div>
          <h2 className="text-[15px] font-semibold text-ink">{title}</h2>
          {sub && <p className="mt-0.5 text-xs text-ink/55">{sub}</p>}
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}

// Paid sales per day across every company. One series, so no legend: the title names it.
function SalesChart({ days }: { days: { day: string; total: number; orders: number }[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 720;
  const H = 240;
  const pad = { l: 52, r: 8, t: 12, b: 28 };
  const max = Math.max(1, ...days.map((d) => d.total));
  const step = Math.pow(10, Math.floor(Math.log10(max)));
  const top = Math.ceil(max / step) * step;
  const slot = (W - pad.l - pad.r) / days.length;
  const barW = Math.max(4, slot - 6);
  const y = (v: number) => pad.t + (1 - v / top) * (H - pad.t - pad.b);
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * top);
  const h = hover !== null ? days[hover] : null;

  return (
    <div className="relative px-5 pb-5 pt-4">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-64 w-full" role="img" aria-label="Paid sales per day for the last 30 days" onMouseLeave={() => setHover(null)}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} stroke="currentColor" className="text-ink/8" />
            <text x={pad.l - 8} y={y(t) + 4} textAnchor="end" className="fill-ink/45 text-[11px] tabular-nums">
              {shortRwf(t)}
            </text>
          </g>
        ))}
        {days.map((d, i) => {
          const x = pad.l + i * slot + (slot - barW) / 2;
          const top = y(d.total);
          const height = Math.max(0, H - pad.b - top);
          const r = Math.min(4, barW / 2, height);
          return (
            <g key={d.day}>
              {height > 0 && (
                <path
                  d={`M${x},${H - pad.b} V${top + r} Q${x},${top} ${x + r},${top} H${x + barW - r} Q${x + barW},${top} ${x + barW},${top + r} V${H - pad.b} Z`}
                  className={hover === i ? "fill-lime" : hover === null ? "fill-ink" : "fill-ink/35"}
                />
              )}
              {/* A hit area taller than the bar */}
              <rect x={pad.l + i * slot} y={pad.t} width={slot} height={H - pad.t - pad.b} fill="transparent" onMouseEnter={() => setHover(i)} />
              {i % 5 === 0 || i === days.length - 1 ? (
                <text x={x + barW / 2} y={H - 8} textAnchor="middle" className="fill-ink/45 text-[11px]">
                  {new Date(`${d.day}T12:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>
      {h && hover !== null && (
        <div
          className="pointer-events-none absolute top-4 z-10 -translate-x-1/2 rounded-xl bg-ink px-3 py-2 text-xs text-white shadow-lg"
          style={{ left: `calc(20px + (100% - 40px) * ${(pad.l + (hover + 0.5) * slot) / W})` }}
        >
          <p className="font-semibold">{new Date(`${h.day}T12:00:00`).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}</p>
          <p className="mt-0.5 tabular-nums text-white/80">
            {rwf(h.total)} · {h.orders.toLocaleString()} orders
          </p>
        </div>
      )}
    </div>
  );
}

function AttentionRow({ icon: Icon, title, detail, count, href, danger }: { icon: LucideIcon; title: string; detail: string; count: number; href: string; danger?: boolean }) {
  const clear = count === 0;
  return (
    <Link href={href} className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-ivory/70">
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${clear ? "bg-emerald-50 text-emerald-600" : danger ? "bg-rose-50 text-rose-600" : "bg-lime/40 text-ink"}`}>
        {clear ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-ink">{title}</span>
        <span className="block truncate text-xs text-ink/55">{clear ? "All clear" : detail}</span>
      </span>
      {!clear && <span className={`rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums ${danger ? "bg-rose-600 text-white" : "bg-ink text-lime"}`}>{count}</span>}
      <ChevronRight className="h-4 w-4 text-ink/30" />
    </Link>
  );
}

function CompanyMark({ c }: { c: PlatformCompany }) {
  return c.logo ? (
    // eslint-disable-next-line @next/next/no-img-element -- logos come from arbitrary hosts
    <img loading="lazy" decoding="async" src={c.logo} alt="" className="h-9 w-9 shrink-0 rounded-lg object-cover ring-1 ring-ink/10" />
  ) : (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ink text-[11px] font-semibold text-lime">
      {c.name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase())
        .join("")}
    </span>
  );
}

type Sort = "month" | "today" | "newest";

export default function AdminDashboard() {
  const { data, loading, error, reload } = usePlatform();
  const [now] = useState(() => Date.now());
  const [sort, setSort] = useState<Sort>("month");
  const [all, setAll] = useState(false);

  if (!data) {
    return (
      <div className="space-y-6">
        <div className="h-14 w-72 animate-pulse rounded-xl bg-ink/6" />
        {error && !loading ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
            {error}{" "}
            <button type="button" onClick={reload} className="font-semibold underline">
              Try again
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="h-40 animate-pulse rounded-2xl bg-white" />
            ))}
          </div>
        )}
      </div>
    );
  }

  const t = data.totals;
  const today = new Date(now);
  // Every one of the last 30 days, with nothing sold shown as zero.
  const byDay = new Map(data.salesByDay.map((d) => [d.day, d]));
  const days = Array.from({ length: 30 }, (_, i) => {
    const key = dayKey(new Date(now - (29 - i) * 86_400_000));
    return byDay.get(key) ?? { day: key, total: 0, orders: 0 };
  });
  const total30 = days.reduce((s, d) => s + d.total, 0);
  const orders30 = days.reduce((s, d) => s + d.orders, 0);
  const best = days.reduce((b, d) => (d.total > b.total ? d : b), days[0]);
  const dayOfMonth = today.getDate();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const pace = Math.round((t.salesMonth / dayOfMonth) * daysInMonth);
  const attention = attentionOf(data, now);

  const sorted = [...data.companies].sort((a, b) =>
    sort === "today" ? b.salesToday - a.salesToday : sort === "newest" ? b.createdAt.localeCompare(a.createdAt) : b.salesMonth - a.salesMonth,
  );
  const shown = all ? sorted : sorted.slice(0, 8);

  const industries = [...data.companies.reduce((m, c) => {
    const key = industryOf(c.type).label;
    const row = m.get(key) ?? { label: key, icon: industryOf(c.type).icon, count: 0, sales: 0 };
    m.set(key, { ...row, count: row.count + 1, sales: row.sales + c.salesMonth });
    return m;
  }, new Map<string, { label: string; icon: React.ElementType; count: number; sales: number }>()).values()].sort((a, b) => b.sales - a.sales || b.count - a.count);

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[13px] font-medium text-ink/55">
            {today.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
          <h1 className="mt-1 text-[26px] font-bold tracking-[-0.02em] text-ink">{greeting(today.getHours())}</h1>
          <p className="mt-1 text-sm text-ink/60">How every business on SmartPOS is doing. Updates every minute.</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={reload}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-white px-4 text-sm font-medium text-ink/75 ring-1 ring-inset ring-ink/12 transition-colors hover:bg-ivory"
          >
            <RotateCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
          <Link href="/admin/tabs/companies" className="inline-flex h-10 items-center gap-2 rounded-xl bg-lime px-4 text-sm font-semibold text-ink transition-colors hover:bg-lime-dark">
            <Plus className="h-4 w-4" /> Add company
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6 2xl:grid-cols-5">
        <Kpi icon={Banknote} label="Sales today" value={rwf(t.salesToday)} hint={`${t.ordersToday.toLocaleString()} orders across all companies`} foot={<>Average order {rwf(t.ordersToday ? t.salesToday / t.ordersToday : 0)}</>} />
        <Kpi
          icon={Receipt}
          label="Sales this month"
          value={rwf(t.salesMonth)}
          hint={`On pace for ${rwf(pace)} by month end`}
          foot={
            <span className="flex items-center justify-between">
              <span>Last month {rwf(t.salesLastMonth)}</span>
              {t.salesLastMonth > 0 && (
                <span className={`font-semibold ${pace >= t.salesLastMonth ? "text-emerald-700" : "text-rose-600"}`}>
                  {pace >= t.salesLastMonth ? "+" : "−"}
                  {Math.abs(pct(pace, t.salesLastMonth) - 100)}% pace
                </span>
              )}
            </span>
          }
        />
        <Kpi
          icon={Building2}
          label="Companies"
          value={t.companies.toLocaleString()}
          hint={`${t.activeCompanies} active · ${t.companies - t.activeCompanies} terminated`}
          foot={<>{t.newThisMonth} joined this month · {t.users.toLocaleString()} sign-in accounts</>}
        />
        <Kpi
          wide
          icon={CreditCard}
          label="Subscriptions"
          value={rwf(t.monthlyRevenue ?? 0)}
          hint="Expected each month from paying companies"
          foot={
            <span className="flex items-center justify-between">
              <span>Collected this month {rwf(t.collectedThisMonth ?? 0)}</span>
              {(t.overdue ?? 0) > 0 && <span className="font-semibold text-rose-600">{t.overdue} overdue</span>}
            </span>
          }
        />
        <Kpi
          wide
          icon={Monitor}
          label="Devices online"
          value={`${t.onlineDevices} / ${t.devices}`}
          hint={`${pct(t.onlineDevices, t.devices)}% of all devices are on now`}
          foot={
            <div className="h-1.5 overflow-hidden rounded-full bg-ink/8">
              <div className="h-full rounded-full bg-ink" style={{ width: `${pct(t.onlineDevices, t.devices)}%` }} />
            </div>
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card
          className="xl:col-span-2"
          title="Paid sales, last 30 days"
          sub={`${rwf(total30)} from ${orders30.toLocaleString()} orders · best day ${rwf(best.total)}`}
          action={<span className="rounded-full bg-ivory px-2.5 py-1 text-[11px] font-medium text-ink/60 ring-1 ring-inset ring-ink/10">All companies</span>}
        >
          <SalesChart days={days} />
        </Card>

        <Card title="Needs attention" sub="Open one to deal with it">
          <div className="divide-y divide-ink/6">
            <AttentionRow icon={Inbox} title="New in the inbox" detail="Installation requests, messages, password help" count={t.newRequests ?? 0} href="/admin/tabs/inbox" />
            <AttentionRow icon={CreditCard} title="Subscriptions overdue" detail={attention.overdue.map((c) => c.name).join(", ")} count={attention.overdue.length} href={attention.overdue[0] ? `/admin/tabs/companies/${attention.overdue[0].id}#subscription` : "/admin/tabs/companies"} danger />
            <AttentionRow icon={Monitor} title="Devices waiting for approval" detail={attention.waitingDevices.map((c) => c.name).join(", ")} count={t.waitingDevices} href="/admin/tabs/devices" />
            <AttentionRow icon={TrendingDown} title="No sales for over a week" detail={attention.quiet.map((c) => c.name).join(", ")} count={attention.quiet.length} href={attention.quiet[0] ? `/admin/tabs/companies/${attention.quiet[0].id}` : "/admin/tabs/companies"} danger />
            <AttentionRow icon={MonitorOff} title="Companies with no device" detail={attention.noDevices.map((c) => c.name).join(", ")} count={attention.noDevices.length} href={attention.noDevices[0] ? `/admin/tabs/companies/${attention.noDevices[0].id}` : "/admin/tabs/companies"} />
            <AttentionRow icon={Ban} title="Terminated companies" detail={attention.terminated.map((c) => c.name).join(", ")} count={attention.terminated.length} href={attention.terminated[0] ? `/admin/tabs/companies/${attention.terminated[0].id}` : "/admin/tabs/companies"} danger />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card
          className="xl:col-span-2"
          title="Companies"
          sub="Open a company to see everything in it"
          action={
            <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label="Sort companies" className="h-9 rounded-lg border border-ink/12 bg-white px-2.5 text-xs font-medium text-ink">
              <option value="month">Most sales this month</option>
              <option value="today">Most sales today</option>
              <option value="newest">Newest first</option>
            </select>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-sm">
              <thead>
                <tr className="border-b border-ink/6 text-left text-[11px] font-semibold uppercase tracking-[0.1em] text-ink/45">
                  <th className="px-5 py-3">Company</th>
                  <th className="px-3 py-3 text-right">Today</th>
                  <th className="px-3 py-3 text-right">This month</th>
                  <th className="px-3 py-3 text-right">Devices</th>
                  <th className="px-3 py-3">Last sale</th>
                  <th className="px-3 py-3">Subscription</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/6">
                {shown.map((c) => (
                  <tr key={c.id} className="group transition-colors hover:bg-ivory/60">
                    <td className="px-5 py-3">
                      <Link href={`/admin/tabs/companies/${c.id}`} className="flex items-center gap-3">
                        <CompanyMark c={c} />
                        <span className="min-w-0">
                          <span className="block truncate font-semibold text-ink group-hover:underline">{c.name}</span>
                          <span className="block truncate text-xs text-ink/50">
                            {industryOf(c.type).label} · {c.location || "No location"}
                          </span>
                        </span>
                        {!c.active && <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700">Terminated</span>}
                      </Link>
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums">
                      <span className="block font-medium text-ink">{rwf(c.salesToday)}</span>
                      <span className="block text-xs text-ink/50">{c.ordersToday} orders</span>
                    </td>
                    <td className="px-3 py-3 text-right font-semibold tabular-nums text-ink">{rwf(c.salesMonth)}</td>
                    <td className="px-3 py-3 text-right tabular-nums text-ink/70">
                      <span className="inline-flex items-center gap-1.5">
                        <span className={`h-2 w-2 rounded-full ${c.onlineDevices ? "bg-emerald-500" : "bg-ink/20"}`} />
                        {c.onlineDevices} / {c.devices}
                      </span>
                      {c.waitingDevices > 0 && <span className="block text-[11px] font-medium text-ink">{c.waitingDevices} waiting</span>}
                    </td>
                    <td className="px-3 py-3 text-xs text-ink/60">{c.lastOrderAt ? timeAgo(c.lastOrderAt) : "Never"}</td>
                    <td className="px-3 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${BILLING_META[c.billing ?? "NOT_SET"].cls}`}>{BILLING_META[c.billing ?? "NOT_SET"].label}</span>
                      {c.plan && <span className="mt-0.5 block text-[11px] text-ink/45">{PLAN_LABEL[c.plan] ?? c.plan}</span>}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link href={`/admin/tabs/companies/${c.id}`} aria-label={`Open ${c.name}`} className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-ink/40 transition-colors hover:bg-white hover:text-ink hover:ring-1 hover:ring-ink/12">
                        <ArrowUpRight className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
                {!shown.length && (
                  <tr>
                    <td colSpan={7} className="px-5 py-8 text-center text-sm text-ink/55">
                      No companies yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {sorted.length > 8 && (
            <button type="button" onClick={() => setAll((v) => !v)} className="w-full border-t border-ink/6 px-5 py-3 text-center text-xs font-semibold text-ink/70 transition-colors hover:bg-ivory/70 hover:text-ink">
              {all ? "Show fewer" : `Show all ${sorted.length} companies`}
            </button>
          )}
        </Card>

        <Card title="By industry" sub="Companies and their sales this month">
          <ul className="divide-y divide-ink/6">
            {industries.map(({ label, icon: Icon, count, sales }) => (
              <li key={label} className="px-5 py-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink/6 text-ink/70">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="flex-1 text-sm font-medium text-ink">
                    {label} <span className="text-xs font-normal text-ink/50">· {count}</span>
                  </span>
                  <span className="text-sm font-semibold tabular-nums text-ink">{rwf(sales)}</span>
                </div>
                <div className="ml-11 mt-2 h-1.5 overflow-hidden rounded-full bg-ink/8">
                  <div className="h-full rounded-full bg-ink" style={{ width: `${pct(sales, t.salesMonth)}%` }} />
                </div>
              </li>
            ))}
            {!industries.length && (
              <li className="flex items-center gap-2 px-5 py-4 text-sm text-ink/55">
                <AlertTriangle className="h-4 w-4" /> No companies yet.
              </li>
            )}
          </ul>
        </Card>
      </div>
    </div>
  );
}
