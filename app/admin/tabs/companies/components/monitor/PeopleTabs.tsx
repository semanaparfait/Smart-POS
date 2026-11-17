"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useOwnerData } from "@/stores/owner/api";
import type { Device, Employee, Order } from "@/app/owner/types";
import DevicesBoard from "@/app/owner/devices/DevicesBoard";
import { Avatar, Badge, ErrorState, SearchInput, formatDate, rwf, timeAgo, toNumber } from "@/app/owner/components/ui";
import { permissionLabel } from "@/app/owner/permissions";
import { Empty, Loading, Panel, SmallButton, title, useAction, type CompanyDetails } from "./parts";

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

// The same board the owner sees on /owner/devices; each card opens the full
// device page, where the super admin can do everything the owner can.
export function DevicesTab({ companyId, onChanged }: { companyId: string; onChanged: () => void }) {
  const devices = useOwnerData<Device[]>(`/devices?companyId=${encodeURIComponent(companyId)}`);
  if (devices.error && !devices.data) return <ErrorState message={devices.error} onRetry={devices.reload} />;
  return (
    <DevicesBoard
      devices={devices.data}
      loading={devices.loading}
      reload={() => (devices.reload(), onChanged())}
      base={`/admin/tabs/companies/${companyId}/devices`}
      waitingText="New devices can't be used until they are approved."
    />
  );
}
