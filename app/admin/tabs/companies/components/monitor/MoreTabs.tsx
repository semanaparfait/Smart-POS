"use client";

import { useState } from "react";
import { Bike, CalendarCheck, CircleAlert, Clock, Truck } from "lucide-react";
import { useOwnerData } from "@/stores/owner/api";
import type { AuditEntry, Order, Page } from "@/app/owner/types";
import { Badge, SearchInput, rwf, timeAgo, toNumber } from "@/app/owner/components/ui";
import { BOOKING_STATUS, UNIT_STATUS, kindMeta, priceMeta, type Booking, type Service, type Takings } from "@/app/owner/services/services";
import { AUDIT_ACTION, AUDIT_FIELD, shownValue } from "@/app/owner/inventory/stock";
import { orderNumber } from "@/app/owner/finance/money";
import { Choice, Empty, Loading, Panel, SmallButton, Stat, stamp, title, type CompanyDetails } from "./parts";

// ---------- Services & bookings ----------

export function ServicesTab({ companyId, now }: { companyId: string; now: number }) {
  const [view, setView] = useState<"bookings" | "services">("bookings");
  const [status, setStatus] = useState("ALL");
  const [range] = useState(() => {
    const from = new Date(now - 30 * 86_400_000);
    const to = new Date(now + 30 * 86_400_000);
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start.getTime() + 86_400_000);
    return { from: from.toISOString(), to: to.toISOString(), dayFrom: start.toISOString(), dayTo: end.toISOString() };
  });
  const services = useOwnerData<Service[]>(`/services?companyId=${companyId}`);
  const bookings = useOwnerData<Booking[]>(`/bookings?${new URLSearchParams({ from: range.from, to: range.to, companyId })}`);
  const takings = useOwnerData<Takings>(`/bookings/takings?${new URLSearchParams({ from: range.dayFrom, to: range.dayTo, companyId })}`);
  const list = (bookings.data ?? []).filter((b) => status === "ALL" || b.status === status);
  const unpaid = (bookings.data ?? []).filter((b) => b.status !== "CANCELLED" && b.balance > 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat icon={CalendarCheck} label="Taken today" value={rwf(toNumber(takings.data?.total) - toNumber(takings.data?.refunded))} hint={takings.data?.refunded ? `${rwf(takings.data.refunded)} refunded` : "No refunds"} />
        <Stat icon={Clock} label="In use now" value={String((bookings.data ?? []).filter((b) => b.status === "ACTIVE").length)} hint={`${(bookings.data ?? []).filter((b) => b.status === "RESERVED").length} reserved`} />
        <Stat icon={CircleAlert} label="Still to pay" value={rwf(unpaid.reduce((s, b) => s + b.balance, 0))} hint={`${unpaid.length} bookings`} tone={unpaid.length ? "text-rose-600" : undefined} />
        <Stat icon={CalendarCheck} label="Services" value={String(services.data?.length ?? 0)} hint={`${(services.data ?? []).reduce((s, x) => s + x.units.length, 0)} rooms, tables or items`} />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Choice value={view} onChange={setView} options={[{ value: "bookings", label: "Bookings, 30 days either side" }, { value: "services", label: "What they offer" }]} />
        {view === "bookings" && (
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-8 rounded-lg border border-ink/12 bg-white px-2 text-xs text-ink">
            <option value="ALL">Every status</option>
            {Object.entries(BOOKING_STATUS).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>
        )}
      </div>

      {view === "bookings" && (
        <Loading {...bookings}>
          {() => (
            <Panel heading={`Bookings · ${list.length}`} scroll>
              {[...list]
                .sort((a, b) => b.startAt.localeCompare(a.startAt))
                .map((b) => (
                  <li key={b.id} className="flex flex-wrap items-center gap-3 px-4 py-2.5 text-sm">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold text-ink">
                        {b.code} · {b.customerName}
                        {b.customerPhone ? ` · ${b.customerPhone}` : ""}
                      </span>
                      <span className="block truncate text-xs text-ink/55">
                        {b.service.name}
                        {b.unit ? ` · ${b.unit.name}` : ""} · {stamp(b.startAt)}
                        {b.endAt ? ` to ${stamp(b.endAt)}` : ""} · {b.people} people · by {b.takenBy?.name ?? "—"}
                        {b.cancelReason ? ` · “${b.cancelReason}”` : ""}
                      </span>
                    </span>
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${BOOKING_STATUS[b.status]?.cls ?? ""}`}>{BOOKING_STATUS[b.status]?.label ?? b.status}</span>
                    <span className="w-32 text-right text-xs">
                      <span className="block font-bold text-ink">{rwf(b.total)}</span>
                      <span className={b.balance > 0 ? "text-rose-600" : "text-ink/45"}>{b.balance > 0 ? `${rwf(b.balance)} to pay` : "Paid"}</span>
                    </span>
                  </li>
                ))}
              {!list.length && <Empty text="No bookings." />}
            </Panel>
          )}
        </Loading>
      )}

      {view === "services" && (
        <Loading {...services}>
          {(rows) => (
            <Panel heading={`What they offer · ${rows.length}`}>
              {rows.map((s) => (
                <li key={s.id} className="px-4 py-3 text-sm">
                  <p className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-semibold text-ink">
                      {s.name} <span className="text-xs font-normal text-ink/45">{kindMeta(s.kind).label}</span>
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="font-semibold text-ink">
                        {rwf(s.price)} {priceMeta(s.priceUnit).per}
                      </span>
                      <Badge tone={s.active ? "success" : "muted"}>{s.active ? "Offered" : "Off"}</Badge>
                    </span>
                  </p>
                  {!!s.units.length && (
                    <p className="mt-1.5 flex flex-wrap gap-1.5">
                      {s.units.map((u) => (
                        <span key={u.id} className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${UNIT_STATUS[u.status]?.cls ?? ""}`}>
                          {u.name} · {UNIT_STATUS[u.status]?.label ?? u.status}
                        </span>
                      ))}
                    </p>
                  )}
                </li>
              ))}
              {!rows.length && <Empty text="Nothing offered yet." />}
            </Panel>
          )}
        </Loading>
      )}
    </div>
  );
}

