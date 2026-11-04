"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { ownerRequest } from "@/stores/owner/api";
import type { DeliveryArea } from "@/stores/auth/AuthTypes";
import type { Employee, Role } from "@/app/owner/types";
import { Skeleton } from "@/app/owner/components/ui";

// What GET /companies/:id gives the super admin about one company.
export interface CompanyDetails {
  id: string;
  name: string;
  tin?: string | null;
  maxHoldMinutes?: number | null;
  deliveryEnabled?: boolean;
  deliveryFee?: string | number | null;
  deliveryAreas?: DeliveryArea[] | null;
  deliveryRiders?: boolean;
  kitchenEnabled?: boolean;
  features?: { services?: boolean; delivery?: boolean; floorMap?: boolean; kitchen?: boolean } | null;
  users: { id: string; name: string; email: string; phone?: string; role: string; active: boolean; lastLoginAt: string | null; employee?: { name: string } | null }[];
  devices: {
    id: string;
    deviceId: string;
    deviceName: string;
    deviceOs: string;
    registrationStatus: string;
    type?: string;
    online: boolean;
    lastSeenAt: string | null;
    createdAt: string;
    momoCode?: string | null;
    currentUser: { name: string } | null;
  }[];
  employees: Employee[];
  roles: Role[];
  categories: { id: string; name: string; description?: string | null }[];
  stats?: {
    users: number;
    activeUsers: number;
    employees: number;
    devices: number;
    onlineDevices: number;
    devicesInUse: number;
    categories: number;
    products: number;
    activeProducts: number;
    orders: Record<string, { count: number; total: number }>;
  };
  recentActivity?: { id: string; createdAt: string; action: string; statusCode: number | null; device: { deviceName: string }; user: { name: string; role: string } | null }[];
}

export const ORDER_STATUS: Record<string, { label: string; tone: "ink" | "lime" | "muted" | "danger" }> = {
  COMPLETED: { label: "Paid", tone: "ink" },
  CANCELLED: { label: "Cancelled", tone: "danger" },
  PENDING: { label: "Pending", tone: "lime" },
  PREPARING: { label: "Preparing", tone: "lime" },
  READY: { label: "Ready", tone: "lime" },
  SERVED: { label: "Served", tone: "muted" },
};

export const DEVICE_KIND: Record<string, string> = { POS_TERMINAL: "Till", KITCHEN_DISPLAY: "Kitchen display", CUSTOMER_DISPLAY: "Customer display", RIDER_PHONE: "Rider phone" };

export const title = (v?: string | null) => (v ? v.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase()) : "—");

export const stamp = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "—";

export function Stat({ icon: Icon, label, value, hint, tone }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; hint?: string; tone?: string }) {
  return (
    <div className="rounded-xl border border-ink/10 bg-white p-4">
      <p className="flex items-center gap-1.5 text-xs font-semibold text-ink/55">
        <Icon className="h-3.5 w-3.5" /> {label}
      </p>
      <p className={`mt-1.5 truncate text-xl font-extrabold ${tone ?? "text-ink"}`}>{value}</p>
      {hint && <p className="truncate text-[11px] text-ink/45">{hint}</p>}
    </div>
  );
}

// A bordered box with a small heading, for one list.
export function Panel({ heading, action, children, scroll }: { heading: React.ReactNode; action?: React.ReactNode; children: React.ReactNode; scroll?: boolean }) {
  return (
    <div className="rounded-xl border border-ink/10">
      <div className="flex items-center justify-between gap-2 border-b border-ink/6 px-4 py-2.5">
        <p className="text-xs font-bold text-ink/60">{heading}</p>
        {action}
      </div>
      <ul className={`divide-y divide-ink/6 ${scroll ? "max-h-96 overflow-y-auto" : ""}`}>{children}</ul>
    </div>
  );
}

export const Empty = ({ text }: { text: string }) => <li className="px-4 py-3 text-sm text-ink/55">{text}</li>;

export function Loading<T>({ data, loading, error, reload, children }: { data: T | null; loading: boolean; error: string | null; reload: () => void; children: (data: T) => React.ReactNode }) {
  if (data) return <>{children(data)}</>;
  if (loading) return <Skeleton className="h-40" />;
  return (
    <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
      {error ?? "Could not load this."}{" "}
      <button type="button" onClick={reload} className="font-semibold underline">
        Try again
      </button>
    </div>
  );
}

// Pills to pick one of a few views.
export function Choice<T extends string>({ value, options, onChange }: { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          aria-pressed={value === o.value}
          className={`h-8 rounded-lg px-3 text-xs font-semibold transition-colors ${value === o.value ? "bg-ink text-white" : "bg-white text-ink/70 ring-1 ring-inset ring-ink/12 hover:bg-ivory"}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

// One click, one request, one toast. Returns a runner and the key being saved.
export function useAction(onDone: () => void) {
  const [busy, setBusy] = useState<string | null>(null);
  const run = async (key: string, path: string, init: RequestInit, done: string) => {
    setBusy(key);
    try {
      await ownerRequest(path, init);
      toast.success(done);
      onDone();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save");
    } finally {
      setBusy(null);
    }
  };
  return { busy, run };
}

export function SmallButton({ children, onClick, disabled, tone = "plain" }: { children: React.ReactNode; onClick: () => void; disabled?: boolean; tone?: "plain" | "danger" | "ink" }) {
  const cls = tone === "danger" ? "text-rose-600 ring-rose-200 hover:bg-rose-50" : tone === "ink" ? "bg-ink text-white ring-ink hover:bg-ink-soft" : "text-ink/75 ring-ink/12 hover:bg-ivory";
  return (
    <button type="button" onClick={onClick} disabled={disabled} className={`h-8 rounded-lg px-3 text-xs font-semibold ring-1 ring-inset disabled:opacity-50 ${cls}`}>
      {children}
    </button>
  );
}
