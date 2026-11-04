"use client";

import { useState } from "react";
import { AlertTriangle, Banknote, MonitorSmartphone, Package, Receipt, RotateCw, Scale, Trophy, Users, Wallet } from "lucide-react";
import { useOwnerData } from "@/stores/owner/api";
import type { Order, Product } from "@/app/owner/types";
import { Skeleton, Tabs, dayKey, rwf, toNumber } from "@/app/owner/components/ui";
import { paidAt, type Expense } from "@/app/owner/finance/money";
import type { Worker } from "@/app/owner/salaries/payroll";
import { formatStock } from "@/app/owner/inventory/stock";
import { ORDER_STATUS, Panel, Stat, Empty, title, type CompanyDetails } from "./monitor/parts";
import OrdersTab from "./monitor/OrdersTab";
import { DevicesTab, WorkersTab } from "./monitor/PeopleTabs";
import { ProductsTab, StockTab } from "./monitor/StockTabs";
import MoneyTab, { type MoneyCheck } from "./monitor/MoneyTab";
import { ActivityTab, DeliveriesTab, ServicesTab, SettingsTab } from "./monitor/MoreTabs";

type Tab = "overview" | "orders" | "deliveries" | "services" | "workers" | "devices" | "products" | "stock" | "money" | "activity" | "settings";

