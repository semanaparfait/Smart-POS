"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Bike, ChefHat, Check, Loader2, MonitorSmartphone, Store, Tv, X, type LucideIcon } from "lucide-react";
import { ownerRequest, useOwnerData } from "@/stores/owner/api";
import type { Device, DeviceKind } from "@/app/owner/types";
import { Badge, Card, EmptyState, ErrorState, PageHeader, Skeleton, Tabs, formatDate, timeAgo } from "@/app/owner/components/ui";

const KINDS: Record<DeviceKind, { label: string; icon: LucideIcon; text: string }> = {
  POS_TERMINAL: { label: "Till", icon: Store, text: "Sells, takes payments" },
  KITCHEN_DISPLAY: { label: "Kitchen display", icon: ChefHat, text: "Shows orders to prepare" },
  CUSTOMER_DISPLAY: { label: "Customer display", icon: Tv, text: "Shows the customer their bill" },
  RIDER_PHONE: { label: "Rider phone", icon: Bike, text: "A rider's deliveries" },
};

type Filter = "all" | "waiting" | "approved" | "off";

const isWaiting = (d: Device) => d.registrationStatus === "PENDING" || d.registrationStatus === "REQUESTED";
const isApproved = (d: Device) => d.registrationStatus === "REGISTERED";

// A device asking to join: approve it as one kind, or turn it away.
function WaitingDevice({ device, onDone }: { device: Device; onDone: () => void }) {
  const [kind, setKind] = useState<DeviceKind>(device.deviceId.startsWith("SITE-") ? "POS_TERMINAL" : device.type ?? "POS_TERMINAL");
  const [busy, setBusy] = useState<"APPROVE" | "REJECT" | null>(null);

  const decide = async (action: "APPROVE" | "REJECT") => {
    setBusy(action);
    try {
      await ownerRequest(`/devices/${device.id}/registration`, {
        method: "PATCH",
        body: JSON.stringify(action === "APPROVE" ? { action, type: kind } : { action }),
      });
      toast.success(`${device.deviceName} ${action === "APPROVE" ? "approved" : "turned away"}`);
      onDone();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save");
    } finally {
      setBusy(null);
    }
  };

  return (
    <li className="p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-lime text-ink">
            <MonitorSmartphone className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="truncate font-bold text-ink">{device.deviceName}</p>
            <p className="text-xs text-ink/55">
              {device.deviceOs} · <span className="font-mono">{device.deviceId}</span> · asked {timeAgo(device.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as DeviceKind)}
            aria-label="Use it as"
            className="h-10 rounded-xl border border-ink/12 bg-white px-3 text-sm font-medium text-ink outline-none focus:border-ink focus:ring-4 focus:ring-lime/40"
          >
            {(Object.keys(KINDS) as DeviceKind[]).map((k) => (
              <option key={k} value={k}>
                Use as {KINDS[k].label.toLowerCase()}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => decide("REJECT")}
            disabled={!!busy}
            className="inline-flex h-10 items-center gap-1.5 rounded-xl px-3.5 text-sm font-semibold text-rose-600 ring-1 ring-inset ring-rose-200 hover:bg-rose-50 disabled:opacity-60"
          >
            {busy === "REJECT" ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
            Turn away
          </button>
          <button
            type="button"
            onClick={() => decide("APPROVE")}
            disabled={!!busy}
            className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-ink px-4 text-sm font-semibold text-white hover:bg-ink-soft disabled:opacity-60"
          >
            {busy === "APPROVE" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 text-lime" />}
            Approve
          </button>
        </div>
      </div>
    </li>
  );
}

function DeviceCard({ device }: { device: Device }) {
  const kind = KINDS[device.type ?? "POS_TERMINAL"] ?? KINDS.POS_TERMINAL;
  const Icon = kind.icon;
  const approved = isApproved(device);
  return (
    <div className={`rounded-2xl border border-ink/10 bg-white p-5 ${approved ? "" : "opacity-60"}`}>
      <div className="flex items-start justify-between gap-3">
        <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${device.online ? "bg-ink text-lime" : "bg-ivory text-ink/50"}`}>
          <Icon className="h-5 w-5" />
        </span>
        {approved ? (
          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${device.online ? "text-emerald-600" : "text-ink/45"}`}>
            <span className={`h-2 w-2 rounded-full ${device.online ? "bg-emerald-500" : "bg-ink/25"}`} />
            {device.online ? "Online" : `Seen ${timeAgo(device.lastSeenAt).toLowerCase()}`}
          </span>
        ) : (
          <Badge tone="danger">{device.registrationStatus === "DISABLED" ? "Disabled" : "Turned away"}</Badge>
        )}
      </div>
      <p className="mt-4 truncate font-bold text-ink">{device.deviceName}</p>
      <p className="text-xs text-ink/55">
        {kind.label} · {kind.text}
      </p>
      <div className="mt-4 flex items-center justify-between border-t border-ink/6 pt-3 text-xs">
        <span className="text-ink/45">In use by</span>
        <span className="font-semibold text-ink">{device.currentUser?.name ?? "Nobody"}</span>
      </div>
      <div className="mt-1.5 flex items-center justify-between text-xs">
        <span className="text-ink/45">Added</span>
        <span className="font-semibold text-ink">{formatDate(device.createdAt)}</span>
      </div>
    </div>
  );
}

export default function OwnerDevices() {
  const { data, loading, error, reload } = useOwnerData<Device[]>("/devices");
  const [filter, setFilter] = useState<Filter>("all");

  if (error) return <ErrorState message={error} onRetry={reload} />;

  const all = data ?? [];
  const waiting = all.filter(isWaiting);
  const decided = all.filter((d) => !isWaiting(d));
  const visible = decided.filter(
    (d) => filter === "all" || (filter === "approved" ? isApproved(d) : filter === "off" ? !isApproved(d) : false),
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Equipment"
        title="Devices"
        description="Tills, kitchen and customer displays, rider phones, and the browsers you sign in on."
      />

      {loading ? (
        <Skeleton className="h-40" />
      ) : (
        waiting.length > 0 && (
          <Card title={`Waiting for approval (${waiting.length})`} description="New devices can't be used until you approve them.">
            <ul className="divide-y divide-ink/6">
              {waiting.map((d) => (
                <WaitingDevice key={d.id} device={d} onDone={reload} />
              ))}
            </ul>
          </Card>
        )
      )}

      <Tabs
        options={[
          { value: "all", label: "All", count: decided.length },
          { value: "approved", label: "Approved", count: decided.filter(isApproved).length },
          { value: "off", label: "Disabled or turned away", count: decided.filter((d) => !isApproved(d)).length },
        ]}
        value={filter === "waiting" ? "all" : filter}
        onChange={setFilter}
      />

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <Card>
          <EmptyState icon={MonitorSmartphone} title="No devices here" />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((d) => (
            <DeviceCard key={d.id} device={d} />
          ))}
        </div>
      )}
    </div>
  );
}
