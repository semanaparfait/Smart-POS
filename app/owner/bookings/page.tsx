"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { BedDouble, CalendarDays, Plus, RotateCw, Settings2, Wrench, Check } from "lucide-react";
import useAuthStore from "@/stores/auth/authstore";
import { everyWhileVisible, ownerRequest, useOwnerData } from "@/stores/owner/api";
import { Card, EmptyState, ErrorState, PageHeader, Skeleton, Tabs, rwf, toNumber } from "@/app/owner/components/ui";
import { Button, LinkButton, TextInput, todayKey } from "@/app/owner/components/forms";
import FeatureOff from "@/app/owner/components/FeatureOff";
import {
  BOOKINGS,
  BOOKING_STATUS,
  SERVICES,
  UNIT_STATUS,
  dateKey,
  dayRange,
  elapsed,
  kindMeta,
  priceMeta,
  runningTotal,
  sameDay,
  timeOf,
  type Booking,
  type Service,
  type ServiceUnit,
  type Takings,
} from "@/app/owner/services/services";
import { useNow } from "@/app/owner/bookings/useNow";

const REFRESH_MS = 60_000;
type Filter = "all" | "RESERVED" | "ACTIVE" | "COMPLETED" | "owing" | "CANCELLED";
const newBooking = (serviceId?: string, unitId?: string) =>
  `${BOOKINGS}/new${serviceId ? `?service=${serviceId}${unitId ? `&unit=${unitId}` : ""}` : ""}`;

