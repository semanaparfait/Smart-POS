"use client";

import { useMemo, useState } from "react";
import { BarChart3, Banknote, CheckCheck, ChevronLeft, ChevronRight, Info, Receipt, ShieldCheck, Trophy, Users } from "lucide-react";
import useAuthStore from "@/stores/auth/authstore";
import { ordersSince, useOwnerData } from "@/stores/owner/api";
import type { Order } from "@/app/owner/types";
import { Avatar, Card, EmptyState, ErrorState, Skeleton, dayKey, rwf, toNumber } from "@/app/owner/components/ui";
import { Button } from "@/app/owner/components/forms";
import { paidAt } from "@/app/owner/finance/money";
import { monthKeyOf, monthName, shiftMonth } from "@/app/owner/salaries/payroll";

interface Check {
  date: string;
  worker: { id: string };
  status: "VERIFIED" | "FLAGGED";
  difference: string | number;
}

// Points out of 100, shown on the page so the result can be explained. Only what
// SmartPOS really records counts.
const WEIGHTS = [
  { key: "sales", label: "Sales", max: 40 },
  { key: "orders", label: "Customers served", max: 25 },
  { key: "checks", label: "Money checks without a shortage", max: 20 },
  { key: "clean", label: "Few cancelled orders", max: 15 },
] as const;

type Row = {
  id: string;
  name: string;
  sales: number;
  orders: number;
  cancelled: number;
  checked: number;
  short: number;
  shortBy: number;
  parts: Record<(typeof WEIGHTS)[number]["key"], number>;
  score: number;
};

// Everyone who sold in the month, scored and ranked.
function rank(orders: Order[], checks: Check[], month: string): Row[] {
  const byId = new Map<string, Omit<Row, "parts" | "score">>();
  const get = (id: string, name: string) => {
    let r = byId.get(id);
    if (!r) {
      r = { id, name, sales: 0, orders: 0, cancelled: 0, checked: 0, short: 0, shortBy: 0 };
      byId.set(id, r);
    }
    return r;
  };
  for (const o of orders) {
    if (!o.user) continue;
    const name = o.user.employee?.name ?? o.user.name;
    if (o.status === "COMPLETED" && dayKey(new Date(paidAt(o))).startsWith(month)) {
      const r = get(o.user.id, name);
      r.sales += toNumber(o.total);
      r.orders += 1;
    } else if (o.status === "CANCELLED" && dayKey(new Date(o.createdAt)).startsWith(month)) {
      get(o.user.id, name).cancelled += 1;
    }
  }
  for (const c of checks) {
    if (!c.date.startsWith(month)) continue;
    const r = byId.get(c.worker.id);
    if (!r) continue;
    r.checked += 1;
    if (toNumber(c.difference) < 0) {
      r.short += 1;
      r.shortBy += -toNumber(c.difference);
    }
  }
  const list = [...byId.values()].filter((r) => r.orders > 0);
  const maxSales = Math.max(1, ...list.map((r) => r.sales));
  const maxOrders = Math.max(1, ...list.map((r) => r.orders));
  return list
    .map((r) => {
      const parts = {
        sales: (r.sales / maxSales) * 40,
        orders: (r.orders / maxOrders) * 25,
        // Nobody checked yet: neither helps nor hurts.
        checks: r.checked ? ((r.checked - r.short) / r.checked) * 20 : 10,
        clean: (1 - Math.min(1, r.cancelled / Math.max(1, r.orders + r.cancelled))) * 15,
      };
      const score = Math.round(Math.max(0, Math.min(100, Object.values(parts).reduce((a, b) => a + b, 0))));
      return { ...r, parts, score };
    })
    .sort((a, b) => b.score - a.score || b.sales - a.sales);
}

