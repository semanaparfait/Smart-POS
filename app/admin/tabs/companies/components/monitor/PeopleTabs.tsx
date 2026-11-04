"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useOwnerData } from "@/stores/owner/api";
import type { DeviceActivity, Employee, Order } from "@/app/owner/types";
import { Avatar, Badge, SearchInput, formatDate, rwf, timeAgo, toNumber } from "@/app/owner/components/ui";
import { permissionLabel } from "@/app/owner/permissions";
import { DEVICE_KIND, Empty, Loading, Panel, SmallButton, stamp, title, useAction, type CompanyDetails } from "./parts";

// ---------- Workers ----------

function WorkerRow({ worker, sales, onChanged }: { worker: Employee; sales: { count: number; total: number }; onChanged: () => void }) {
  const [open, setOpen] = useState(false);
  const { busy, run } = useAction(onChanged);
  const active = worker.user?.active !== false;
  const access = worker.permissions;
  return (
    <li>
      <div className="flex flex-wrap items-center gap-3 px-4 py-3">
        <Avatar name={worker.name} src={worker.profile?.thumbnailUrl ?? worker.profile?.url} size={36} />
        <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="min-w-0 flex-1 text-left">
          <p className="truncate text-sm font-bold text-ink">
            {worker.name} <ChevronDown className={`inline h-3.5 w-3.5 text-ink/35 transition-transform ${open ? "rotate-180" : ""}`} />
          </p>
          <p className="truncate text-xs text-ink/55">
            {worker.role?.name ?? "No role"} · {worker.phone} · {worker.email}
          </p>
        </button>
        <span className="text-right text-xs text-ink/60">
          {worker.payType === "PER_DELIVERY" ? `${rwf(worker.perDelivery)} per delivery` : `${rwf(worker.salary)} / month`}
          <span className="block text-ink/45">
            {sales.count} sales · {rwf(sales.total)}
          </span>
        </span>
        <Badge tone={active ? "success" : "danger"}>{active ? "Can sign in" : "Off"}</Badge>
        <SmallButton
          tone={active ? "danger" : "ink"}
          disabled={busy !== null}
          onClick={() =>
            run("status", `/employees/${worker.id}/status`, { method: "PATCH", body: JSON.stringify({ active: !active }) }, active ? `${worker.name} can no longer sign in` : `${worker.name} can sign in again`)
          }
        >
          {active ? "Turn off" : "Turn on"}
        </SmallButton>
      </div>
      {open && (
        <div className="grid gap-3 border-t border-ink/6 bg-ivory/40 px-4 py-3 text-xs text-ink/75 sm:grid-cols-2">
          <div className="space-y-1">
            <p>Shift: {title(worker.shift)}</p>
            <p>Credit limit per sale: {worker.creditLimit ? rwf(worker.creditLimit) : "No limit set"}</p>
            <p>Several devices at once: {worker.user?.allowMultipleDevices ? "Yes" : "No"}</p>
            <p>Last sign-in: {timeAgo(worker.user?.lastLoginAt)}</p>
            <p>Joined: {formatDate(worker.createdAt)}</p>
            {!!worker.extraPermissions?.length && <p>Added for this worker: {worker.extraPermissions.map(permissionLabel).join(", ")}</p>}
            {!!worker.removedPermissions?.length && <p>Taken away for this worker: {worker.removedPermissions.map(permissionLabel).join(", ")}</p>}
          </div>
          <div>
            <p className="mb-1 font-semibold text-ink">What they can do</p>
            <p>{access === null || access === undefined ? "Everything" : access.length ? access.map(permissionLabel).join(", ") : "Nothing yet"}</p>
          </div>
        </div>
      )}
    </li>
  );
}

export function WorkersTab({ companyId, details, orders, onChanged }: { companyId: string; details: CompanyDetails; orders: Order[]; onChanged: () => void }) {
  const workers = useOwnerData<Employee[]>(`/employees?companyId=${companyId}`);
  const [search, setSearch] = useState("");
  const q = search.trim().toLowerCase();

  const salesBy = new Map<string, { count: number; total: number }>();
  for (const o of orders)
    if (o.status === "COMPLETED" && o.user?.id) {
      const s = salesBy.get(o.user.id) ?? { count: 0, total: 0 };
      salesBy.set(o.user.id, { count: s.count + 1, total: s.total + toNumber(o.total) });
    }

  const reload = () => (workers.reload(), onChanged());

  return (
    <div className="space-y-4">
      <SearchInput value={search} onChange={setSearch} placeholder="Search workers" />
      <Loading {...workers}>
        {(list) => (
          <Panel heading={`Workers · ${list.length}`}>
            {list
              .filter((w) => !q || [w.name, w.phone, w.email, w.role?.name].some((v) => v?.toLowerCase().includes(q)))
              .map((w) => (
                <WorkerRow key={w.id} worker={w} sales={salesBy.get(w.user?.id ?? "") ?? { count: 0, total: 0 }} onChanged={reload} />
              ))}
            {!list.length && <Empty text="No workers." />}
          </Panel>
        )}
      </Loading>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel heading={`Roles · ${details.roles.length}`}>
          {details.roles.map((r) => (
            <li key={r.id} className="px-4 py-2.5 text-sm">
              <p className="font-semibold text-ink">{r.name}</p>
              {r.description && <p className="text-xs text-ink/55">{r.description}</p>}
              <p className="mt-0.5 text-xs text-ink/55">{r.permissions === null || r.permissions === undefined ? "Everything" : r.permissions.map(permissionLabel).join(", ") || "Nothing"}</p>
            </li>
          ))}
          {!details.roles.length && <Empty text="No roles." />}
        </Panel>
        <Panel heading="Sign-in accounts">
          {details.users.map((u) => (
            <li key={u.id} className="flex flex-wrap items-center gap-3 px-4 py-2.5 text-sm">
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold text-ink">{u.employee?.name ?? u.name}</span>
                <span className="block truncate text-xs text-ink/55">{u.email}</span>
              </span>
              <span className="text-xs text-ink/55">{title(u.role)}</span>
              <span className="w-32 text-right text-xs text-ink/55">Signed in {timeAgo(u.lastLoginAt).toLowerCase()}</span>
              <Badge tone={u.active ? "success" : "danger"}>{u.active ? "Active" : "Off"}</Badge>
            </li>
          ))}
        </Panel>
      </div>
    </div>
  );
}

