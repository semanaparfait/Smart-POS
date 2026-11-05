"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  ChevronRight,
  Globe,
  MonitorCheck,
  Smartphone,
  Tablet,
  type LucideIcon,
} from "lucide-react";
import { RegistrationStatusEnum, type DeviceType } from "@/stores/device/devicetypes";

/* ---------- Shared helpers (also used by the device detail page) ---------- */

export const STATUS: Record<string, { label: string; dot: string; pill: string }> = {
  [RegistrationStatusEnum.REGISTERED]: {
    label: "Registered",
    dot: "bg-lime ring-1 ring-ink/40",
    pill: "bg-white text-ink/80 ring-ink/12",
  },
  [RegistrationStatusEnum.REQUESTED]: {
    label: "Awaiting approval",
    dot: "bg-amber-500",
    pill: "bg-amber-50 text-amber-800 ring-amber-200",
  },
  [RegistrationStatusEnum.PENDING]: {
    label: "Pending",
    dot: "bg-amber-500",
    pill: "bg-amber-50 text-amber-800 ring-amber-200",
  },
  [RegistrationStatusEnum.REJECTED]: {
    label: "Rejected",
    dot: "bg-rose-500",
    pill: "bg-rose-50 text-rose-700 ring-rose-200",
  },
  [RegistrationStatusEnum.DISABLED]: {
    label: "Disabled",
    dot: "bg-ink/45",
    pill: "bg-ink/6 text-ink/70 ring-ink/12",
  },
};

export const statusOf = (status?: string) =>
  STATUS[status ?? ""] ?? { label: status || "Unknown", dot: "bg-ink/25", pill: "bg-ivory text-ink/70 ring-ink/12" };

export const isAwaiting = (status?: string) =>
  status === RegistrationStatusEnum.REQUESTED || status === RegistrationStatusEnum.PENDING;

export function StatusPill({ status }: { status?: string }) {
  const s = statusOf(status);
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${s.pill}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} aria-hidden="true" />
      {s.label}
    </span>
  );
}

/** Platform label and icon from the device OS / name */
export function platformOf(os?: string, name?: string): { label: string; icon: LucideIcon } {
  const text = `${os ?? ""} ${name ?? ""}`.toLowerCase();
  if (/win|desktop|\bpc\b|mac/.test(text)) return { label: "Desktop POS", icon: MonitorCheck };
  if (/web|chrome|browser|safari|firefox/.test(text)) return { label: "Web terminal", icon: Globe };
  if (/ipad|tablet/.test(text)) return { label: "Tablet POS", icon: Tablet };
  return { label: "Mobile POS", icon: Smartphone };
}

export const formatDate = (value?: string, withTime = false) => {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  });
};

