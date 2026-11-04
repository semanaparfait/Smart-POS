"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ArrowLeft, Briefcase, Building2, ChevronRight, KeyRound, Pencil, Phone, Power, ShieldCheck, Smartphone, Trash2 } from "lucide-react";
import { ownerRequest, useOwnerData } from "@/stores/owner/api";
import type { Employee } from "@/app/owner/types";
import { Avatar, Card, ErrorState, Skeleton, formatDate, rwf } from "@/app/owner/components/ui";
import { Button, LinkButton } from "@/app/owner/components/forms";
import { CredentialsDialog, WORKERS, type Credentials } from "@/app/owner/workers/WorkerForms";

const SHIFTS: Record<string, string> = { DAY: "Day", EVENING: "Evening", NIGHT: "Night", HYBRID: "Hybrid" };

// Whole months between two dates, for "time with the company".
const tenure = (from?: string) => {
  if (!from) return "—";
  const start = new Date(from);
  const now = new Date();
  const months = (now.getFullYear() - start.getFullYear()) * 12 + now.getMonth() - start.getMonth();
  if (months < 1) return "Less than a month";
  if (months < 12) return `${months} month${months === 1 ? "" : "s"}`;
  const years = Math.floor(months / 12);
  const rest = months % 12;
  return `${years} year${years === 1 ? "" : "s"}${rest ? ` ${rest} mo` : ""}`;
};