// ---------- Devices ----------

type Dev = CompanyDetails["devices"][number];

function DeviceLog({ deviceId }: { deviceId: string }) {
  const log = useOwnerData<DeviceActivity[]>(`/devices/${deviceId}/activities?limit=50`);
  return (
    <div className="border-t border-ink/6 bg-ivory/40 px-4 py-3">
      <Loading {...log}>
        {(rows) => (
          <ul className="max-h-72 space-y-1 overflow-y-auto text-xs text-ink/75">
            {rows.map((a) => (
              <li key={a.id} className="flex flex-wrap justify-between gap-2">
                <span>
                  {stamp(a.createdAt)} · {a.user?.name ?? "—"} · {title(a.action)}
                  {a.path ? <span className="font-mono text-ink/45"> {a.method} {a.path}</span> : null}
                </span>
                {a.statusCode !== null && <span className={`font-mono ${a.statusCode >= 400 ? "text-rose-600" : "text-emerald-700"}`}>{a.statusCode}</span>}
              </li>
            ))}
            {!rows.length && <li>Nothing done on this device yet.</li>}
          </ul>
        )}
      </Loading>
    </div>
  );
}

function DeviceRow({ device, onChanged }: { device: Dev; onChanged: () => void }) {
  const [open, setOpen] = useState(false);
  const { busy, run } = useAction(onChanged);
  const s = device.registrationStatus;
  const waiting = s === "PENDING" || s === "REQUESTED";
  const tone = s === "REGISTERED" ? "success" : waiting ? "lime" : "danger";
  const patch = (key: string, path: string, body: object | null, done: string) => run(key, `/devices/${device.id}/${path}`, { method: "PATCH", ...(body ? { body: JSON.stringify(body) } : {}) }, done);
  return (
    <li>
      <div className="flex flex-wrap items-center gap-3 px-4 py-3">
        <span className={`h-2.5 w-2.5 rounded-full ${device.online ? "bg-emerald-500" : "bg-ink/20"}`} />
        <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="min-w-0 flex-1 text-left">
          <p className="truncate text-sm font-bold text-ink">
            {device.deviceName} <ChevronDown className={`inline h-3.5 w-3.5 text-ink/35 transition-transform ${open ? "rotate-180" : ""}`} />
          </p>
          <p className="truncate text-xs text-ink/55">
            {DEVICE_KIND[device.type ?? "POS_TERMINAL"] ?? title(device.type)} · {device.deviceOs} · {device.online ? "Online now" : `Seen ${timeAgo(device.lastSeenAt).toLowerCase()}`}
            {device.momoCode ? ` · MoMo ${device.momoCode}` : ""}
          </p>
        </button>
        <span className="text-xs text-ink/60">{device.currentUser?.name ?? "Nobody signed in"}</span>
        <Badge tone={tone}>{title(s)}</Badge>
        {waiting ? (
          <>
            <SmallButton tone="ink" disabled={busy !== null} onClick={() => patch("ok", "registration", { action: "APPROVE", type: device.type ?? "POS_TERMINAL" }, `${device.deviceName} approved`)}>
              Approve
            </SmallButton>
            <SmallButton tone="danger" disabled={busy !== null} onClick={() => patch("no", "registration", { action: "REJECT" }, `${device.deviceName} turned away`)}>
              Turn away
            </SmallButton>
          </>
        ) : s === "REGISTERED" ? (
          <SmallButton tone="danger" disabled={busy !== null} onClick={() => patch("off", "disable", null, `${device.deviceName} turned off`)}>
            Turn off
          </SmallButton>
        ) : s === "DISABLED" ? (
          <SmallButton tone="ink" disabled={busy !== null} onClick={() => patch("on", "enable", null, `${device.deviceName} turned on`)}>
            Turn on
          </SmallButton>
        ) : null}
      </div>
      {open && <DeviceLog deviceId={device.id} />}
    </li>
  );
}

export function DevicesTab({ details, onChanged }: { details: CompanyDetails; onChanged: () => void }) {
  const [search, setSearch] = useState("");
  const q = search.trim().toLowerCase();
  const list = details.devices.filter((d) => !q || [d.deviceName, d.deviceOs, d.currentUser?.name].some((v) => v?.toLowerCase().includes(q)));
  return (
    <div className="space-y-3">
      <SearchInput value={search} onChange={setSearch} placeholder="Search devices" />
      <p className="text-xs text-ink/55">Open a device to see everything done on it.</p>
      <Panel heading={`Devices · ${details.devices.length}`}>
        {list.map((d) => (
          <DeviceRow key={d.id} device={d} onChanged={onChanged} />
        ))}
        {!list.length && <Empty text="No devices." />}
      </Panel>
    </div>
  );
}
