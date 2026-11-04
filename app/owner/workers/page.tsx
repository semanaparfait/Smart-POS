"use client";

import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { BarChart3, Eye, KeyRound, Mail, Pencil, Phone, Plus, Power, ShieldCheck, Trash2, UserCheck, UserPlus, Users, Wallet } from "lucide-react";
import { ownerRequest, useOwnerData } from "@/stores/owner/api";
import { Button, LinkButton } from "@/app/owner/components/forms";
import { CredentialsDialog, WORKERS, type Credentials } from "@/app/owner/workers/WorkerForms";
import type { Employee, Role } from "@/app/owner/types";
import {
  Avatar,
  Badge,
  Card,
  EmptyState,
  ErrorState,
  PageHeader,
  SearchInput,
  Skeleton,
  StatCard,
  Tabs,
  rwf,
  timeAgo,
  toNumber,
} from "@/app/owner/components/ui";

type Filter = "all" | "active" | "off";

const isActive = (e: Employee) => e.user?.active !== false;

const payText = (e: Employee) =>
  e.payType === "PER_DELIVERY" ? `${rwf(e.perDelivery)} per delivery` : e.salary ? `${rwf(e.salary)} / month` : "No salary set";

const SHIFTS: Record<string, string> = { DAY: "Day", EVENING: "Evening", NIGHT: "Night", HYBRID: "Hybrid" };

function WorkerCard({
  worker,
  onChanged,
  onCredentials,
}: {
  worker: Employee;
  onChanged: () => void;
  onCredentials: (c: Credentials) => void;
}) {
  const active = isActive(worker);
  const [busy, setBusy] = useState<string | null>(null);

  const act = async <T,>(key: string, path: string, init: RequestInit, done: string) => {
    setBusy(key);
    try {
      const result = await ownerRequest<T>(path, init);
      toast.success(done);
      onChanged();
      return result;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save");
      return null;
    } finally {
      setBusy(null);
    }
  };

  const resetPin = async () => {
    const result = await act<{ pin: string }>("pin", `/employees/${worker.id}/reset-pin`, { method: "PATCH" }, "New PIN made");
    if (result?.pin) onCredentials({ name: worker.name, pin: result.pin });
  };

  const setActive = () =>
    act(
      "status",
      `/employees/${worker.id}/status`,
      { method: "PATCH", body: JSON.stringify({ active: !active }) },
      active ? `${worker.name} can no longer sign in` : `${worker.name} can sign in again`,
    );
  return (
    <div className={`rounded-2xl border border-ink/10 bg-white p-5 shadow-[0_1px_2px_rgba(32,40,59,0.04)] ${active ? "" : "opacity-60"}`}>
      <div className="flex items-start gap-4">
        <Avatar name={worker.name} src={worker.profile?.thumbnailUrl ?? worker.profile?.url} size={48} />
        <div className="min-w-0 flex-1">
          <Link href={`${WORKERS}/${worker.id}`} className="block truncate text-[15px] font-bold text-ink hover:underline">
            {worker.name}
          </Link>
          <div className="mt-1 flex flex-wrap gap-1.5">
            <Badge tone="ink">{worker.role?.name ?? "No role"}</Badge>
            {!active && <Badge tone="danger">Deactivated</Badge>}
          </div>
        </div>
      </div>

      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex items-center gap-2 text-ink/70">
          <Phone className="h-3.5 w-3.5 text-ink/40" />
          <a href={`tel:${worker.phone}`} className="truncate hover:text-ink hover:underline">
            {worker.phone || "—"}
          </a>
        </div>
        <div className="flex items-center gap-2 text-ink/70">
          <Mail className="h-3.5 w-3.5 text-ink/40" />
          <a href={`mailto:${worker.email}`} className="truncate hover:text-ink hover:underline">
            {worker.email || "—"}
          </a>
        </div>
      </dl>

      <div className="mt-4 grid grid-cols-3 gap-2 border-t border-ink/6 pt-4 text-xs">
        <div>
          <p className="text-ink/45">Pay</p>
          <p className="mt-0.5 font-semibold text-ink">{payText(worker)}</p>
        </div>
        <div>
          <p className="text-ink/45">Shift</p>
          <p className="mt-0.5 font-semibold text-ink">{SHIFTS[worker.shift] ?? worker.shift}</p>
        </div>
        <div>
          <p className="text-ink/45">Last sign-in</p>
          <p className="mt-0.5 font-semibold text-ink">{timeAgo(worker.user?.lastLoginAt)}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5 border-t border-ink/6 pt-3">
        <LinkButton small tone="outline" icon={Eye} href={`${WORKERS}/${worker.id}`}>
          View
        </LinkButton>
        <LinkButton small tone="quiet" icon={Pencil} href={`${WORKERS}/${worker.id}/edit`}>
          Edit
        </LinkButton>
        {worker.user && (
          <Button small tone="quiet" icon={Power} busy={busy === "status"} onClick={setActive}>
            {active ? "Deactivate" : "Activate"}
          </Button>
        )}
        <Button small tone="quiet" icon={KeyRound} busy={busy === "pin"} onClick={resetPin}>
          New PIN
        </Button>
        <Button
          small
          tone="quiet"
          icon={Trash2}
          busy={busy === "delete"}
          aria-label={`Remove ${worker.name}`}
          title="Remove"
          className="ml-auto px-2.5"
          onClick={() => act("delete", `/employees/${worker.id}/delete`, { method: "DELETE" }, `${worker.name} removed`)}
        />
      </div>
    </div>
  );
}

