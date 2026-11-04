"use client";

import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Check, Loader2, MonitorSmartphone, Power, RotateCw, Trash2, X } from "lucide-react";
import { ownerRequest, useOwnerData } from "@/stores/owner/api";
import type { Device, DeviceKind } from "@/app/owner/types";
import { Badge, Card, EmptyState, ErrorState, PageHeader, SearchInput, Skeleton, formatDate, timeAgo } from "@/app/owner/components/ui";
import { Button, LinkButton } from "@/app/owner/components/forms";
import { DEVICES, KINDS, STATE_META, deviceState, type DeviceState } from "@/app/owner/devices/kinds";

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

function DeviceCard({ device, onChanged }: { device: Device; onChanged: () => void }) {
  const kind = KINDS[device.type ?? "POS_TERMINAL"] ?? KINDS.POS_TERMINAL;
  const Icon = kind.icon;
  const approved = isApproved(device);
  const state = deviceState(device);
  const [busy, setBusy] = useState<string | null>(null);
  const run = async (key: string, path: string, init: RequestInit, done: string) => {
    setBusy(key);
    try {
      await ownerRequest(path, init);
      toast.success(done);
      onChanged();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save");
    } finally {
      setBusy(null);
    }
  };
  return (
    <div className={`rounded-2xl border border-ink/10 bg-white p-5 ${approved ? "" : "opacity-70"}`}>
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
      <Link href={`${DEVICES}/${device.id}`} className="mt-4 block truncate font-bold text-ink hover:underline">
        {device.deviceName}
      </Link>
      <p className="text-xs text-ink/55">
        {kind.label} · {kind.text}
      </p>
      <div className="mt-4 flex items-center justify-between border-t border-ink/6 pt-3 text-xs">
        <span className="text-ink/45">In use by</span>
        <span className="font-semibold text-ink">{device.currentUser?.name ?? "Nobody"}</span>
      </div>
      <div className="mt-1.5 flex items-center justify-between text-xs">
        <span className="text-ink/45">Last activity</span>
        <span className="truncate pl-2 font-semibold text-ink">{device.lastActivityAt ? timeAgo(device.lastActivityAt) : "None"}</span>
      </div>
      <div className="mt-1.5 flex items-center justify-between text-xs">
        <span className="text-ink/45">Added</span>
        <span className="font-semibold text-ink">{formatDate(device.createdAt)}</span>
      </div>
      <div className="mt-3 flex items-center justify-between gap-1 border-t border-ink/6 pt-3">
        <span className="truncate font-mono text-[10px] text-ink/40">{device.deviceId}</span>
        <div className="flex gap-1">
          {state !== "rejected" && (
            <Button
              small
              tone="quiet"
              icon={Power}
              busy={busy === "toggle"}
              aria-label={`${state === "disabled" ? "Enable" : "Disable"} ${device.deviceName}`}
              title={state === "disabled" ? "Enable" : "Disable"}
              className="px-2.5"
              onClick={() => run("toggle", `/devices/${device.id}/${state === "disabled" ? "enable" : "disable"}`, { method: "PATCH" }, `${device.deviceName} ${state === "disabled" ? "enabled" : "disabled"}`)}
            />
          )}
          <Button
            small
            tone="quiet"
            icon={Trash2}
            busy={busy === "delete"}
            aria-label={`Delete ${device.deviceName}`}
            title="Delete"
            className="px-2.5 text-rose-600"
            onClick={() => run("delete", `/devices/${device.id}/delete`, { method: "DELETE" }, `${device.deviceName} deleted`)}
          />
          <LinkButton small tone="outline" href={`${DEVICES}/${device.id}`}>
            Open
          </LinkButton>
        </div>
      </div>
    </div>
  );
}

export default function OwnerDevices() {
  const { data, loading, error, reload } = useOwnerData<Device[]>("/devices");
  const [state, setState] = useState<"all" | DeviceState>("all");
  const [search, setSearch] = useState("");

  if (error) return <ErrorState message={error} onRetry={reload} />;

  const all = data ?? [];
  const waiting = all.filter(isWaiting);
  const decided = all.filter((d) => !isWaiting(d));
  const counts = { active: 0, pending: 0, disabled: 0, rejected: 0 } as Record<DeviceState, number>;
  for (const d of all) counts[deviceState(d)] += 1;
  const q = search.trim().toLowerCase();
  const visible = decided.filter(
    (d) =>
      (state === "all" || deviceState(d) === state) &&
      (!q || [d.deviceName, d.deviceOs, d.deviceId, d.currentUser?.name].some((v) => v?.toLowerCase().includes(q))),
  );
  const online = all.filter((d) => d.online).length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Settings"
        title="Devices"
        description="Approve new tills, kitchen and customer displays, and control which ones can be used."
        actions={
          <Button tone="outline" icon={RotateCw} onClick={reload}>
            Refresh
          </Button>
        }
      />

      <div className="grid grid-cols-2 overflow-hidden rounded-2xl border border-ink/10 bg-white lg:grid-cols-5">
        <button type="button" onClick={() => setState("all")} className={`p-5 text-left ${state === "all" ? "bg-ink text-white" : "hover:bg-ivory/60"}`}>
          <p className={`text-xs font-semibold ${state === "all" ? "text-white/60" : "text-ink/55"}`}>All devices</p>
          <p className="mt-1 text-3xl font-extrabold">{all.length}</p>
          <p className={`text-[11px] ${state === "all" ? "text-lime" : "text-ink/45"}`}>{online} online now</p>
        </button>
        {(["active", "pending", "disabled", "rejected"] as DeviceState[]).map((s) => {
          const pct = all.length ? Math.round((counts[s] / all.length) * 100) : 0;
          const on = state === s;
          return (
            <button key={s} type="button" onClick={() => setState(on ? "all" : s)} className={`border-l border-ink/6 p-5 text-left ${on ? "bg-ivory" : "hover:bg-ivory/60"}`}>
              <p className="flex items-center gap-1.5 text-xs font-semibold text-ink/60">
                {STATE_META[s].label}
                {s === "pending" && counts[s] > 0 && <span className="h-2 w-2 rounded-full bg-lime" />}
              </p>
              <p className="mt-1 text-2xl font-extrabold text-ink">
                {counts[s]} <span className="text-xs font-semibold text-ink/40">{pct}%</span>
              </p>
              <p className="truncate text-[11px] text-ink/45">{STATE_META[s].hint}</p>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-ivory">
                <div className={`h-full ${STATE_META[s].bar}`} style={{ width: `${pct}%` }} />
              </div>
            </button>
          );
        })}
      </div>

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

      <SearchInput value={search} onChange={setSearch} placeholder="Name, system, device ID or worker" />

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
            <DeviceCard key={d.id} device={d} onChanged={reload} />
          ))}
        </div>
      )}
    </div>
  );
}
