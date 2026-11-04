"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  Clock,
  Flag,
  Hourglass,
  Receipt,
  RotateCw,
  Tag,
  TrendingDown,
  User,
  Users,
  type LucideIcon,
} from "lucide-react";
import useAuthStore from "@/stores/auth/authstore";
import { useOwnerData } from "@/stores/owner/api";
import type { Order, Product } from "@/app/owner/types";
import { Card, ErrorState, PageHeader, Skeleton, Tabs, dayKey, rwf, toNumber } from "@/app/owner/components/ui";
import { Button, TextInput, todayKey } from "@/app/owner/components/forms";
import { categoryLabel } from "@/app/owner/finance/labels";
import { costsBetween, daysSince, owedBack, paidAt, rangeOf, shiftDays, signedPayment, type CheckedPayment, type Expense } from "@/app/owner/finance/money";

const OLD_CREDIT_DAYS = 30;
const DAY = 86_400_000;
type Method = "CASH" | "MOMO" | "CARD" | "CREDIT";
const METHODS: { value: Method; label: string }[] = [
  { value: "CASH", label: "Cash" },
  { value: "MOMO", label: "MoMo" },
  { value: "CARD", label: "Card" },
  { value: "CREDIT", label: "Credit" },
];

interface StaffWorker {
  active: boolean;
  salary: number;
  owed: number;
  payments: { status: string }[];
  salaryPayments: { month: string; amount: number; deducted: number }[];
}
interface Check {
  date: string;
  worker: { id: string };
  status: "VERIFIED" | "FLAGGED";
  difference: string | number;
  note: string | null;
}
interface OwedBooking {
  balance: number;
}

// One line of the profit and loss statement.
function Line({ label, value, minus, strong, indent, tone }: { label: string; value: number; minus?: boolean; strong?: boolean; indent?: boolean; tone?: "good" | "bad" }) {
  return (
    <div className={`flex items-center justify-between gap-3 py-2 ${strong ? "border-t border-ink/8 font-bold" : ""} ${indent ? "pl-4" : ""}`}>
      <span className={`text-sm ${strong ? "text-ink" : "text-ink/65"}`}>{label}</span>
      <span className={`text-sm ${tone === "bad" ? "text-rose-600" : tone === "good" ? "text-emerald-700" : "text-ink"} ${strong ? "font-extrabold" : "font-semibold"}`}>
        {minus && value ? "− " : ""}
        {rwf(Math.abs(value))}
      </span>
    </div>
  );
}