// ---------- Deliveries ----------

const DELIVERY_STATUS: Record<string, { label: string; tone: "lime" | "ink" | "success" | "danger" }> = {
  WAITING: { label: "Waiting", tone: "lime" },
  ON_THE_WAY: { label: "On the way", tone: "ink" },
  DELIVERED: { label: "Delivered", tone: "success" },
  NOT_DELIVERED: { label: "Not delivered", tone: "danger" },
};

export function DeliveriesTab({ companyId, orders, details }: { companyId: string; orders: Order[]; details: CompanyDetails }) {
  const riders = useOwnerData<{ id: string; name: string; phone: string }[]>(`/deliveries/riders?companyId=${companyId}`);
  const [status, setStatus] = useState("ALL");
  const all = orders.filter((o) => o.type === "DELIVERY");
  const list = all.filter((o) => status === "ALL" || o.deliveryStatus === status);
  const riderName = (o: Order) => o.rider?.employee?.name ?? o.rider?.name ?? o.outsideRider ?? "No rider yet";
  const fees = all.filter((o) => o.deliveryStatus === "DELIVERED").reduce((s, o) => s + toNumber(o.deliveryFee), 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Object.entries(DELIVERY_STATUS).map(([k, v]) => (
          <Stat key={k} icon={k === "ON_THE_WAY" ? Bike : Truck} label={v.label} value={String(all.filter((o) => o.deliveryStatus === k).length)} tone={k === "NOT_DELIVERED" && all.some((o) => o.deliveryStatus === k) ? "text-rose-600" : undefined} />
        ))}
      </div>
      <p className="text-xs text-ink/55">
        Delivery {details.deliveryEnabled ? "on" : "off"} · fee {rwf(details.deliveryFee)} · fees earned {rwf(fees)}
      </p>
      <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-8 rounded-lg border border-ink/12 bg-white px-2 text-xs text-ink">
        <option value="ALL">Every status</option>
        {Object.entries(DELIVERY_STATUS).map(([k, v]) => (
          <option key={k} value={k}>
            {v.label}
          </option>
        ))}
      </select>
      <Panel heading={`Deliveries · ${list.length}`} scroll>
        {list.map((o) => (
          <li key={o.id} className="flex flex-wrap items-center gap-3 px-4 py-2.5 text-sm">
            <span className="min-w-0 flex-1">
              <span className="block truncate font-semibold text-ink">
                {orderNumber(o)} · {o.customerName ?? "Customer"}
                {o.customerPhone ? ` · ${o.customerPhone}` : ""}
              </span>
              <span className="block truncate text-xs text-ink/55">
                {stamp(o.createdAt)} · {o.deliveryAddress ?? o.deliveryArea ?? "—"} · {riderName(o)}
                {o.payOnDelivery ? " · pays at the door" : ""}
                {o.deliveryProblem ? ` · Problem: ${o.deliveryProblem}` : ""}
              </span>
            </span>
            <Badge tone={DELIVERY_STATUS[o.deliveryStatus ?? ""]?.tone ?? "muted"}>{DELIVERY_STATUS[o.deliveryStatus ?? ""]?.label ?? "—"}</Badge>
            <span className="w-28 text-right font-bold text-ink">{rwf(o.total)}</span>
          </li>
        ))}
        {!list.length && <Empty text="No deliveries." />}
      </Panel>
      <Loading {...riders}>
        {(rows) => (
          <Panel heading={`Riders · ${rows.length}`}>
            {rows.map((r) => {
              const carried = all.filter((o) => o.rider?.id === r.id);
              return (
                <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 text-sm">
                  <span>
                    <span className="block font-semibold text-ink">{r.name}</span>
                    <span className="block text-xs text-ink/55">{r.phone}</span>
                  </span>
                  <span className="text-xs text-ink/60">
                    {carried.filter((o) => o.deliveryStatus === "DELIVERED").length} delivered · {carried.filter((o) => o.deliveryStatus === "ON_THE_WAY").length} on the way
                  </span>
                </li>
              );
            })}
            {!rows.length && <Empty text="No riders." />}
          </Panel>
        )}
      </Loading>
    </div>
  );
}

