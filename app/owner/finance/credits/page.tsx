"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowRight, ChevronDown, ChevronUp, Clock, Hourglass, Phone, RotateCw, User, Users } from "lucide-react";
import { CREDIT_ORDERS, useOwnerData } from "@/stores/owner/api";
import type { Order } from "@/app/owner/types";
import { Avatar, Card, EmptyState, ErrorState, PageHeader, SearchInput, Skeleton, Tabs, formatDate, rwf } from "@/app/owner/components/ui";
import { Button } from "@/app/owner/components/forms";
import { creditsOf, daysSince, orderNumber, type CreditEntry } from "@/app/owner/finance/money";

type Period = "all" | "30" | "7" | "today";
type Sort = "amount" | "recent" | "oldest";

interface Customer {
  key: string;
  name: string;
  phone: string;
  entries: CreditEntry[];
  total: number;
  first: string;
  last: string;
}

// Same person if the phone matches; otherwise the name.
const customerKey = (name: string, phone: string) => {
  const digits = phone.replace(/\D/g, "");
  return digits ? `p:${digits.slice(-9)}` : `n:${name.trim().toLowerCase()}`;
};
const ago = (value: string) => {
  const d = daysSince(value);
  return d === 0 ? "today" : d === 1 ? "yesterday" : `${d} days ago`;
};
const inPeriod = (value: string, period: Period) =>
  period === "all" ? true : period === "today" ? new Date(value).toDateString() === new Date().toDateString() : daysSince(value) < Number(period);