// Everything in one company, for the super admin: what its owner sees in the
// app and on the website, plus turning workers and devices on or off.
export default function CompanyMonitor({ companyId }: { companyId: string }) {
  const q = `companyId=${encodeURIComponent(companyId)}`;
  const details = useOwnerData<CompanyDetails>(`/companies/${companyId}`);
  const orders = useOwnerData<Order[]>(`/orders?${q}`);
  const expenses = useOwnerData<Expense[]>(`/expenses?${q}`);
  const checks = useOwnerData<MoneyCheck[]>(`/money-checks?${q}`);
  const staff = useOwnerData<Worker[]>(`/staff-debts?${q}`);
  const products = useOwnerData<Product[]>(`/products?${q}`);
  const lowStock = useOwnerData<Product[]>(`/products/low-stock?${q}`);
  const [tab, setTab] = useState<Tab>("overview");
  // Tabs that load their own lists start again on Refresh.
  const [round, setRound] = useState(0);
  const [now] = useState(() => Date.now());

  const reload = () => {
    [details, orders, expenses, checks, staff, products, lowStock].forEach((d) => d.reload());
    setRound((r) => r + 1);
  };

  const all = [...(orders.data ?? [])].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const today = dayKey(new Date(now));
  const month = today.slice(0, 7);
  const paid = all.filter((o) => o.status === "COMPLETED");
  const paidOn = (prefix: string) => paid.filter((o) => dayKey(new Date(paidAt(o))).startsWith(prefix));
  const sum = (list: Order[]) => list.reduce((s, o) => s + toNumber(o.total), 0);
  const credit = paid.reduce((s, o) => s + (o.payments ?? []).filter((p) => String(p.method).toUpperCase() === "CREDIT").reduce((t, p) => t + toNumber(p.amount), 0), 0);
  const checkList = checks.data ?? [];
  const flagged = checkList.filter((c) => c.status === "FLAGGED");
  const shortTotal = checkList.reduce((s, c) => s + Math.max(0, -toNumber(c.difference)), 0);
  const d = details.data;
  const st = d?.stats;
  const f = d?.features ?? {};
  const services = !!f.services;
  const delivery = !!f.delivery || !!d?.deliveryEnabled;

  // Best sellers and staff this month, from the paid orders.
  const monthPaid = paidOn(month);
  const byProduct = new Map<string, { name: string; qty: number; total: number }>();
  const byStaff = new Map<string, { name: string; count: number; total: number }>();
  for (const o of monthPaid) {
    for (const i of o.items ?? []) {
      const key = i.product?.id ?? i.id;
      const row = byProduct.get(key) ?? { name: i.product?.name ?? "Item", qty: 0, total: 0 };
      byProduct.set(key, { ...row, qty: row.qty + i.quantity, total: row.total + toNumber(i.totalPrice) });
    }
    const who = o.user?.id ?? "none";
    const row = byStaff.get(who) ?? { name: o.user?.employee?.name ?? o.user?.name ?? "—", count: 0, total: 0 };
    byStaff.set(who, { ...row, count: row.count + 1, total: row.total + toNumber(o.total) });
  }
  const topProducts = [...byProduct.values()].sort((a, b) => b.total - a.total).slice(0, 6);
  const topStaff = [...byStaff.values()].sort((a, b) => b.total - a.total).slice(0, 6);

  const tabs: { value: Tab; label: string; count?: number }[] = [
    { value: "overview", label: "Overview" },
    { value: "orders", label: "Orders", count: all.length },
    ...(delivery ? [{ value: "deliveries" as const, label: "Deliveries", count: all.filter((o) => o.type === "DELIVERY").length }] : []),
    ...(services ? [{ value: "services" as const, label: "Bookings" }] : []),
    { value: "workers", label: "Workers", count: d?.employees.length },
    { value: "devices", label: "Devices", count: d?.devices.length },
    { value: "products", label: "Products", count: products.data?.length },
    { value: "stock", label: "Stock" },
    { value: "money", label: "Money" },
    { value: "activity", label: "Activity" },
    { value: "settings", label: "Settings" },
  ];

  const waiting = <Skeleton className="h-40" />;

  return (
    <section className="rounded-2xl border border-ink/12 bg-white shadow-xs">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/6 px-6 py-4">
        <div>
          <h2 className="text-sm font-bold text-ink">Everything in this company</h2>
          <p className="mt-0.5 text-xs text-ink/60">Live from the company&apos;s tills, as its owner sees it.</p>
        </div>
        <button type="button" onClick={reload} className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold text-ink/70 ring-1 ring-inset ring-ink/12 hover:bg-ivory">
          <RotateCw className="h-3.5 w-3.5" /> Refresh
        </button>
      </header>
      <div className="space-y-4 p-5">
        <div className="overflow-x-auto">
          <Tabs options={tabs} value={tab} onChange={setTab} />
        </div>

        {details.error && !d && (
          <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {details.error}{" "}
            <button type="button" onClick={reload} className="font-semibold underline">
              Try again
            </button>
          </p>
        )}

        {tab === "overview" &&
          (orders.loading && !orders.data ? (
            waiting
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <Stat icon={Banknote} label="Sales today" value={rwf(sum(paidOn(today)))} hint={`${paidOn(today).length} paid orders`} />
                <Stat icon={Receipt} label="Sales this month" value={rwf(sum(monthPaid))} hint={`${all.filter((o) => o.status === "PENDING").length} orders not paid yet`} />
                <Stat icon={Banknote} label="All-time sales" value={rwf(sum(paid))} hint={`${paid.length} paid orders`} />
                <Stat icon={Wallet} label="On credit" value={rwf(credit)} hint="Owed by customers" tone={credit ? "text-rose-600" : undefined} />
                <Stat icon={Users} label="Workers" value={String(st?.employees ?? d?.employees.length ?? 0)} hint={`${st?.activeUsers ?? 0} of ${st?.users ?? 0} accounts active`} />
                <Stat icon={MonitorSmartphone} label="Devices online" value={`${st?.onlineDevices ?? 0} / ${st?.devices ?? 0}`} hint={`${st?.devicesInUse ?? 0} in use now`} />
                <Stat icon={Package} label="Products" value={String(st?.products ?? products.data?.length ?? 0)} hint={`${st?.activeProducts ?? 0} active · ${(lowStock.data ?? []).length} running low`} />
                <Stat icon={Scale} label="Money checks" value={`${checkList.length} checked`} hint={flagged.length ? `${flagged.length} flagged · ${rwf(shortTotal)} short` : "None flagged"} tone={flagged.length ? "text-rose-600" : undefined} />
              </div>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <Panel heading="Best sellers this month">
                  {topProducts.map((p) => (
                    <li key={p.name} className="flex justify-between gap-3 px-4 py-2 text-sm">
                      <span className="truncate text-ink">
                        {p.name} <span className="text-xs text-ink/45">× {p.qty}</span>
                      </span>
                      <span className="font-semibold text-ink">{rwf(p.total)}</span>
                    </li>
                  ))}
                  {!topProducts.length && <Empty text="Nothing sold this month." />}
                </Panel>
                <Panel heading="Staff this month">
                  {topStaff.map((s, i) => (
                    <li key={s.name + i} className="flex items-center justify-between gap-3 px-4 py-2 text-sm">
                      <span className="flex items-center gap-1.5 truncate text-ink">
                        {i === 0 && <Trophy className="h-3.5 w-3.5 text-ink/60" />}
                        {s.name} <span className="text-xs text-ink/45">{s.count} sales</span>
                      </span>
                      <span className="font-semibold text-ink">{rwf(s.total)}</span>
                    </li>
                  ))}
                  {!topStaff.length && <Empty text="No sales this month." />}
                </Panel>
                <Panel heading="Orders by status, all time">
                  {Object.entries(st?.orders ?? {}).map(([status, v]) => (
                    <li key={status} className="flex justify-between px-4 py-2 text-sm">
                      <span className="text-ink/70">{ORDER_STATUS[status]?.label ?? title(status)}</span>
                      <span className="font-semibold text-ink">
                        {v.count} · {rwf(v.total)}
                      </span>
                    </li>
                  ))}
                  {!Object.keys(st?.orders ?? {}).length && <Empty text="No orders yet." />}
                </Panel>
                <Panel heading="Running low">
                  {(lowStock.data ?? []).slice(0, 6).map((p) => (
                    <li key={p.id} className="flex items-center gap-2 px-4 py-2 text-sm">
                      <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />
                      <span className="flex-1 truncate text-ink">{p.name}</span>
                      <span className="font-semibold text-ink">{formatStock(p.stockQuantity, p)}</span>
                    </li>
                  ))}
                  {!(lowStock.data ?? []).length && <Empty text="Stock looks good." />}
                </Panel>
              </div>
            </div>
          ))}

        {tab === "orders" && (orders.loading && !orders.data ? waiting : <OrdersTab orders={all} now={now} companyName={d?.name ?? "company"} />)}
        {tab === "deliveries" && d && <DeliveriesTab key={round} companyId={companyId} orders={all} details={d} />}
        {tab === "services" && <ServicesTab key={round} companyId={companyId} now={now} />}
        {tab === "workers" && (d ? <WorkersTab key={round} companyId={companyId} details={d} orders={all} onChanged={details.reload} /> : waiting)}
        {tab === "devices" && (d ? <DevicesTab details={d} onChanged={details.reload} /> : waiting)}
        {tab === "products" && ((products.loading && !products.data) || !d ? waiting : <ProductsTab products={products.data ?? []} details={d} />)}
        {tab === "stock" && <StockTab key={round} companyId={companyId} />}
        {tab === "money" &&
          ([orders, expenses, checks, staff].some((x) => x.loading && !x.data) ? (
            waiting
          ) : (
            <MoneyTab key={round} companyId={companyId} orders={all} expenses={expenses.data ?? []} checks={checkList} staff={staff.data ?? []} now={now} services={services} />
          ))}
        {tab === "activity" && (d ? <ActivityTab key={round} companyId={companyId} details={d} /> : waiting)}
        {tab === "settings" && (d ? <SettingsTab details={d} /> : waiting)}
      </div>
    </section>
  );
}