export default function OwnerWorkers() {
  const workers = useOwnerData<Employee[]>("/employees");
  const roles = useOwnerData<Role[]>("/roles");
  const [filter, setFilter] = useState<Filter>("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [credentials, setCredentials] = useState<Credentials | null>(null);
  const [removingRole, setRemovingRole] = useState<string | null>(null);

  const removeRole = async (role: Role) => {
    setRemovingRole(role.id);
    try {
      await ownerRequest(`/roles/${role.id}/delete`, { method: "DELETE" });
      toast.success(`${role.name} removed`);
      roles.reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not remove the role");
    } finally {
      setRemovingRole(null);
    }
  };

  if (workers.error) return <ErrorState message={workers.error} onRetry={workers.reload} />;

  const all = [...(workers.data ?? [])].sort((a, b) => a.name.localeCompare(b.name));
  const query = search.trim().toLowerCase();
  const visible = all.filter(
    (w) =>
      (filter === "all" || (filter === "active" ? isActive(w) : !isActive(w))) &&
      (roleFilter === "all" || w.role?.id === roleFilter) &&
      (!query || [w.name, w.email, w.phone, w.role?.name].some((v) => v?.toLowerCase().includes(query))),
  );

  const monthly = all.filter((w) => isActive(w) && w.payType !== "PER_DELIVERY").reduce((sum, w) => sum + toNumber(w.salary), 0);
  const perRole = (roleId: string) => all.filter((w) => w.role?.id === roleId).length;
  const payroll = all.reduce((sum, w) => sum + toNumber(w.salary), 0);
  const emptyRoles = (roles.data ?? []).filter((r) => perRole(r.id) === 0).length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Team"
        title="Workers"
        description="Who works for you, their role and pay. Workers sign in on a till with their PIN."
        actions={
          <>
            <LinkButton tone="outline" icon={ShieldCheck} href={`${WORKERS}/roles/new`}>
              Add role
            </LinkButton>
            <LinkButton icon={UserPlus} href={`${WORKERS}/new`}>
              Add worker
            </LinkButton>
          </>
        }
      />

      {workers.loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard tone="dark" label="Employees" value={all.length.toLocaleString()} icon={Users} hint={`${all.filter(isActive).length} active`} />
          <StatCard label="Roles" value={(roles.data ?? []).length.toLocaleString()} icon={ShieldCheck} hint={emptyRoles ? `${emptyRoles} with nobody assigned` : "All roles filled"} />
          <StatCard label="Monthly payroll" value={rwf(monthly)} icon={Wallet} hint="Active workers on a monthly salary" />
          <StatCard label="Average salary" value={rwf(all.length ? Math.round(payroll / all.length) : 0)} icon={BarChart3} hint="Per employee" />
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_300px]">
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Tabs
              options={[
                { value: "all", label: "All", count: all.length },
                { value: "active", label: "Active", count: all.filter(isActive).length },
                { value: "off", label: "Deactivated", count: all.filter((w) => !isActive(w)).length },
              ]}
              value={filter}
              onChange={setFilter}
            />
            <SearchInput value={search} onChange={setSearch} placeholder="Name, phone, email or role" />
          </div>
          {(roles.data ?? []).length > 0 && (
            <div className="flex flex-wrap gap-2">
              {[{ id: "all", name: "All roles" }, ...(roles.data ?? [])].map((r) => {
                const on = roleFilter === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRoleFilter(r.id)}
                    aria-pressed={on}
                    className={`h-8 rounded-full px-3.5 text-xs font-semibold transition-colors ${on ? "bg-ink text-lime" : "bg-white text-ink/65 ring-1 ring-inset ring-ink/12 hover:bg-ivory"}`}
                  >
                    {r.name}
                  </button>
                );
              })}
            </div>
          )}

          {workers.loading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-56" />
              ))}
            </div>
          ) : visible.length === 0 ? (
            <Card>
              <EmptyState icon={UserCheck} title="No workers here" text="Try another filter or search." />
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {visible.map((w) => (
                <WorkerCard
                  key={w.id}
                  worker={w}
                  onChanged={workers.reload}
                  onCredentials={setCredentials}
                />
              ))}
            </div>
          )}
        </div>

        <Card
          title="Roles"
          description="What each kind of worker may do"
          action={
            <LinkButton small tone="outline" icon={Plus} href={`${WORKERS}/roles/new`}>
              Add
            </LinkButton>
          }
        >
          {roles.loading ? (
            <div className="space-y-2 p-5">
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
            </div>
          ) : (roles.data ?? []).length === 0 ? (
            <EmptyState title="No roles yet" />
          ) : (
            <ul className="divide-y divide-ink/6">
              {(roles.data ?? []).map((role) => (
                <li key={role.id} className="px-5 py-3.5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-ink">{role.name}</p>
                    <Badge>
                      {perRole(role.id)} worker{perRole(role.id) === 1 ? "" : "s"}
                    </Badge>
                  </div>
                  <p className="mt-0.5 text-xs text-ink/55">
                    {role.permissions === null || role.permissions === undefined
                      ? "Full access"
                      : `${role.permissions.length} permission${role.permissions.length === 1 ? "" : "s"}`}
                    {role.description ? ` · ${role.description}` : ""}
                  </p>
                  <div className="mt-2 flex gap-1">
                    <LinkButton small tone="outline" icon={Pencil} href={`${WORKERS}/roles/${role.id}`}>
                      Edit
                    </LinkButton>
                    <Button
                      small
                      tone="quiet"
                      icon={Trash2}
                      busy={removingRole === role.id}
                      disabled={perRole(role.id) > 0}
                      title={perRole(role.id) > 0 ? "Give its workers another role first" : undefined}
                      onClick={() => removeRole(role)}
                    >
                      Remove
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {credentials && <CredentialsDialog credentials={credentials} onClose={() => setCredentials(null)} />}
    </div>
  );
}