// ---------- Activity ----------

// Each kind of record, and how one of it is called in a change line.
const ONE: Record<string, string> = { products: "product", product_categories: "category", employees: "worker", employee_roles: "role", expenses: "expense", money_checks: "money check", staff_debts: "worker debt", salary_payments: "salary payment", services: "service", bookings: "booking", orders: "order", devices: "device", companies: "company details" };

const ENTITIES = [
  { value: "", label: "Everything" },
  { value: "products", label: "Products" },
  { value: "product_categories", label: "Categories" },
  { value: "employees", label: "Workers" },
  { value: "employee_roles", label: "Roles" },
  { value: "expenses", label: "Expenses" },
  { value: "money_checks", label: "Money checks" },
  { value: "staff_debts", label: "Worker debts" },
  { value: "salary_payments", label: "Salaries" },
  { value: "services", label: "Services" },
  { value: "bookings", label: "Bookings" },
  { value: "orders", label: "Orders" },
  { value: "devices", label: "Devices" },
  { value: "companies", label: "Company" },
];

type AuditRow = AuditEntry & { entityName?: string };

function changeLine(e: AuditRow) {
  if (!e.changes) return "";
  if (e.action !== "UPDATE") {
    const name = (e.changes as Record<string, unknown>).name ?? (e.changes as Record<string, unknown>).title;
    return name ? String(name) : "";
  }
  return Object.entries(e.changes)
    .filter(([k]) => k !== "updatedAt")
    .slice(0, 4)
    .map(([k, v]) => {
      const c = v as { from?: unknown; to?: unknown };
      return `${AUDIT_FIELD[k] ?? title(k)}: ${shownValue(c?.from)} → ${shownValue(c?.to)}`;
    })
    .join(" · ");
}