function UnitTile({ unit, active, next, now, service, onStatus }: { unit: ServiceUnit; active?: Booking; next?: Booking; now: Date; service: Service; onStatus: (s: ServiceUnit["status"]) => void }) {
  const status = UNIT_STATUS[unit.status];
  const inUse = unit.status === "OCCUPIED" && active;
  const href = active ? `${BOOKINGS}/${active.id}` : unit.status === "AVAILABLE" ? newBooking(service.id, unit.id) : next ? `${BOOKINGS}/${next.id}` : null;
  const body = (
    <>
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-sm font-bold text-ink">{unit.name}</span>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${status.cls}`}>{status.label}</span>
      </div>
      {inUse ? (
        <>
          <p className="mt-1 truncate text-xs text-ink/70">{active!.customerName}</p>
          <p className="text-xs font-semibold text-ink">
            {elapsed(active!.checkedInAt ?? active!.startAt, now)} · {rwf(runningTotal(active!, now).total)}
          </p>
        </>
      ) : next ? (
        <p className="mt-1 truncate text-xs text-ink/60">
          Next: {sameDay(next.startAt, now) ? timeOf(next.startAt) : dateKey(next.startAt)} · {next.customerName}
        </p>
      ) : (
        <p className="mt-1 text-xs text-ink/45">{unit.status === "AVAILABLE" ? "Click to book" : ""}</p>
      )}
    </>
  );
  return (
    <div className={`rounded-xl p-3 ring-1 ring-inset ${inUse ? "bg-lime/25 ring-lime" : "bg-white ring-ink/10"}`}>
      {href ? (
        <Link href={href} className="block hover:opacity-80">
          {body}
        </Link>
      ) : (
        body
      )}
      {!inUse && (
        <div className="mt-2 flex justify-end">
          {unit.status === "AVAILABLE" ? (
            <button type="button" onClick={() => onStatus("MAINTENANCE")} className="inline-flex items-center gap-1 text-[11px] font-semibold text-ink/45 hover:text-ink">
              <Wrench className="h-3 w-3" /> Maintenance
            </button>
          ) : (
            unit.status !== "OCCUPIED" && (
              <button type="button" onClick={() => onStatus("AVAILABLE")} className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:underline">
                <Check className="h-3 w-3" /> Mark free
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}

function ServiceCard({ service, bookings, now, onStatus }: { service: Service; bookings: Booking[]; now: Date; onStatus: (u: ServiceUnit, s: ServiceUnit["status"]) => void }) {
  const mine = bookings.filter((b) => b.service.id === service.id);
  const running = mine.filter((b) => b.status === "ACTIVE");
  const upcoming = mine.filter((b) => b.status === "RESERVED").sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
  const free = service.units.filter((u) => u.status === "AVAILABLE").length;
  const unitless = [...running, ...upcoming.filter((b) => sameDay(b.startAt, now))];
  return (
    <Card>
      <div className="flex items-center gap-3 border-b border-ink/6 px-5 py-4">
        <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-ivory ring-1 ring-ink/10">
          {service.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- the API's storage
            <img loading="lazy" decoding="async" src={service.imageUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <BedDouble className="h-4.5 w-4.5 text-ink/40" />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-bold text-ink">{service.name}</p>
          <p className="text-xs text-ink/55">
            {kindMeta(service.kind).label} · {rwf(service.price)} {priceMeta(service.priceUnit).per}
            {service.units.length ? ` · ${free}/${service.units.length} free` : ""}
            {running.length ? ` · ${running.length} in use` : ""}
          </p>
        </div>
        <LinkButton small icon={Plus} href={newBooking(service.id)}>
          Book
        </LinkButton>
      </div>
      {service.units.length > 0 ? (
        <div className="grid grid-cols-2 gap-2 p-4 sm:grid-cols-3 lg:grid-cols-4">
          {service.units.map((unit) => (
            <UnitTile
              key={unit.id}
              unit={unit}
              service={service}
              active={running.find((b) => b.unit?.id === unit.id)}
              next={upcoming.find((b) => b.unit?.id === unit.id)}
              now={now}
              onStatus={(s) => onStatus(unit, s)}
            />
          ))}
        </div>
      ) : (
        unitless.length > 0 && (
          <ul className="divide-y divide-ink/6">
            {unitless.map((b) => (
              <li key={b.id}>
                <Link href={`${BOOKINGS}/${b.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-ivory/60">
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold text-ink">{b.customerName}</span>
                  <span className="text-xs text-ink/55">
                    {b.status === "ACTIVE" ? elapsed(b.checkedInAt ?? b.startAt, now) : `At ${timeOf(b.startAt)}`} · {b.people} people
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )
      )}
    </Card>
  );
}

// The services desk: what is in use right now, what is booked, and what is owed.
export default function OwnerBookings() {
  const on = useAuthStore((s) => s.user?.company?.features?.services !== false);
  const now = useNow();
  const [tab, setTab] = useState<"now" | "bookings">("now");
  const [day, setDay] = useState(todayKey());
  const [filter, setFilter] = useState<Filter>("all");
  const { from, to } = dayRange(day);
  const today = dayRange(todayKey());
  const services = useOwnerData<Service[]>(on ? "/services" : null);
  const bookings = useOwnerData<Booking[]>(on ? `/bookings?${new URLSearchParams({ from: from.toISOString(), to: to.toISOString() })}` : null);
  const takings = useOwnerData<Takings>(on ? `/bookings/takings?${new URLSearchParams({ from: today.from.toISOString(), to: today.to.toISOString() })}` : null);
  const reloadAll = () => {
    services.reload();
    bookings.reload();
    takings.reload();
  };

  // The desk keeps itself up to date.
  useEffect(() => {
    if (!on) return;
    return everyWhileVisible(reloadAll, REFRESH_MS);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [on, day]);

  const list = useMemo(() => bookings.data ?? [], [bookings.data]);
  const offered = useMemo(() => (services.data ?? []).filter((s) => s.active), [services.data]);
  const listed = useMemo(
    () =>
      list
        .filter((b) => b.status === "ACTIVE" || sameDay(b.checkedInAt ?? b.startAt, `${day}T12:00:00`))
        .filter((b) => (filter === "all" ? true : filter === "owing" ? b.status !== "CANCELLED" && runningTotal(b, now).total - b.paid > 0 : b.status === filter))
        .sort((a, b) => new Date(a.checkedInAt ?? a.startAt).getTime() - new Date(b.checkedInAt ?? b.startAt).getTime()),
    [list, day, filter, now],
  );

  if (!on) return <FeatureOff feature="Services" />;
  if (services.error) return <ErrorState message={services.error} onRetry={reloadAll} />;

  const units = offered.flatMap((s) => s.units);
  const inUse = list.filter((b) => b.status === "ACTIVE");
  const reservedToday = list.filter((b) => b.status === "RESERVED" && sameDay(b.startAt, now));
  const owing = list.filter((b) => b.status === "COMPLETED" && b.balance > 0).reduce((sum, b) => sum + b.balance, 0);

  const changeStatus = async (unit: ServiceUnit, status: ServiceUnit["status"]) => {
    try {
      await ownerRequest(`/service-units/${unit.id}`, { method: "PATCH", body: JSON.stringify({ status }) });
      toast.success(`${unit.name}: ${UNIT_STATUS[status].label}`);
      services.reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Services"
        title="Services & bookings"
        description="Who is using what, what is booked, and what is still owed."
        actions={
          <>
            <Button tone="outline" icon={RotateCw} onClick={reloadAll}>
              Refresh
            </Button>
            <LinkButton tone="outline" icon={Settings2} href={SERVICES}>
              What you offer
            </LinkButton>
            <LinkButton icon={Plus} href={newBooking()}>
              New booking
            </LinkButton>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {[
          { label: "In use now", value: inUse.length.toLocaleString() },
          { label: "Free now", value: units.length ? `${units.filter((u) => u.status === "AVAILABLE").length}/${units.length}` : "—" },
          { label: "Booked for today", value: reservedToday.length.toLocaleString() },
          { label: "Taken today", value: takings.data ? rwf(takings.data.total) : "—" },
          { label: "Still owed", value: rwf(owing), danger: owing > 0 },
        ].map((k) => (
          <div key={k.label} className="rounded-2xl border border-ink/10 bg-white p-5">
            <p className="text-xs font-semibold text-ink/55">{k.label}</p>
            <p className={`mt-2 truncate text-2xl font-extrabold ${k.danger ? "text-rose-600" : "text-ink"}`}>{k.value}</p>
          </div>
        ))}
      </div>

      <Tabs
        options={[
          { value: "now", label: "Right now" },
          { value: "bookings", label: "Bookings" },
        ]}
        value={tab}
        onChange={setTab}
      />

      {services.loading && !services.data ? (
        <Skeleton className="h-64" />
      ) : tab === "now" ? (
        offered.length ? (
          <div className="space-y-4">
            {offered.map((s) => (
              <ServiceCard key={s.id} service={s} bookings={list} now={now} onStatus={changeStatus} />
            ))}
          </div>
        ) : (
          <Card>
            <EmptyState icon={BedDouble} title="No services yet" text="Add your rooms, halls, games, tickets or rentals to start taking bookings." />
            <div className="pb-6 text-center">
              <LinkButton icon={Plus} href={`${SERVICES}/new`}>
                Add a service
              </LinkButton>
            </div>
          </Card>
        )
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <TextInput type="date" value={day} onChange={(e) => setDay(e.target.value || todayKey())} className="h-10 w-44" aria-label="Day" />
            <Tabs
              options={[
                { value: "all", label: "All" },
                { value: "RESERVED", label: "Reserved" },
                { value: "ACTIVE", label: "In use" },
                { value: "COMPLETED", label: "Done" },
                { value: "owing", label: "Still owed" },
                { value: "CANCELLED", label: "Cancelled" },
              ]}
              value={filter}
              onChange={setFilter}
            />
          </div>
          <Card>
            {listed.length === 0 ? (
              <EmptyState icon={CalendarDays} title="No bookings" text="Try another day or filter." />
            ) : (
              <ul className="divide-y divide-ink/6">
                {listed.map((b) => {
                  const total = runningTotal(b, now).total;
                  const owed = b.status === "CANCELLED" ? 0 : Math.round((total - b.paid) * 100) / 100;
                  return (
                    <li key={b.id}>
                      <Link href={`${BOOKINGS}/${b.id}`} className="flex flex-wrap items-center gap-4 px-5 py-3.5 hover:bg-ivory/60">
                        <span className="w-14 text-sm font-semibold text-ink">{timeOf(b.checkedInAt ?? b.startAt)}</span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-ink">{b.customerName}</p>
                          <p className="truncate text-xs text-ink/55">
                            {b.service.name}
                            {b.unit ? ` · ${b.unit.name}` : ""} · {b.people} people · {b.code}
                          </p>
                        </div>
                        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${BOOKING_STATUS[b.status].cls}`}>{BOOKING_STATUS[b.status].label}</span>
                        <span className="w-32 text-right">
                          <span className="block text-sm font-bold text-ink">{rwf(total)}</span>
                          {owed > 0 && <span className="block text-[11px] font-semibold text-rose-600">Owes {rwf(owed)}</span>}
                          {toNumber(b.refunded) > 0 && <span className="block text-[11px] text-ink/45">Refunded {rwf(b.refunded)}</span>}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