// Employee of the month, from what the tills recorded.
export default function WinnerPage() {
  const company = useAuthStore((s) => s.user?.company?.name);
  // A year back, for the hall of fame.
  const orders = useOwnerData<Order[]>(ordersSince(366));
  const checks = useOwnerData<Check[]>("/money-checks");
  const thisMonth = monthKeyOf(new Date());
  const [month, setMonth] = useState(thisMonth);

  const ranking = useMemo(() => rank(orders.data ?? [], checks.data ?? [], month), [orders.data, checks.data, month]);
  // The winners of the months before, as far back as the orders go.
  const hallOfFame = useMemo(() => {
    const all = orders.data ?? [];
    const months = [...new Set(all.filter((o) => o.status === "COMPLETED").map((o) => dayKey(new Date(paidAt(o))).slice(0, 7)))].sort().reverse().slice(0, 12);
    return months.map((m) => ({ month: m, winner: rank(all, checks.data ?? [], m)[0] })).filter((e) => e.winner);
  }, [orders.data, checks.data]);

  if (orders.error && !orders.data) return <ErrorState message={orders.error} onRetry={orders.reload} />;

  const winner = ranking[0];
  const gap = ranking[1] ? winner.score - ranking[1].score : null;
  const others = ranking.slice(1);
  const leads = (pick: (r: Row) => number, higher = true) => others.every((o) => (higher ? pick(winner) >= pick(o) : pick(winner) <= pick(o)));
  const reasons: { icon: typeof Banknote; text: string }[] = winner
    ? [
        ...(leads((r) => r.sales) ? [{ icon: Banknote, text: `Highest sales this month: ${rwf(winner.sales)}` }] : []),
        ...(leads((r) => r.orders) ? [{ icon: Users, text: `Served the most customers: ${winner.orders} orders` }] : []),
        ...(winner.checked && winner.short === 0 ? [{ icon: ShieldCheck, text: `Every money check matched (${winner.checked} days)` }] : []),
        ...(winner.cancelled === 0 ? [{ icon: CheckCheck, text: "No cancelled orders all month" }] : []),
      ]
    : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-ink/45">Recognition</p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-[-0.02em] text-ink md:text-[28px]">Employee of the month</h1>
          <p className="mt-1 text-sm text-ink/60">
            {monthName(month)} · {company ?? "Your business"}
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-xl bg-white p-1 ring-1 ring-inset ring-ink/10">
          <Button small tone="quiet" icon={ChevronLeft} aria-label="Previous month" onClick={() => setMonth((m) => shiftMonth(m, -1))} />
          <span className="w-36 text-center text-sm font-semibold text-ink">{monthName(month)}</span>
          <Button small tone="quiet" icon={ChevronRight} aria-label="Next month" disabled={month >= thisMonth} onClick={() => setMonth((m) => shiftMonth(m, 1))} />
        </div>
      </div>

      {orders.loading && !orders.data ? (
        <Skeleton className="h-72" />
      ) : !winner ? (
        <Card>
          <EmptyState icon={Trophy} title="No sales this month yet" text="The winner shows here once workers sell." />
        </Card>
      ) : (
        <>
          <div className="overflow-hidden rounded-2xl bg-ink p-6 text-white">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
              <div className="flex items-center gap-5">
                <div className="relative">
                  <Avatar name={winner.name} size={96} />
                  <span className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full bg-lime text-ink ring-4 ring-ink">
                    <Trophy className="h-4.5 w-4.5" />
                  </span>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-lime">{month === thisMonth ? "Leading this month" : "Winner"}</p>
                  <p className="text-2xl font-extrabold">{winner.name}</p>
                  <p className="text-sm text-white/60">
                    Score {winner.score} / 100{gap !== null ? ` · ${gap} points ahead of ${ranking[1].name.split(" ")[0]}` : ""}
                  </p>
                </div>
              </div>
              <div className="grid flex-1 grid-cols-2 gap-4 sm:grid-cols-4">
                {[
                  ["Sales handled", rwf(winner.sales)],
                  ["Customers served", winner.orders.toLocaleString()],
                  ["Money checks", winner.checked ? `${winner.checked - winner.short}/${winner.checked} matched` : "None yet"],
                  ["Cancelled orders", String(winner.cancelled)],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl bg-white/6 p-3 ring-1 ring-inset ring-white/10">
                    <p className="text-[11px] text-white/55">{label}</p>
                    <p className="truncate text-base font-extrabold text-lime">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_380px]">
            <div className="space-y-6">
              <Card title="Leaderboard" description="Everyone who sold this month">
                <ol className="divide-y divide-ink/6">
                  {ranking.map((r, i) => (
                    <li key={r.id} className={`flex items-center gap-3 px-5 py-3 ${i === 0 ? "bg-lime/15" : ""}`}>
                      <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${i === 0 ? "bg-ink text-lime" : "bg-ivory text-ink/60"}`}>{i + 1}</span>
                      <Avatar name={r.name} size={36} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-ink">{r.name}</p>
                        <p className="text-xs text-ink/55">
                          {rwf(r.sales)} · {r.orders} orders
                          {r.short ? ` · ${r.short} short counts (${rwf(r.shortBy)})` : ""}
                        </p>
                      </div>
                      <div className="w-28">
                        <p className="text-right text-sm font-extrabold text-ink">{r.score}</p>
                        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-ivory">
                          <div className="h-full rounded-full bg-ink" style={{ width: `${r.score}%` }} />
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              </Card>

              <Card title={`How ${winner.name.split(" ")[0]} scored ${winner.score}`}>
                <div className="space-y-3 p-5">
                  {WEIGHTS.map((w) => {
                    const value = winner.parts[w.key];
                    return (
                      <div key={w.key}>
                        <div className="flex justify-between text-sm">
                          <span className="text-ink/70">{w.label}</span>
                          <span className="font-semibold text-ink">
                            {value.toFixed(1)} / {w.max}
                          </span>
                        </div>
                        <div className="mt-1 h-2 overflow-hidden rounded-full bg-ivory">
                          <div className="h-full rounded-full bg-lime" style={{ width: `${(value / w.max) * 100}%` }} />
                        </div>
                      </div>
                    );
                  })}
                  <p className="flex items-start gap-2 pt-2 text-xs text-ink/55">
                    <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    Sales and customers are compared with the best this month. A worker with no money check yet gets half the check points.
                  </p>
                </div>
              </Card>
            </div>

            <div className="space-y-6">
              <Card title={`Why ${winner.name.split(" ")[0]} ${month === thisMonth ? "leads" : "won"}`}>
                <ul className="space-y-3 p-5">
                  {(reasons.length ? reasons : [{ icon: BarChart3, text: "Best overall score across sales, customers, money checks and cancellations" }]).map((r) => (
                    <li key={r.text} className="flex items-start gap-3 text-sm text-ink/80">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ivory">
                        <r.icon className="h-4 w-4 text-ink" />
                      </span>
                      <span className="pt-1.5">{r.text}</span>
                    </li>
                  ))}
                </ul>
              </Card>
              <Card title="Hall of fame" description="The winner of each month">
                {hallOfFame.length === 0 ? (
                  <p className="px-5 py-4 text-sm text-ink/55">No months yet.</p>
                ) : (
                  <ul className="divide-y divide-ink/6">
                    {hallOfFame.map((e) => (
                      <li key={e.month}>
                        <button type="button" onClick={() => setMonth(e.month)} className={`flex w-full items-center gap-3 px-5 py-3 text-left hover:bg-ivory/60 ${e.month === month ? "bg-ivory" : ""}`}>
                          <Trophy className={`h-4 w-4 ${e.month === thisMonth ? "text-lime-dark" : "text-ink/40"}`} />
                          <span className="flex-1 text-sm text-ink/70">{monthName(e.month)}</span>
                          <span className="text-sm font-bold text-ink">{e.winner!.name}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
              <p className="flex items-start gap-2 text-xs text-ink/50">
                <Receipt className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                Counted from paid and cancelled orders and your money checks.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