export function ActivityTab({ companyId, details }: { companyId: string; details: CompanyDetails }) {
  const [entity, setEntity] = useState("");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const log = useOwnerData<Page<AuditRow>>(`/audit-logs?${new URLSearchParams({ companyId, page: String(page), limit: "50", ...(entity ? { entityName: entity } : {}) })}`);
  const q = search.trim().toLowerCase();
  const activity = (details.recentActivity ?? []).filter((a) => !q || [a.action, a.user?.name, a.device.deviceName].some((v) => v?.toLowerCase().includes(q)));

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-xs font-bold text-ink/60">Changes to records</p>
          <select
            value={entity}
            onChange={(e) => {
              setEntity(e.target.value);
              setPage(1);
            }}
            className="h-8 rounded-lg border border-ink/12 bg-white px-2 text-xs text-ink"
          >
            {ENTITIES.map((e) => (
              <option key={e.value} value={e.value}>
                {e.label}
              </option>
            ))}
          </select>
        </div>
        <Loading {...log}>
          {(res) => (
            <>
              <Panel heading={`${res.total} changes · page ${res.page} of ${Math.max(1, Math.ceil(res.total / res.limit))}`}>
                {res.data.map((e) => (
                  <li key={e.id} className="px-4 py-2.5 text-sm">
                    <p className="flex flex-wrap justify-between gap-2">
                      <span className="font-semibold text-ink">
                        {AUDIT_ACTION[e.action] ?? title(e.action)} {e.entityName ? (ONE[e.entityName] ?? title(e.entityName).toLowerCase()) : ""}
                      </span>
                      <span className="text-xs text-ink/55">
                        {e.actor?.name ?? "System"} · {stamp(e.createdAt)}
                      </span>
                    </p>
                    {changeLine(e) && <p className="truncate text-xs text-ink/60">{changeLine(e)}</p>}
                  </li>
                ))}
                {!res.data.length && <Empty text="No changes." />}
              </Panel>
              <div className="flex gap-2">
                <SmallButton disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  Newer
                </SmallButton>
                <SmallButton disabled={page * res.limit >= res.total} onClick={() => setPage((p) => p + 1)}>
                  Older
                </SmallButton>
              </div>
            </>
          )}
        </Loading>
      </div>
      <div className="space-y-2">
        <SearchInput value={search} onChange={setSearch} placeholder="Search device activity" />
        <Panel heading={`On the devices · latest ${details.recentActivity?.length ?? 0}`}>
          {activity.map((a) => (
            <li key={a.id} className="px-4 py-2.5 text-sm">
              <p className="flex justify-between gap-2">
                <span className="truncate font-semibold text-ink">{title(a.action)}</span>
                {a.statusCode !== null && <span className={`font-mono text-[11px] ${a.statusCode >= 400 ? "text-rose-600" : "text-emerald-700"}`}>{a.statusCode}</span>}
              </p>
              <p className="text-xs text-ink/55">
                {a.user?.name ?? "—"} · {a.device.deviceName} · {timeAgo(a.createdAt)}
              </p>
            </li>
          ))}
          {!activity.length && <Empty text="No activity." />}
        </Panel>
      </div>
    </div>
  );
}

// ---------- Settings ----------

export function SettingsTab({ details }: { details: CompanyDetails }) {
  const f = details.features ?? {};
  const rows: [string, string][] = [
    ["Tax number (TIN)", details.tin || "Not set"],
    ["Hold a booking for", details.maxHoldMinutes ? `${details.maxHoldMinutes} minutes` : "Default (1 hour)"],
    ["Delivery", f.delivery === false ? "Not given by SmartPOS" : details.deliveryEnabled ? "On" : "Off"],
    ["Delivery fee", rwf(details.deliveryFee)],
    ["Own riders", details.deliveryRiders ? "Yes" : "No"],
    ["Kitchen screen", f.kitchen === false ? "Not given by SmartPOS" : details.kitchenEnabled ? "On" : "Off"],
    ["Services & bookings", f.services === false ? "Not given by SmartPOS" : "Given"],
  ];
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Panel heading="Company settings, as the owner set them">
        {rows.map(([k, v]) => (
          <li key={k} className="flex justify-between gap-3 px-4 py-2.5 text-sm">
            <span className="text-ink/65">{k}</span>
            <span className="text-right font-semibold text-ink">{v}</span>
          </li>
        ))}
      </Panel>
      <Panel heading={`Delivery areas · ${details.deliveryAreas?.length ?? 0}`}>
        {(details.deliveryAreas ?? []).map((a) => (
          <li key={a.name} className="flex justify-between gap-3 px-4 py-2.5 text-sm">
            <span className="text-ink">{a.name}</span>
            <span className="font-semibold text-ink">{rwf(a.fee)}</span>
          </li>
        ))}
        {!details.deliveryAreas?.length && <Empty text="No areas, one fee for everywhere." />}
      </Panel>
    </div>
  );
}
