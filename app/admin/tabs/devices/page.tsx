"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  Ban,
  BellRing,
  Check,
  Clock3,
  LayoutGrid,
  List,
  Loader2,
  MonitorSmartphone,
  RotateCw,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";
import useDeviceStore, { type RegistrationAction } from "@/stores/device/devicestore";
import { RegistrationStatusEnum, type DeviceType } from "@/stores/device/devicetypes";
import FetchDevices, {
  CompanyBadge,
  DeviceSkeleton,
  formatDate,
  isAwaiting,
  platformOf,
} from "@/app/admin/tabs/devices/components/FetchDevices";

type LoadState = "loading" | "ready" | "error";
type StatusFilter = "" | "awaiting" | RegistrationStatusEnum.REGISTERED | RegistrationStatusEnum.DISABLED | RegistrationStatusEnum.REJECTED;
type SortKey = "newest" | "oldest" | "name";

const time = (d: DeviceType) => new Date(d.createdAt).getTime() || 0;

export default function DevicesPage() {
  const devices = useDeviceStore((s) => s.devices);
  const fetchDevices = useDeviceStore((s) => s.fetchDevices);
  const registerDevice = useDeviceStore((s) => s.registerDevice);

  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("");
  const [company, setCompany] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");
  const [layout, setLayout] = useState<"grid" | "list">("grid");
  const [busy, setBusy] = useState<{ id: string; action: RegistrationAction } | null>(null);

  const request = useCallback(
    () =>
      fetchDevices()
        .then(() => setLoadState("ready"))
        .catch(() => setLoadState("error")),
    [fetchDevices],
  );

  // Initial state is already "loading"
  useEffect(() => {
    request();
  }, [request]);

  const reload = () => {
    setLoadState("loading");
    request();
  };

  const decide = async (device: DeviceType, action: RegistrationAction) => {
    setBusy({ id: device.id, action });
    try {
      await registerDevice(device.id, action);
      toast.success(`${device.deviceName || "Device"} ${action === "APPROVE" ? "approved" : "rejected"}`);
      await fetchDevices();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update the device");
    } finally {
      setBusy(null);
    }
  };

  const awaiting = useMemo(
    () => devices.filter((d) => isAwaiting(d.registrationStatus)).sort((a, b) => time(a) - time(b)),
    [devices],
  );

  const stats = useMemo(() => {
    const count = (s: string) => devices.filter((d) => d.registrationStatus === s).length;
    return [
      { label: "Total devices", value: devices.length, icon: MonitorSmartphone },
      { label: "Registered", value: count(RegistrationStatusEnum.REGISTERED), icon: ShieldCheck },
      { label: "Awaiting approval", value: awaiting.length, icon: Clock3, highlight: awaiting.length > 0 },
      { label: "Disabled", value: count(RegistrationStatusEnum.DISABLED), icon: Ban },
    ];
  }, [devices, awaiting.length]);

  const statusChips: { key: StatusFilter; label: string; count: number }[] = [
    { key: "", label: "All", count: devices.length },
    { key: RegistrationStatusEnum.REGISTERED, label: "Registered", count: devices.filter((d) => d.registrationStatus === RegistrationStatusEnum.REGISTERED).length },
    { key: "awaiting", label: "Awaiting approval", count: awaiting.length },
    { key: RegistrationStatusEnum.DISABLED, label: "Disabled", count: devices.filter((d) => d.registrationStatus === RegistrationStatusEnum.DISABLED).length },
    { key: RegistrationStatusEnum.REJECTED, label: "Rejected", count: devices.filter((d) => d.registrationStatus === RegistrationStatusEnum.REJECTED).length },
  ];

  // Businesses that actually have devices
  const companies = useMemo(() => {
    const map = new Map<string, string>();
    devices.forEach((d) => d.company?.id && map.set(d.company.id, d.company.name));
    return [...map].sort((a, b) => a[1].localeCompare(b[1]));
  }, [devices]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return devices
      .filter((d) => {
        const matchesSearch =
          !q ||
          [d.deviceName, d.deviceId, d.deviceOs, d.company?.name, d.company?.location, d.company?.code].some((v) =>
            v?.toLowerCase().includes(q),
          );
        const matchesStatus =
          !status || (status === "awaiting" ? isAwaiting(d.registrationStatus) : d.registrationStatus === status);
        const matchesCompany = !company || d.company?.id === company;
        return matchesSearch && matchesStatus && matchesCompany;
      })
      .sort((a, b) =>
        sort === "name"
          ? (a.deviceName ?? "").localeCompare(b.deviceName ?? "")
          : sort === "newest"
            ? time(b) - time(a)
            : time(a) - time(b),
      );
  }, [devices, search, status, company, sort]);

  const hasFilters = Boolean(search || status || company);
  const clearFilters = () => {
    setSearch("");
    setStatus("");
    setCompany("");
  };

  const control =
    "h-10 rounded-lg border border-ink/12 bg-white text-sm text-ink/80 outline-none transition hover:border-ink/25 focus:border-ink/40 focus:ring-4 focus:ring-lime/40";

  return (
    <main className="space-y-6">
      {/* Header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-[-0.02em] text-ink">POS devices</h1>
          <p className="mt-1 text-sm text-ink/60">Terminals registered to businesses on SmartPOS.</p>
        </div>
        <button
          type="button"
          onClick={reload}
          disabled={loadState === "loading"}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-ink/80 ring-1 ring-inset ring-ink/12 transition-colors hover:bg-ivory hover:text-ink disabled:opacity-60"
        >
          <RotateCw className={`h-4 w-4 ${loadState === "loading" ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </header>

      {/* Summary */}
      <section className="grid grid-cols-2 overflow-hidden rounded-2xl border border-ink/12 bg-white shadow-xs lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, highlight }, i) => (
          <div
            key={label}
            className={`flex items-center justify-between gap-3 p-5 ${i % 2 === 1 ? "border-l border-ink/6" : ""} ${
              i >= 2 ? "border-t border-ink/6 lg:border-t-0" : ""
            } ${i === 2 ? "lg:border-l" : ""}`}
          >
            <div>
              <p className="text-xs font-semibold text-ink/60">{label}</p>
              <p className="mt-1 text-2xl font-bold tracking-[-0.02em] text-ink tabular-nums">
                {loadState === "loading" ? <span className="inline-block h-7 w-10 animate-pulse rounded bg-ink/6 align-middle" /> : value}
              </p>
            </div>
            <span
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                highlight ? "bg-amber-100 text-amber-700" : "bg-ink/6 text-ink/60"
              }`}
            >
              <Icon className="h-5 w-5" />
            </span>
          </div>
        ))}
      </section>

      {/* Approval queue */}
      {loadState === "ready" && awaiting.length > 0 && (
        <section className="overflow-hidden rounded-2xl border border-amber-200 bg-white shadow-xs">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-100 bg-amber-50/60 px-5 py-3.5">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                <BellRing className="h-4 w-4" />
              </span>
              <div>
                <h2 className="text-sm font-bold text-ink">
                  {awaiting.length} {awaiting.length === 1 ? "device is" : "devices are"} waiting for approval
                </h2>
                <p className="text-xs text-ink/60">Approve to let them start selling, or reject unknown devices.</p>
              </div>
            </div>
          </header>
          <ul className="divide-y divide-ink/6">
            {awaiting.slice(0, 5).map((device) => {
              const PlatformIcon = platformOf(device.deviceOs, device.deviceName).icon;
              const working = busy?.id === device.id;
              return (
                <li key={device.id} className="flex flex-col gap-3 px-5 py-3.5 md:flex-row md:items-center">
                  <Link href={`/admin/tabs/devices/${device.id}`} className="group flex min-w-0 flex-1 items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ink text-lime">
                      <PlatformIcon className="h-5 w-5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-ink group-hover:underline">
                        {device.deviceName || "Unnamed device"}
                      </span>
                      <span className="block truncate text-xs text-ink/60">
                        {device.deviceOs || "Unknown OS"} · requested {formatDate(device.createdAt, true)}
                      </span>
                    </span>
                  </Link>
                  <span className="flex min-w-0 items-center gap-2 md:w-56">
                    <CompanyBadge name={device.company?.name} logo={device.company?.logo} />
                    <span className="truncate text-[13px] font-medium text-ink/80">{device.company?.name || "Unassigned"}</span>
                  </span>
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      disabled={Boolean(busy)}
                      onClick={() => decide(device, "REJECT")}
                      className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-rose-600 ring-1 ring-inset ring-rose-200 transition-colors hover:bg-rose-50 disabled:opacity-50"
                    >
                      {working && busy?.action === "REJECT" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
                      Reject
                    </button>
                    <button
                      type="button"
                      disabled={Boolean(busy)}
                      onClick={() => decide(device, "APPROVE")}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-lime px-3 py-2 text-xs font-semibold text-ink transition-colors hover:bg-lime-dark disabled:opacity-50"
                    >
                      {working && busy?.action === "APPROVE" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                      Approve
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
          {awaiting.length > 5 && (
            <button
              type="button"
              onClick={() => setStatus("awaiting")}
              className="block w-full border-t border-ink/6 bg-ivory/70 px-5 py-2.5 text-center text-xs font-semibold text-ink/70 transition-colors hover:bg-ink/6 hover:text-ink"
            >
              Show all {awaiting.length} waiting devices
            </button>
          )}
        </section>
      )}

      {/* Toolbar */}
      <section className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/45" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by device name, ID, OS or business..."
              aria-label="Search devices"
              className={`${control} w-full pl-9 pr-3 text-ink placeholder:text-ink/45`}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              aria-label="Filter by business"
              className={`${control} max-w-56 cursor-pointer px-3 font-medium`}
            >
              <option value="">All businesses</option>
              {companies.map(([id, name]) => (
                <option key={id} value={id}>{name}</option>
              ))}
            </select>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              aria-label="Sort devices"
              className={`${control} cursor-pointer px-3 font-medium`}
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="name">Name A–Z</option>
            </select>
            <div className="flex h-10 items-center rounded-lg bg-ink/6 p-1" role="group" aria-label="Layout">
              {([
                { key: "grid", icon: LayoutGrid, label: "Grid view" },
                { key: "list", icon: List, label: "List view" },
              ] as const).map(({ key, icon: Icon, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setLayout(key)}
                  aria-pressed={layout === key}
                  aria-label={label}
                  title={label}
                  className={`flex h-8 w-9 items-center justify-center rounded-md transition-all ${
                    layout === key ? "bg-white text-ink shadow-sm" : "text-ink/45 hover:text-ink/80"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by status">
          {statusChips.map((chip) => {
            const active = status === chip.key;
            return (
              <button
                key={chip.key || "all"}
                type="button"
                onClick={() => setStatus(chip.key)}
                aria-pressed={active}
                className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors ${
                  active
                    ? "bg-ink text-lime shadow-sm"
                    : "bg-white text-ink/70 ring-1 ring-inset ring-ink/12 hover:text-ink hover:ring-ink/25"
                }`}
              >
                {chip.label}
                <span className={`rounded-full px-1.5 text-[11px] tabular-nums ${active ? "bg-white/15 text-white" : "bg-ink/6 text-ink/60"}`}>
                  {chip.count}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Results */}
      <section aria-live="polite">
        {loadState === "ready" && devices.length > 0 && (
          <div className="mb-3 flex items-center justify-between text-xs text-ink/60">
            <span>
              Showing <span className="font-semibold text-ink">{visible.length}</span> of {devices.length}{" "}
              {devices.length === 1 ? "device" : "devices"}
            </span>
            {hasFilters && (
              <button type="button" onClick={clearFilters} className="inline-flex items-center gap-1 font-semibold text-ink/70 hover:text-ink">
                <X className="h-3.5 w-3.5" />
                Clear filters
              </button>
            )}
          </div>
        )}

        {loadState === "loading" && <DeviceSkeleton />}

        {loadState === "error" && (
          <EmptyState
            title="Couldn't load devices"
            text="Check your connection or sign in again, then try once more."
            action={
              <button type="button" onClick={reload} className="inline-flex items-center gap-2 rounded-lg bg-lime px-4 py-2 text-sm font-semibold text-ink hover:bg-lime-dark">
                <RotateCw className="h-4 w-4" />
                Try again
              </button>
            }
          />
        )}

        {loadState === "ready" && devices.length === 0 && (
          <EmptyState
            title="No devices yet"
            text="Devices appear here when a business installs the SmartPOS app and requests registration."
          />
        )}

        {loadState === "ready" && devices.length > 0 && visible.length === 0 && (
          <EmptyState
            title="No matching devices"
            text="Try a different search, status or business."
            action={
              <button type="button" onClick={clearFilters} className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-ink/80 ring-1 ring-inset ring-ink/12 hover:bg-ivory">
                <X className="h-4 w-4" />
                Clear filters
              </button>
            }
          />
        )}

        {loadState === "ready" && visible.length > 0 && <FetchDevices devices={visible} view={layout} />}
      </section>
    </main>
  );
}

function EmptyState({ title, text, action }: { title: string; text: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-ink/25 bg-white px-6 py-14 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-ink/6 text-ink/45">
        <MonitorSmartphone className="h-6 w-6" />
      </span>
      <h2 className="mt-4 text-sm font-bold text-ink">{title}</h2>
      <p className="mt-1 max-w-sm text-sm text-ink/60">{text}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