function InfoCard({ icon: Icon, title, rows }: { icon: React.ComponentType<{ className?: string }>; title: string; rows: { label: string; value?: string | null; mono?: boolean }[] }) {
  return (
    <Card>
      <div className="flex items-center gap-2.5 border-b border-ink/6 px-5 py-4">
        <Icon className="h-4 w-4 text-ink/55" />
        <h2 className="text-sm font-bold text-ink">{title}</h2>
      </div>
      <dl className="divide-y divide-ink/6">
        {rows.map((r) => (
          <div key={r.label} className="flex justify-between gap-4 px-5 py-2.5 text-sm">
            <dt className="text-ink/55">{r.label}</dt>
            <dd className={`truncate text-right font-semibold text-ink ${r.mono ? "font-mono text-xs" : ""}`}>{r.value || "—"}</dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}

function Profile({ employee, onSaved }: { employee: Employee; onSaved: (e: Employee) => void }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [credentials, setCredentials] = useState<Credentials | null>(null);
  const active = employee.user?.active !== false;
  const first = employee.name.split(" ")[0];
  const multipleDevices = employee.user?.allowMultipleDevices === true;
  const added = employee.extraPermissions?.length ?? 0;
  const removed = employee.removedPermissions?.length ?? 0;

  const run = async <T,>(key: string, path: string, init: RequestInit, done: string) => {
    setBusy(key);
    try {
      const result = await ownerRequest<T>(path, init);
      toast.success(done);
      return result;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not change this");
      return null;
    } finally {
      setBusy(null);
    }
  };

  // One tap, no confirmation: it's easy to undo.
  const toggleActive = async () => {
    const updated = await run<Employee>(
      "status",
      `/employees/${employee.id}/status`,
      { method: "PATCH", body: JSON.stringify({ active: !active }) },
      active ? `${employee.name} deactivated. They're signed out and can't sign in.` : `${employee.name} activated. They can sign in again.`,
    );
    if (updated?.id) onSaved(updated);
  };
  // Switching off signs them out everywhere but their latest device.
  const toggleDevices = async () => {
    const updated = await run<Employee>(
      "devices",
      `/employees/${employee.id}/multiple-devices`,
      { method: "PATCH", body: JSON.stringify({ allow: !multipleDevices }) },
      multipleDevices ? `One device only: ${first} stays signed in only on the device they used last.` : `Multiple devices allowed: ${first} can be signed in on several tills.`,
    );
    if (updated?.id) onSaved(updated);
  };
  const newPin = async () => {
    const result = await run<{ pin: string }>("pin", `/employees/${employee.id}/reset-pin`, { method: "PATCH" }, "New PIN made");
    if (result?.pin) setCredentials({ name: employee.name, pin: result.pin });
  };
  const remove = async () => {
    const ok = await run("delete", `/employees/${employee.id}/delete`, { method: "DELETE" }, `${employee.name} removed`);
    if (ok !== null) router.push(WORKERS);
  };
  const photo = employee.profile?.thumbnailUrl ?? employee.profile?.url;

  return (
    <div className="space-y-6">
      <Link href={WORKERS} className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink/55 hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Workers
      </Link>
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-ink/45">Team · Employees</p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-[-0.02em] text-ink md:text-[28px]">Employee profile</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          {employee.user && (
            <Button tone="outline" icon={Power} busy={busy === "status"} onClick={toggleActive}>
              {active ? "Deactivate" : "Activate"}
            </Button>
          )}
          <Button tone="outline" icon={KeyRound} busy={busy === "pin"} onClick={newPin}>
            New PIN
          </Button>
          <Button tone="danger" icon={Trash2} busy={busy === "delete"} onClick={remove}>
            Delete
          </Button>
          <LinkButton icon={Pencil} href={`${WORKERS}/${employee.id}/edit`}>
            Edit
          </LinkButton>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-5 rounded-2xl bg-ink p-6 text-white">
        <Avatar name={employee.name} src={photo} size={72} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-xl font-extrabold">{employee.name}</p>
          <p className="truncate text-sm text-white/60">{employee.email}</p>
          <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-bold">
            <span className="rounded-full bg-lime px-2.5 py-0.5 text-ink">{employee.role?.name ?? "No role"}</span>
            {employee.user && (
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 ${active ? "bg-white/10" : "bg-white text-rose-700"}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-emerald-400" : "bg-rose-600"}`} />
                {active ? "Active" : "Deactivated"}
              </span>
            )}
            {SHIFTS[employee.shift] && <span className="rounded-full bg-white/10 px-2.5 py-0.5">{SHIFTS[employee.shift]} shift</span>}
          </div>
        </div>
        <div className="flex gap-8">
          <div>
            <p className="text-xs text-white/50">{employee.payType === "PER_DELIVERY" ? "Per delivery" : "Monthly salary"}</p>
            <p className="text-xl font-extrabold text-lime">{employee.payType === "PER_DELIVERY" ? rwf(employee.perDelivery) : rwf(employee.salary)}</p>
          </div>
          <div>
            <p className="text-xs text-white/50">With the company</p>
            <p className="text-xl font-extrabold">{tenure(employee.createdAt)}</p>
          </div>
        </div>
      </div>

      <Link href={`${WORKERS}/${employee.id}/access`} className="flex items-center gap-4 rounded-2xl border border-ink/10 bg-white p-5 hover:bg-ivory/60">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-ivory">
          <ShieldCheck className="h-4.5 w-4.5 text-ink" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-bold text-ink">Worker access</span>
          <span className="block text-xs text-ink/55">
            {added + removed === 0 ? `Same as the ${employee.role?.name ?? "role"} role` : `${employee.role?.name ?? "No role"} role · ${added} added · ${removed} removed`}
          </span>
        </span>
        <ChevronRight className="h-4 w-4 text-ink/35" />
      </Link>

      {employee.user && (
        <button
          type="button"
          role="switch"
          aria-checked={multipleDevices}
          disabled={busy === "devices"}
          onClick={toggleDevices}
          className="flex w-full items-center gap-4 rounded-2xl border border-ink/10 bg-white p-5 text-left hover:bg-ivory/60 disabled:opacity-60"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-ivory">
            <Smartphone className="h-4.5 w-4.5 text-ink" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-bold text-ink">Signed in on several tills</span>
            <span className="block text-xs text-ink/55">
              {multipleDevices
                ? `${first} can stay signed in on several tills. Turning this off keeps them signed in only on the device they used last.`
                : `Signing in on another till signs ${first} out of the one before.`}
            </span>
          </span>
          <span className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${multipleDevices ? "bg-ink" : "bg-ink/15"}`}>
            <span className={`h-4.5 w-4.5 rounded-full shadow-sm transition-transform ${multipleDevices ? "translate-x-5.5 bg-lime" : "translate-x-1 bg-white"}`} />
          </span>
        </button>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <InfoCard
          icon={Phone}
          title="Contact"
          rows={[
            { label: "Phone", value: employee.phone },
            { label: "Email", value: employee.email },
          ]}
        />
        <InfoCard
          icon={Briefcase}
          title="Role & assignment"
          rows={[
            { label: "Role", value: employee.role?.name },
            { label: "Responsibility", value: employee.role?.description },
            { label: "Shift", value: SHIFTS[employee.shift] },
            { label: "Status", value: employee.user ? (active ? "Active" : "Deactivated") : "No login" },
            { label: "Last sign-in", value: employee.user?.lastLoginAt ? formatDate(employee.user.lastLoginAt) : null },
            { label: "Joined", value: formatDate(employee.createdAt) },
            { label: "Last updated", value: formatDate(employee.updatedAt) },
            { label: "Employee ID", value: employee.id, mono: true },
          ]}
        />
        <InfoCard
          icon={Building2}
          title="Company"
          rows={[
            { label: "Employer", value: employee.company?.name },
            { label: "Business code", value: employee.company?.code, mono: true },
            { label: "Type", value: employee.company?.type },
            { label: "Location", value: employee.company?.location },
            { label: "Email", value: employee.company?.email },
            { label: "Phone", value: employee.company?.phone_number },
          ]}
        />
      </div>
      {credentials && <CredentialsDialog credentials={credentials} onClose={() => setCredentials(null)} />}
    </div>
  );
}

export default function WorkerProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { data, loading, error, reload } = useOwnerData<Employee>(`/employees/${id}`);
  const [saved, setSaved] = useState<Employee | null>(null);
  const employee = saved?.id === id ? { ...data, ...saved } : data;
  if (error && !employee) return <ErrorState message={error} onRetry={reload} />;
  if (!employee) return loading ? <Skeleton className="h-96" /> : null;
  return <Profile employee={employee as Employee} onSaved={setSaved} />;
}
