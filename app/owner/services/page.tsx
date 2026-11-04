"use client";

import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { BedDouble, CalendarCheck, Pencil, Plus, Power, Trash2 } from "lucide-react";
import useAuthStore from "@/stores/auth/authstore";
import { ownerRequest, useOwnerData } from "@/stores/owner/api";
import { Card, EmptyState, ErrorState, PageHeader, Skeleton, Tabs, rwf, toNumber } from "@/app/owner/components/ui";
import { Button, LinkButton } from "@/app/owner/components/forms";
import FeatureOff from "@/app/owner/components/FeatureOff";
import { BOOKINGS, SERVICES, SERVICE_KINDS, kindMeta, priceMeta, type Service } from "@/app/owner/services/services";

function ServiceRow({ service, onChanged }: { service: Service; onChanged: () => void }) {
  const [busy, setBusy] = useState<string | null>(null);
  const run = async (key: string, work: () => Promise<unknown>, done: string) => {
    setBusy(key);
    try {
      await work();
      toast.success(done);
      onChanged();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update");
    } finally {
      setBusy(null);
    }
  };
  const toggle = () => {
    const form = new FormData();
    form.append("active", String(!service.active));
    return run("active", () => ownerRequest(`/services/${service.id}`, { method: "PATCH", body: form }), `${service.active ? "Service turned off" : "Service turned on"}: ${service.name}`);
  };
  return (
    <li className={`flex flex-wrap items-center gap-4 px-5 py-4 ${service.active ? "" : "opacity-55"}`}>
      <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-ivory ring-1 ring-ink/10">
        {service.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- the API's storage
          <img src={service.imageUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <BedDouble className="h-5 w-5 text-ink/40" />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-bold text-ink">
          {service.name} <span className="ml-1 text-xs font-semibold text-ink/45">{kindMeta(service.kind).label}</span>
        </p>
        <p className="text-sm text-ink/70">
          {rwf(service.price)} {priceMeta(service.priceUnit).per}
        </p>
        <p className="truncate text-xs text-ink/55">
          {service.units.length
            ? `${service.units.length} ${service.units.length === 1 ? "unit" : "units"}: ${service.units
                .slice(0, 4)
                .map((u) => u.name)
                .join(", ")}${service.units.length > 4 ? "…" : ""}`
            : "No units: sold without choosing one"}
        </p>
        {(!!service.capacity || toNumber(service.deposit) > 0) && (
          <p className="text-xs text-ink/55">
            {service.capacity ? `Up to ${service.capacity} people` : ""}
            {service.capacity && toNumber(service.deposit) > 0 ? " · " : ""}
            {toNumber(service.deposit) > 0 ? `Deposit ${rwf(service.deposit)}` : ""}
          </p>
        )}
      </div>
      <div className="flex gap-1">
        <LinkButton small tone="outline" icon={Pencil} href={`${SERVICES}/${service.id}`}>
          Edit
        </LinkButton>
        <Button small tone="quiet" icon={Power} busy={busy === "active"} onClick={toggle}>
          {service.active ? "Turn off" : "Turn on"}
        </Button>
        <Button small tone="quiet" icon={Trash2} busy={busy === "delete"} onClick={() => run("delete", () => ownerRequest(`/services/${service.id}`, { method: "DELETE" }), `Service deleted: ${service.name}`)}>
          Delete
        </Button>
      </div>
    </li>
  );
}

// Everything the company offers besides products: rooms, halls, games, tickets,
// rentals. Each has its price and the units that can be booked.
export default function ServicesSetup() {
  const on = useAuthStore((s) => s.user?.company?.features?.services !== false);
  const { data, loading, error, reload } = useOwnerData<Service[]>(on ? "/services" : null);
  const [kind, setKind] = useState("all");
  const services = useMemo(() => data ?? [], [data]);
  const kinds = useMemo(() => [{ value: "all", label: "All" }, ...SERVICE_KINDS.filter((k) => services.some((s) => s.kind === k.value)).map((k) => ({ value: k.value, label: k.label }))], [services]);

  if (!on) return <FeatureOff feature="Services" />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  const shown = services.filter((s) => kind === "all" || s.kind === kind);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Services"
        title="What you offer"
        description="Rooms, halls, games, tickets and rentals: their prices and what can be booked."
        actions={
          <>
            <LinkButton tone="outline" icon={CalendarCheck} href={BOOKINGS}>
              Bookings
            </LinkButton>
            <LinkButton icon={Plus} href={`${SERVICES}/new`}>
              Add a service
            </LinkButton>
          </>
        }
      />
      {services.length > 0 && <Tabs options={kinds} value={kind} onChange={setKind} />}
      <Card>
        {loading && !data ? (
          <div className="space-y-2 p-5">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
        ) : shown.length === 0 ? (
          <EmptyState icon={BedDouble} title="No services yet" text="Add your rooms, halls, games, tickets or rentals to start taking bookings." />
        ) : (
          <ul className="divide-y divide-ink/6">
            {shown.map((s) => (
              <ServiceRow key={s.id} service={s} onChanged={reload} />
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
