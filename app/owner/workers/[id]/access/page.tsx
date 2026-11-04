"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Check, RotateCcw, Undo2 } from "lucide-react";
import { ownerRequest, useOwnerData } from "@/stores/owner/api";
import type { Employee } from "@/app/owner/types";
import { Button, Field, FormPage, FormPageState, FormSection, MoneyInput } from "@/app/owner/components/forms";
import { ALL_KEYS, PermissionList } from "@/app/owner/workers/PermissionList";
import { WORKERS } from "@/app/owner/workers/WorkerForms";

const KNOWN = new Set(ALL_KEYS);
const same = (a: Set<string>, b: Set<string>) => a.size === b.size && [...a].every((k) => b.has(k));

// What the role gives. A role without a saved list allows everything; no role, nothing.
const roleAccess = (e: Employee) => new Set(!e.role ? [] : Array.isArray(e.role.permissions) ? e.role.permissions : ALL_KEYS);

// The worker's final access, as the server worked it out (null = everything).
const finalAccess = (e: Employee, role: Set<string>) => {
  if (e.permissions === null) return new Set(ALL_KEYS);
  if (Array.isArray(e.permissions)) return new Set(e.permissions);
  // Older server without `permissions`: role + added − removed.
  const removed = new Set(e.removedPermissions ?? []);
  return new Set([...role, ...(e.extraPermissions ?? [])].filter((k) => !removed.has(k)));
};

// What one worker can do. Changes here apply to them only, not the whole role.
function AccessForm({ employee }: { employee: Employee }) {
  const router = useRouter();
  const role = useMemo(() => roleAccess(employee), [employee]);
  const saved = useMemo(() => finalAccess(employee, role), [employee, role]);
  const [access, setAccess] = useState<Set<string>>(saved);
  const savedLimit = employee.creditLimit ? String(Math.round(Number(employee.creditLimit))) : "";
  const [creditLimit, setCreditLimit] = useState(savedLimit);
  const [saving, setSaving] = useState(false);

  // The owner edits the final access; what's added and removed is the difference from the role.
  const added = [...access].filter((k) => !role.has(k) && KNOWN.has(k));
  const removed = [...role].filter((k) => !access.has(k) && KNOWN.has(k));
  const fromRole = [...access].filter((k) => role.has(k) && KNOWN.has(k)).length;
  const sellsOnCredit = access.has("sales.credit");
  const dirty = !same(access, saved) || (sellsOnCredit && creditLimit !== savedLimit);
  const first = employee.name.split(" ")[0];
  const profile = `${WORKERS}/${employee.id}`;

  const save = async () => {
    if (!dirty) return;
    if (sellsOnCredit && !(Number(creditLimit) > 0)) return toast.error("Set a credit limit: the most this worker can give on credit in one sale.");
    setSaving(true);
    try {
      await ownerRequest(`/employees/${employee.id}/permissions`, {
        method: "PATCH",
        body: JSON.stringify({ extraPermissions: added, removedPermissions: removed, ...(sellsOnCredit ? { creditLimit: Number(creditLimit) } : {}) }),
      });
      toast.success(`Access saved. ${first}'s menus update right away.`);
      router.push(profile);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save this worker's access");
      setSaving(false);
    }
  };

  return (
    <FormPage
      back={profile}
      backLabel={employee.name}
      eyebrow="Team · Employees"
      title="Worker access"
      description={`What ${employee.name} can do. Changes here apply to ${first} only, not the whole role.`}
      note={`${fromRole} from role · ${added.length} added · ${removed.length} removed`}
      actions={
        <>
          <Button tone="outline" icon={Undo2} disabled={!dirty || saving} onClick={() => (setAccess(saved), setCreditLimit(savedLimit))}>
            Discard
          </Button>
          <Button icon={Check} busy={saving} disabled={!dirty} onClick={save}>
            {dirty ? "Save access" : "No changes"}
          </Button>
        </>
      }
    >
      <FormSection
        title={employee.role ? `Starts from the ${employee.role.name} role` : "No role"}
        description={employee.role ? "Turn things on or off to give or take away access for this worker." : "Everything turned on here is added for this worker only."}
      >
        <div className="flex flex-wrap items-center gap-3">
          {[
            ["From role", fromRole, "bg-ink/25"],
            ["Added", added.length, "bg-lime"],
            ["Removed", removed.length, "bg-rose-500"],
          ].map(([label, value, dot]) => (
            <span key={label as string} className="inline-flex items-center gap-2 rounded-xl bg-ivory px-3 py-2 text-sm">
              <span className={`h-2 w-2 rounded-full ${dot}`} />
              <span className="text-ink/60">{label}</span>
              <span className="font-bold text-ink">{value}</span>
            </span>
          ))}
          {(added.length > 0 || removed.length > 0) && (
            <Button small tone="quiet" icon={RotateCcw} onClick={() => setAccess(new Set(role))}>
              Same as the role
            </Button>
          )}
        </div>
      </FormSection>
      {sellsOnCredit && (
        <FormSection title="Credit limit" description="Required: the most they can give on credit in one sale. A bigger credit is refused at checkout.">
          <Field label="Most on credit in one sale">
            <MoneyInput value={creditLimit} onChange={setCreditLimit} placeholder="e.g. 20000" />
          </Field>
        </FormSection>
      )}
      <PermissionList value={access} onChange={setAccess} base={role} />
    </FormPage>
  );
}

export default function WorkerAccessPage() {
  const { id } = useParams<{ id: string }>();
  const { data, loading, error, reload } = useOwnerData<Employee>(`/employees/${id}`);
  if (!data) return <FormPageState back={`${WORKERS}/${id}`} backLabel="Worker" loading={loading} error={error} onRetry={reload} />;
  return <AccessForm key={data.id} employee={data} />;
}