function CreditRow({ entry }: { entry: CreditEntry }) {
  const { order } = entry;
  const count = (order.items ?? []).reduce((s, i) => s + i.quantity, 0);
  const others = (order.payments ?? []).filter((p) => String(p.method).toUpperCase() !== "CREDIT");
  return (
    <div className="rounded-xl bg-white p-4 ring-1 ring-inset ring-ink/8">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-bold text-ink">{rwf(entry.amount)}</p>
          <p className="text-xs text-ink/55">
            {new Date(entry.takenAt).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })} · {ago(entry.takenAt)}
          </p>
        </div>
        <div className="text-right text-xs text-ink/60">
          <p>
            Served by <span className="font-semibold text-ink">{entry.servedBy}</span>
          </p>
          <p>
            Taken by <span className="font-semibold text-ink">{entry.takenBy || "Not recorded"}</span>
          </p>
        </div>
      </div>
      <ul className="mt-3 space-y-1 border-t border-ink/6 pt-3 text-xs text-ink/70">
        {(order.items ?? []).map((item) => (
          <li key={item.id} className="flex justify-between gap-3">
            <span>
              {item.quantity} × {item.product?.name ?? "Item"}
            </span>
            <span className="font-semibold text-ink">{rwf(item.totalPrice)}</span>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex items-center justify-between gap-2 text-xs">
        <span className="text-ink/50">
          Order {orderNumber(order)} · {count} item{count === 1 ? "" : "s"}
          {others.length ? ` · rest paid by ${others.map((p) => String(p.method).toLowerCase()).join(" + ")}` : " · all on credit"}
        </span>
        <Link href={`/owner/orders/${order.id}`} className="inline-flex items-center gap-1 font-bold text-ink hover:underline">
          Open order <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

// Customers who took goods on credit, when they took them and who served them.
export default function CreditsPage() {
  const { data, loading, error, reload } = useOwnerData<Order[]>(CREDIT_ORDERS);
  const [search, setSearch] = useState("");
  const [period, setPeriod] = useState<Period>("all");
  const [sort, setSort] = useState<Sort>("amount");
  const [openKey, setOpenKey] = useState<string | null>(null);

  const entries = useMemo(() => creditsOf(data ?? []), [data]);
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return entries.filter(
      (e) => inPeriod(e.takenAt, period) && (!q || [e.customerName, e.customerPhone, e.takenBy, e.servedBy, orderNumber(e.order)].some((v) => v.toLowerCase().includes(q))),
    );
  }, [entries, period, search]);
  const customers = useMemo(() => {
    const map = new Map<string, Customer>();
    for (const e of filtered) {
      const key = customerKey(e.customerName, e.customerPhone);
      let c = map.get(key);
      if (!c) {
        c = { key, name: e.customerName, phone: e.customerPhone, entries: [], total: 0, first: e.takenAt, last: e.takenAt };
        map.set(key, c);
      }
      c.entries.push(e);
      c.total += e.amount;
      if (e.takenAt < c.first) c.first = e.takenAt;
      if (e.takenAt > c.last) c.last = e.takenAt;
      if (!c.phone && e.customerPhone) c.phone = e.customerPhone;
    }
    const list = [...map.values()];
    for (const c of list) c.entries.sort((a, b) => b.takenAt.localeCompare(a.takenAt));
    return list.sort((a, b) => (sort === "amount" ? b.total - a.total : sort === "recent" ? b.last.localeCompare(a.last) : a.first.localeCompare(b.first)));
  }, [filtered, sort]);

  const total = filtered.reduce((s, e) => s + e.amount, 0);
  const oldest = filtered.reduce<string | null>((min, e) => (!min || e.takenAt < min ? e.takenAt : min), null);
  const topServer = useMemo(() => {
    const byServer = new Map<string, number>();
    for (const e of filtered) byServer.set(e.servedBy, (byServer.get(e.servedBy) ?? 0) + e.amount);
    return [...byServer.entries()].sort((a, b) => b[1] - a[1])[0];
  }, [filtered]);

  if (error && !data) return <ErrorState message={error} onRetry={reload} />;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Finance"
        title="Credits"
        description="Customers who took goods on credit, when they took them and who served them."
        actions={
          <Button tone="outline" icon={RotateCw} busy={loading} onClick={reload}>
            Refresh
          </Button>
        }
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { icon: Clock, label: "Total on credit", value: rwf(total), hint: `${filtered.length} credit sale${filtered.length === 1 ? "" : "s"}` },
          { icon: Users, label: "Customers", value: String(customers.length), hint: "With at least one credit" },
          { icon: Hourglass, label: "Oldest credit", value: oldest ? `${daysSince(oldest)} days` : "—", hint: oldest ? `Since ${formatDate(oldest)}` : "No credits" },
          { icon: User, label: "Most credit given by", value: topServer ? topServer[0] : "—", hint: topServer ? rwf(topServer[1]) : undefined },
        ].map((k) => (
          <div key={k.label} className="rounded-2xl border border-ink/10 bg-white p-5">
            <p className="flex items-center gap-2 text-xs font-semibold text-ink/55">
              <k.icon className="h-4 w-4" /> {k.label}
            </p>
            <p className="mt-2 truncate text-2xl font-extrabold text-ink">{k.value}</p>
            {k.hint && <p className="mt-1 text-xs text-ink/50">{k.hint}</p>}
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <SearchInput value={search} onChange={setSearch} placeholder="Customer, phone, worker or order number" />
        <Tabs
          options={[
            { value: "all", label: "All time" },
            { value: "30", label: "30 days" },
            { value: "7", label: "7 days" },
            { value: "today", label: "Today" },
          ]}
          value={period}
          onChange={setPeriod}
        />
        <Tabs
          options={[
            { value: "amount", label: "Highest amount" },
            { value: "recent", label: "Most recent" },
            { value: "oldest", label: "Oldest first" },
          ]}
          value={sort}
          onChange={setSort}
        />
      </div>

      {loading && !data ? (
        <Skeleton className="h-48" />
      ) : customers.length === 0 ? (
        <Card>
          <EmptyState
            title={entries.length === 0 ? "No credit sales yet" : "No credits match"}
            text={entries.length === 0 ? "When a sale is paid with credit at checkout, the customer appears here." : "Try another period or search term."}
          />
        </Card>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-ink/55">
            {customers.length} customer{customers.length === 1 ? "" : "s"} · click one to see each credit
          </p>
          {customers.map((c) => {
            const open = openKey === c.key;
            const servers = [...new Set(c.entries.map((e) => e.servedBy))];
            return (
              <div key={c.key} className="overflow-hidden rounded-2xl border border-ink/10 bg-white">
                <button type="button" onClick={() => setOpenKey(open ? null : c.key)} aria-expanded={open} className="flex w-full items-center gap-4 px-5 py-4 text-left hover:bg-ivory/60">
                  <Avatar name={c.name} size={42} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-ink">{c.name}</p>
                    <p className="flex items-center gap-1.5 text-xs text-ink/55">
                      {c.phone ? (
                        <>
                          <Phone className="h-3 w-3" />
                          <a href={`tel:${c.phone}`} onClick={(e) => e.stopPropagation()} className="hover:underline">
                            {c.phone}
                          </a>
                        </>
                      ) : (
                        "No phone"
                      )}
                    </p>
                  </div>
                  <div className="hidden text-right text-xs text-ink/55 sm:block">
                    <p>
                      {c.entries.length} time{c.entries.length === 1 ? "" : "s"}
                    </p>
                    <p>{servers.length === 1 ? servers[0] : `${servers[0]} +${servers.length - 1}`}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-extrabold text-rose-600">{rwf(c.total)}</p>
                    <p className="text-[11px] text-ink/45">Last {ago(c.last)}</p>
                  </div>
                  {open ? <ChevronUp className="h-4.5 w-4.5 text-ink/35" /> : <ChevronDown className="h-4.5 w-4.5 text-ink/35" />}
                </button>
                {open && (
                  <div className="space-y-2 border-t border-ink/6 bg-ivory/50 p-4">
                    {daysSince(c.first) >= 30 && (
                      <p className="flex items-center gap-2 text-xs font-semibold text-rose-600">
                        <AlertCircle className="h-3.5 w-3.5" /> Owing for {daysSince(c.first)} days, since {formatDate(c.first)}
                      </p>
                    )}
                    {c.entries.map((e) => (
                      <CreditRow key={e.id} entry={e} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