// The company's money: what came in, what it cost, what is left as profit or
// loss, and what the company holds.
export default function FinanceOverview() {
  const servicesOn = useAuthStore((s) => s.user?.company?.features?.services !== false);
  const [firstDay, setFirstDay] = useState(todayKey());
  const [lastDay, setLastDay] = useState(todayKey());
  const { from, to } = useMemo(() => rangeOf(firstDay, lastDay), [firstDay, lastDay]);

  const orders = useOwnerData<Order[]>("/orders");
  const products = useOwnerData<Product[]>("/products");
  const expenses = useOwnerData<Expense[]>("/expenses");
  const salaries = useOwnerData<{ monthly: number }>("/expenses/salaries");
  const staff = useOwnerData<StaffWorker[]>("/staff-debts");
  const checks = useOwnerData<Check[]>("/money-checks");
  const services = useOwnerData<CheckedPayment[]>(servicesOn ? `/booking-payments?${new URLSearchParams({ from: from.toISOString(), to: to.toISOString() })}` : null);
  const waiting = useOwnerData<CheckedPayment[]>(servicesOn ? "/booking-payments?receipt=PENDING" : null);
  const owedBookings = useOwnerData<OwedBooking[]>(servicesOn ? "/bookings?status=COMPLETED" : null);

  const today = todayKey();
  const yesterday = dayKey(shiftDays(new Date(), -1));
  const shortcut = firstDay === lastDay && firstDay === today ? "today" : firstDay === lastDay && firstDay === yesterday ? "yesterday" : "";

  const refresh = () => [orders, products, expenses, salaries, staff, checks, services, waiting, owedBookings].forEach((d) => d.reload());

  const money = useMemo(() => {
    const inRange = (value: string) => {
      const t = new Date(value).getTime();
      return t >= from.getTime() && t < to.getTime();
    };
    const byMethod: Record<Method, number> = { CASH: 0, MOMO: 0, CARD: 0, CREDIT: 0 };
    let sales = 0;
    let goods = 0;
    let costKnown = true;
    let unrecorded = 0;
    const workerDays = new Set<string>();
    for (const o of (orders.data ?? []).filter((o) => o.status === "COMPLETED" && inRange(paidAt(o)))) {
      sales += toNumber(o.total);
      for (const item of o.items ?? []) {
        const unit = item.unitCost ?? item.product?.buyingPrice;
        if (unit === null || unit === undefined) costKnown = false;
        goods += toNumber(unit) * item.quantity;
      }
      if (o.user) workerDays.add(`${dayKey(new Date(paidAt(o)))}|${o.user.id}`);
      const ps = o.payments ?? [];
      if (!ps.length) unrecorded += 1;
      for (const p of ps) {
        const m = String(p.method).toUpperCase() as Method;
        if (m in byMethod) byMethod[m] += toNumber(p.amount);
      }
    }
    // Service money, after refunds.
    let serviceIn = 0;
    let refunds = 0;
    for (const p of services.data ?? []) {
      if (p.isRefund) refunds += toNumber(p.amount);
      else serviceIn += toNumber(p.amount);
      byMethod[p.method] += signedPayment(p);
      if (p.takenBy) workerDays.add(`${dayKey(new Date(p.createdAt))}|${p.takenBy.id}`);
    }
    const income = sales + serviceIn - refunds;
    const gross = income - goods;
    // With salaries recorded, a paid month counts what was paid (with what was
    // taken off for debts); other months count the planned salary.
    const workers = staff.data ?? [];
    const salaryFor = (month: string) =>
      workers.reduce((sum, w) => {
        const paid = w.salaryPayments.find((p) => p.month === month);
        return sum + (paid ? paid.amount + paid.deducted : w.active ? w.salary : 0);
      }, 0);
    const costs = costsBetween(expenses.data ?? [], workers.length ? salaryFor : (salaries.data?.monthly ?? 0), from, to);
    const net = gross - costs.total;
    const stockValue = (products.data ?? []).filter((p) => p.trackStock).reduce((sum, p) => sum + Math.max(0, toNumber(p.stockQuantity)) * toNumber(p.buyingPrice), 0);
    let credits = 0;
    let oldCredits = 0;
    for (const o of orders.data ?? []) {
      if (o.status !== "COMPLETED") continue;
      for (const p of o.payments ?? []) {
        if (String(p.method).toUpperCase() !== "CREDIT") continue;
        credits += toNumber(p.amount);
        if (daysSince(paidAt(o)) > OLD_CREDIT_DAYS) oldCredits += 1;
      }
    }
    const serviceOwed = (owedBookings.data ?? []).filter((b) => b.balance > 0).reduce((sum, b) => sum + b.balance, 0);
    let olderUnchecked = 0;
    const flagged: { date: string; difference: number; note: string | null }[] = [];
    for (const key of workerDays) {
      const [date, userId] = key.split("|");
      const record = (checks.data ?? []).find((c) => c.date === date && c.worker.id === userId);
      if (!record && date < today) olderUnchecked += 1;
      if (record?.status === "FLAGGED") flagged.push({ date, difference: toNumber(record.difference), note: record.note });
    }
    return {
      sales,
      serviceIn,
      refunds,
      income,
      goods,
      costKnown,
      gross,
      costs,
      net,
      margin: income > 0 ? Math.round((net / income) * 100) : 0,
      byMethod,
      received: byMethod.CASH + byMethod.MOMO + byMethod.CARD,
      stockValue,
      credits,
      oldCredits,
      serviceOwed,
      unrecorded,
      olderUnchecked,
      flagged,
      missing: (services.data ?? []).filter((p) => p.receipt === "MISSING"),
    };
  }, [orders.data, services.data, expenses.data, salaries.data, staff.data, products.data, owedBookings.data, checks.data, from, to, today]);

  if (orders.error) return <ErrorState message={orders.error} onRetry={orders.reload} />;

  const profit = money.net >= 0;
  const methodMax = Math.max(1, ...METHODS.map((m) => Math.abs(money.byMethod[m.value])));
  const waitingList = waiting.data ?? [];
  const waitingTotal = waitingList.reduce((sum, p) => sum + signedPayment(p), 0);
  const expenseList = expenses.data ?? [];
  const owedToWorkers = expenseList.filter(owedBack).reduce((sum, e) => sum + toNumber(e.amount), 0);
  const workers = staff.data ?? [];
  const owedByWorkers = workers.reduce((sum, w) => sum + w.owed, 0);
  const debtPaymentsWaiting = workers.reduce((n, w) => n + w.payments.filter((p) => p.status === "PENDING").length, 0);
  const holds = money.stockValue + money.credits + money.serviceOwed + owedByWorkers - owedToWorkers;
  const pendingExpenses = expenseList.filter((e) => e.status === "PENDING").length;

  const attention: { icon: LucideIcon; bad?: boolean; text: string; href?: string }[] = [
    ...(money.net < 0 ? [{ icon: TrendingDown, bad: true, text: `These dates end in a loss of ${rwf(-money.net)}` }] : []),
    ...money.missing.map((p) => ({
      icon: AlertCircle,
      bad: true,
      text: `Service money not received: ${rwf(p.amount)} · ${p.takenBy?.name ?? "—"}${p.receiptNote ? ` · ${p.receiptNote}` : ""}`,
      href: "/owner/finance/service-money",
    })),
    ...money.flagged.map((f) => ({
      icon: Flag,
      bad: true,
      text: `Flagged count ${f.date}: ${f.difference < 0 ? "short" : "over"} ${rwf(Math.abs(f.difference))}${f.note ? ` · ${f.note}` : ""}`,
      href: "/owner/money-checks",
    })),
    ...(money.olderUnchecked ? [{ icon: Clock, text: `${money.olderUnchecked} worker days from before today are not checked yet`, href: "/owner/money-checks" }] : []),
    ...(waitingList.length ? [{ icon: Hourglass, text: `Service money waiting to confirm: ${rwf(waitingTotal)} (${waitingList.length})`, href: "/owner/finance/service-money" }] : []),
    ...(money.oldCredits ? [{ icon: Clock, bad: true, text: `${money.oldCredits} credits are older than 30 days`, href: "/owner/finance/credits" }] : []),
    ...(!money.costKnown ? [{ icon: Tag, text: "Some products have no cost, so the profit is too high", href: "/owner/products" }] : []),
    ...(money.unrecorded ? [{ icon: CircleHelp, text: `${money.unrecorded} paid orders have no payment method recorded` }] : []),
    ...(pendingExpenses ? [{ icon: Receipt, text: `${pendingExpenses} expenses sent by workers are waiting for approval`, href: "/owner/expenses" }] : []),
    ...(debtPaymentsWaiting ? [{ icon: Users, text: `${debtPaymentsWaiting} payments from workers for their debts are waiting for approval`, href: "/owner/salaries" }] : []),
    ...(owedToWorkers > 0 ? [{ icon: User, bad: true, text: `Owed back to workers: ${rwf(owedToWorkers)}`, href: "/owner/expenses" }] : []),
    ...(!expenseList.length && expenses.data ? [{ icon: Receipt, text: "No expenses recorded yet, so the profit leaves out rent and bills", href: "/owner/expenses" }] : []),
  ];

  const loading = orders.loading && !orders.data;
  const dayCount = Math.round((to.getTime() - from.getTime()) / DAY);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Finance"
        title="Overview"
        description="The company's money: what came in, what it cost to run, and the profit or loss that is left."
        actions={
          <Button tone="outline" icon={RotateCw} onClick={refresh}>
            Refresh
          </Button>
        }
      />

      <div className="flex flex-wrap items-end gap-3">
        <Tabs
          options={[
            { value: "today", label: "Today" },
            { value: "yesterday", label: "Yesterday" },
          ]}
          value={shortcut}
          onChange={(v) => {
            const d = v === "today" ? today : yesterday;
            setFirstDay(d);
            setLastDay(d);
          }}
        />
        <label className="text-xs font-semibold text-ink">
          From
          <TextInput
            type="date"
            value={firstDay}
            max={today}
            onChange={(e) => {
              const d = e.target.value || today;
              setFirstDay(d);
              // Picking a start after the end moves the end with it.
              if (d > lastDay) setLastDay(d);
            }}
            className="mt-1 h-10 w-44"
          />
        </label>
        <label className="text-xs font-semibold text-ink">
          To
          <TextInput
            type="date"
            value={lastDay}
            max={today}
            onChange={(e) => {
              const d = e.target.value || today;
              setLastDay(d);
              if (d < firstDay) setFirstDay(d);
            }}
            className="mt-1 h-10 w-44"
          />
        </label>
        <span className="pb-2.5 text-xs text-ink/55">{firstDay === lastDay ? "One day" : `${dayCount} days`}</span>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-64" />
        </div>
      ) : (
        <>
          <div className={`rounded-2xl p-6 ${profit ? "bg-ink text-white" : "bg-rose-50 text-rose-700"}`}>
            <p className={`text-xs font-bold uppercase tracking-[0.2em] ${profit ? "text-white/55" : ""}`}>{profit ? "Net profit" : "Net loss"}</p>
            <p className={`mt-1 text-4xl font-extrabold tracking-[-0.02em] ${profit ? "text-lime" : ""}`}>
              {profit ? "" : "− "}
              {rwf(Math.abs(money.net))}
            </p>
            <p className={`mt-2 text-xs ${profit ? "text-white/60" : ""}`}>
              Income {rwf(money.income)} − goods {rwf(money.goods)} − expenses {rwf(money.costs.total)}
              {money.income > 0 ? ` · ${money.margin}% of income` : ""}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Income", value: rwf(money.income), hint: "Sales and services, after refunds" },
              { label: "Expenses", value: rwf(money.goods + money.costs.total), hint: "Goods sold, bills, rent and salaries", bad: true },
              { label: "Money received", value: rwf(money.received), hint: "Cash, MoMo and card" },
              { label: "Owed to you", value: rwf(money.credits + money.serviceOwed), hint: "Credits and unpaid services, all dates", bad: money.credits + money.serviceOwed > 0 },
            ].map((k) => (
              <div key={k.label} className="rounded-2xl border border-ink/10 bg-white p-5">
                <p className="text-xs font-semibold text-ink/55">{k.label}</p>
                <p className={`mt-2 truncate text-2xl font-extrabold ${k.bad ? "text-rose-600" : "text-ink"}`}>{k.value}</p>
                <p className="mt-1 text-xs text-ink/50">{k.hint}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <Card
              title="Profit and loss"
              description="Repeating costs and salaries count their share of each day"
              action={
                <Link href="/owner/expenses" className="inline-flex items-center gap-1 text-xs font-bold text-ink hover:underline">
                  Expenses <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              }
            >
              <div className="px-5 py-2">
                <Line label="Product sales" value={money.sales} />
                {servicesOn && <Line label="Services" value={money.serviceIn} />}
                {money.refunds > 0 && <Line label="Refunds" value={money.refunds} minus tone="bad" />}
                <Line label="Income" value={money.income} strong />
                <Line label="Cost of goods sold" value={money.goods} minus />
                <Line label="Gross profit" value={money.gross} strong tone={money.gross < 0 ? "bad" : undefined} />
                <Line label="Salaries" value={money.costs.salaries} minus indent />
                {money.costs.categories.map((c) => (
                  <Line key={c.category} label={categoryLabel(c.category)} value={c.amount} minus indent />
                ))}
                <Line label="Total expenses" value={money.costs.total} minus strong />
                <Line label={profit ? "Net profit" : "Net loss"} value={money.net} minus={!profit} strong tone={profit ? "good" : "bad"} />
              </div>
            </Card>

            <div className="space-y-6">
              <Card title="What the company holds" description="Right now, whatever the dates">
                <div className="px-5 py-2">
                  <Line label="Stock, at what it cost" value={money.stockValue} />
                  <Line label="Credits owed by customers" value={money.credits} />
                  {servicesOn && <Line label="Unpaid services" value={money.serviceOwed} />}
                  {owedByWorkers > 0 && <Line label="Owed by workers" value={owedByWorkers} />}
                  {owedToWorkers > 0 && <Line label="Owed back to workers" value={owedToWorkers} minus tone="bad" />}
                  <Line label="Total" value={holds} strong />
                </div>
              </Card>

              <Card title="How the money came in">
                <div className="space-y-3 p-5">
                  {METHODS.map((m) => {
                    const value = money.byMethod[m.value];
                    const credit = m.value === "CREDIT";
                    return (
                      <div key={m.value}>
                        <div className="flex items-center justify-between text-sm">
                          <span className={`font-semibold ${credit ? "text-rose-600" : "text-ink"}`}>
                            {m.label}
                            {credit ? " (not paid yet)" : ""}
                          </span>
                          <span className="font-semibold text-ink">{rwf(value)}</span>
                        </div>
                        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-ivory">
                          <div className={`h-full rounded-full ${credit ? "bg-rose-500" : "bg-ink"}`} style={{ width: `${(Math.max(0, value) / methodMax) * 100}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>
          </div>

          <Card title="Needs attention">
            {attention.length === 0 ? (
              <p className="flex items-center gap-2 p-5 text-sm text-emerald-700">
                <CheckCircle2 className="h-4.5 w-4.5" /> Nothing needs you right now.
              </p>
            ) : (
              <ul className="divide-y divide-ink/6">
                {attention.map((a, i) => {
                  const Icon = a.icon;
                  const body = (
                    <>
                      <Icon className={`h-4.5 w-4.5 shrink-0 ${a.bad ? "text-rose-600" : "text-ink/60"}`} />
                      <span className="flex-1 text-sm text-ink">{a.text}</span>
                      {a.href && <ChevronRight className="h-4 w-4 text-ink/35" />}
                    </>
                  );
                  return (
                    <li key={`${a.text}-${i}`}>
                      {a.href ? (
                        <Link href={a.href} className="flex items-center gap-3 px-5 py-3 hover:bg-ivory/60">
                          {body}
                        </Link>
                      ) : (
                        <div className="flex items-center gap-3 px-5 py-3">{body}</div>
                      )}
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