export const initials = (name?: string) =>
  (name ?? "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "?";

export function CompanyBadge({ name, logo, size = "h-7 w-7 text-[10px]" }: { name?: string; logo?: string | null; size?: string }) {
  return logo?.trim() ? (
    // eslint-disable-next-line @next/next/no-img-element -- logos come from arbitrary hosts
    <img loading="lazy" decoding="async" src={logo} alt="" className={`${size} shrink-0 rounded-lg bg-white object-cover ring-1 ring-ink/12`} />
  ) : (
    <span className={`${size} flex shrink-0 items-center justify-center rounded-lg bg-ink/6 font-bold text-ink/70`}>
      {initials(name)}
    </span>
  );
}

const href = (device: DeviceType) => `/admin/tabs/devices/${device.id}`;

/* ---------- Grid ---------- */

function DeviceGrid({ devices }: { devices: DeviceType[] }) {
  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {devices.map((device) => {
        const platform = platformOf(device.deviceOs, device.deviceName);
        const PlatformIcon = platform.icon;
        const disabled = device.registrationStatus === RegistrationStatusEnum.DISABLED;

        return (
          <li key={device.id}>
            <Link
              href={href(device)}
              className="group flex h-full flex-col rounded-2xl border border-ink/12 bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-ink/25 hover:shadow-lg hover:shadow-ink/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime"
            >
              <div className="flex items-start justify-between gap-3">
                <span
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-colors ${
                    disabled ? "bg-ink/6 text-ink/45" : "bg-ink text-lime"
                  }`}
                >
                  <PlatformIcon className="h-6 w-6" strokeWidth={1.8} />
                </span>
                <StatusPill status={device.registrationStatus} />
              </div>

              <h3 className="mt-4 truncate text-[15px] font-bold tracking-[-0.01em] text-ink">
                {device.deviceName || "Unnamed device"}
              </h3>
              <p className="mt-1 truncate font-mono text-[11px] text-ink/45">{device.deviceId}</p>

              <div className="mt-4 flex items-center gap-2.5 rounded-xl bg-ivory p-3 ring-1 ring-inset ring-ink/6">
                <CompanyBadge name={device.company?.name} logo={device.company?.logo} />
                <span className="min-w-0">
                  <span className="block truncate text-[13px] font-semibold text-ink/90">
                    {device.company?.name || "Unassigned"}
                  </span>
                  <span className="block truncate text-[11px] text-ink/60">
                    {device.company?.location || "No location"}
                  </span>
                </span>
              </div>

              <div className="mt-auto flex items-center justify-between gap-3 pt-4 text-xs">
                <span className="truncate text-ink/45">
                  {device.deviceOs || platform.label} · Added {formatDate(device.createdAt)}
                </span>
                <ArrowUpRight
                  className="h-4 w-4 shrink-0 text-ink/45 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink"
                  aria-hidden="true"
                />
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/* ---------- Table ---------- */

function DeviceTable({ devices }: { devices: DeviceType[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-ink/12 bg-white shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="border-b border-ink/12 bg-ivory/80 text-[11px] font-bold uppercase tracking-[0.12em] text-ink/45">
            <tr>
              <th scope="col" className="px-5 py-3">Device</th>
              <th scope="col" className="px-5 py-3">Business</th>
              <th scope="col" className="px-5 py-3">Platform</th>
              <th scope="col" className="px-5 py-3">Status</th>
              <th scope="col" className="px-5 py-3">Added</th>
              <th scope="col" className="px-5 py-3"><span className="sr-only">Open</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/6">
            {devices.map((device) => {
              const platform = platformOf(device.deviceOs, device.deviceName);
              const PlatformIcon = platform.icon;
              return (
                <tr key={device.id} className="group transition-colors hover:bg-ivory/70">
                  <td className="px-5 py-3.5">
                    <Link href={href(device)} className="flex items-center gap-3 focus-visible:outline-none">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ink text-lime">
                        <PlatformIcon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-semibold text-ink group-hover:underline">
                          {device.deviceName || "Unnamed device"}
                        </span>
                        <span className="block max-w-56 truncate font-mono text-[11px] text-ink/45">{device.deviceId}</span>
                      </span>
                    </Link>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="flex items-center gap-2.5">
                      <CompanyBadge name={device.company?.name} logo={device.company?.logo} />
                      <span className="min-w-0">
                        <span className="block max-w-48 truncate font-medium text-ink/90">{device.company?.name || "Unassigned"}</span>
                        <span className="block max-w-48 truncate text-xs text-ink/45">{device.company?.location}</span>
                      </span>
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-ink/70">{device.deviceOs || platform.label}</td>
                  <td className="px-5 py-3.5"><StatusPill status={device.registrationStatus} /></td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-ink/60">{formatDate(device.createdAt)}</td>
                  <td className="px-5 py-3.5 text-right">
                    <Link
                      href={href(device)}
                      aria-label={`Open ${device.deviceName || device.deviceId}`}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-ink/45 transition-colors hover:bg-white hover:text-ink hover:ring-1 hover:ring-ink/12"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------- Loading placeholder ---------- */

export function DeviceSkeleton() {
  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-hidden="true">
      {Array.from({ length: 6 }, (_, i) => (
        <li key={i} className="animate-pulse rounded-2xl border border-ink/12 bg-white p-5">
          <div className="flex justify-between">
            <div className="h-12 w-12 rounded-xl bg-ink/6" />
            <div className="h-5 w-20 rounded-full bg-ink/6" />
          </div>
          <div className="mt-4 h-4 w-2/3 rounded bg-ink/6" />
          <div className="mt-2 h-3 w-1/2 rounded bg-ink/6" />
          <div className="mt-4 h-14 rounded-xl bg-ivory" />
        </li>
      ))}
    </ul>
  );
}

export default function FetchDevices({ devices, view }: { devices: DeviceType[]; view: "grid" | "list" }) {
  return view === "grid" ? <DeviceGrid devices={devices} /> : <DeviceTable devices={devices} />;
}
