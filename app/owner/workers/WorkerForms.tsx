"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Check, Copy, KeyRound, ShieldCheck, UserPlus } from "lucide-react";
import { ownerRequest } from "@/stores/owner/api";
import type { Employee, Role } from "@/app/owner/types";
import { toNumber } from "@/app/owner/components/ui";
import { BackButton, Button, Choices, Field, FormPage, FormSection, MoneyInput, PhotoPicker, Select, TextInput } from "@/app/owner/components/forms";
import { ROLE_PRESETS, withRequirements } from "@/app/owner/permissions";
import { ALL_KEYS, PermissionList } from "@/app/owner/workers/PermissionList";

type Shift = "DAY" | "EVENING" | "NIGHT" | "HYBRID";
type PayType = "MONTHLY" | "PER_DELIVERY";

const SHIFTS: { value: Shift; label: string }[] = [
  { value: "DAY", label: "Day" },
  { value: "EVENING", label: "Evening" },
  { value: "NIGHT", label: "Night" },
  { value: "HYBRID", label: "Hybrid" },
];

export const isRiderRole = (role?: Role | null) => !!role?.permissions?.includes("deliveries.ride");

export interface Credentials {
  name: string;
  pin?: string;
  password?: string;
}

export const WORKERS = "/owner/workers";

// The PIN and password, shown once: SmartPOS never shows them again.
export function CredentialsDialog({ credentials, onClose }: { credentials: Credentials; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4" role="dialog" aria-modal="true">
      <CredentialsCard credentials={credentials} onDone={onClose} />
    </div>
  );
}

export function CredentialsCard({ credentials, onDone }: { credentials: Credentials; onDone: () => void }) {
  const copy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success("Copied");
    } catch {
      /* clipboard unavailable */
    }
  };
  const row = (label: string, value?: string) =>
    value ? (
      <div className="flex items-center justify-between gap-3 border-b border-white/10 py-3 last:border-0">
        <span className="text-xs font-semibold text-white/55">{label}</span>
        <button type="button" onClick={() => copy(value)} className="inline-flex items-center gap-2 font-mono text-lg font-bold tracking-widest text-lime">
          {value}
          <Copy className="h-3.5 w-3.5 text-white/40" />
        </button>
      </div>
    ) : null;

  return (
    <div className="w-full max-w-md rounded-3xl bg-ink p-6 text-white shadow-2xl">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-lime text-ink">
          <KeyRound className="h-6 w-6" />
        </span>
        <h2 className="mt-4 text-xl font-extrabold">{credentials.name}&apos;s sign-in</h2>
        <p className="mt-1 text-sm text-white/60">Shown only now. Write them down or share them before closing.</p>
        <div className="mt-4 rounded-2xl bg-white/5 px-4 ring-1 ring-inset ring-white/10">
          {row("PIN", credentials.pin)}
          {row("Password", credentials.password)}
        </div>
        <button type="button" onClick={onDone} className="mt-5 h-12 w-full rounded-xl bg-lime text-sm font-bold text-ink hover:bg-lime-dark">
          Done
        </button>
    </div>
  );
}

// The page for adding or changing a worker. Paid per delivery shows only for
// riders. A new worker's PIN and password show on the page after saving.
export function WorkerForm({ worker, roles, startRoleId }: { worker: Employee | null; roles: Role[]; startRoleId?: string }) {
  const router = useRouter();
  const [created, setCreated] = useState<Credentials | null>(null);
  const [name, setName] = useState(worker?.name ?? "");
  const [email, setEmail] = useState(worker?.email ?? "");
  const [phone, setPhone] = useState(worker?.phone ?? "");
  const [roleId, setRoleId] = useState(worker?.role?.id ?? (roles.some((r) => r.id === startRoleId) ? startRoleId! : (roles[0]?.id ?? "")));
  const [shift, setShift] = useState<Shift>((worker?.shift as Shift) ?? "DAY");
  const [payType, setPayType] = useState<PayType>(worker?.payType ?? "MONTHLY");
  const [salary, setSalary] = useState(worker?.salary ? String(worker.salary) : "");
  const [perDelivery, setPerDelivery] = useState(worker?.perDelivery ? String(Math.round(toNumber(worker.perDelivery))) : "");
  const [photo, setPhoto] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const rider = isRiderRole(roles.find((r) => r.id === roleId));
  const perDeliveryPay = rider && payType === "PER_DELIVERY";

  const save = async () => {
    if (!name.trim() || !email.trim() || !phone.trim()) return toast.error("Name, email and phone are needed");
    if (!roleId) return toast.error("Choose a role");
    if (perDeliveryPay && !(Number(perDelivery) > 0)) return toast.error("Enter the pay for each delivery");
    setSaving(true);
    const pay = {
      salary: perDeliveryPay ? 0 : Number(salary) || 0,
      payType: perDeliveryPay ? "PER_DELIVERY" : "MONTHLY",
      ...(perDeliveryPay ? { perDelivery: Number(perDelivery) } : {}),
    };
    try {
      if (worker) {
        await ownerRequest(`/employees/${worker.id}`, {
          method: "PATCH",
          body: JSON.stringify({ name: name.trim(), email: email.trim(), phone: phone.trim(), roleId, shift, ...pay }),
        });
        toast.success(`${name.trim()} saved`);
        router.push(`${WORKERS}/${worker.id}`);
      } else {
        const form = new FormData();
        form.append("name", name.trim());
        form.append("email", email.trim());
        form.append("phone", phone.trim());
        form.append("roleId", roleId);
        form.append("shift", shift);
        form.append("salary", String(pay.salary));
        form.append("payType", pay.payType);
        if (pay.perDelivery) form.append("perDelivery", String(pay.perDelivery));
        if (photo) form.append("picture", photo, photo.name);
        const result = await ownerRequest<{ pin?: string; password?: string }>("/employees", { method: "POST", body: form });
        toast.success(`${name.trim()} added`);
        if (result?.pin || result?.password) setCreated({ name: name.trim(), pin: result.pin, password: result.password });
        else router.push(WORKERS);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save");
    } finally {
      setSaving(false);
    }
  };

  if (created)
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center py-6">
        <CredentialsCard credentials={created} onDone={() => router.push(WORKERS)} />
      </div>
    );

  return (
    <FormPage
      back={worker ? `${WORKERS}/${worker.id}` : WORKERS}
      backLabel={worker ? worker.name : "Workers"}
      eyebrow="Team"
      title={worker ? `Edit ${worker.name}` : "Add a worker"}
      description={worker ? "Change their details, role or pay." : "They sign in on a till with the PIN shown after saving."}
      actions={
        <>
          <BackButton href={worker ? `${WORKERS}/${worker.id}` : WORKERS} />
          <Button onClick={save} busy={saving} icon={worker ? Check : UserPlus}>
            {worker ? "Save" : "Add worker"}
          </Button>
        </>
      }
    >
      <FormSection title="Who they are">
        {!worker && <PhotoPicker file={photo} onChange={setPhoto} round />}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Full name">
            <TextInput value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          </Field>
          <Field label="Email">
            <TextInput type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          <Field label="Phone">
            <TextInput type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="07…" />
          </Field>
        </div>
      </FormSection>
      <FormSection title="Work and pay">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Role">
            <Select value={roleId} onChange={setRoleId} options={roles.length ? roles.map((r) => ({ value: r.id, label: r.name })) : [{ value: "", label: "Add a role first" }]} />
          </Field>
          <Field label="Shift">
            <Choices value={shift} onChange={setShift} options={SHIFTS} />
          </Field>
        </div>
        {rider && (
          <Field label="How is this worker paid?">
            <Choices
              value={payType}
              onChange={setPayType}
              options={[
                { value: "MONTHLY", label: "Monthly salary" },
                { value: "PER_DELIVERY", label: "Per delivery" },
              ]}
            />
          </Field>
        )}
        {perDeliveryPay ? (
          <Field label="Paid for each delivery" hint={Number(perDelivery) > 0 ? `Example: 40 deliveries = ${(40 * Number(perDelivery)).toLocaleString()} RWF that month` : "Payroll counts the deliveries they made each month."}>
            <MoneyInput value={perDelivery} onChange={setPerDelivery} />
          </Field>
        ) : (
          <Field label="Monthly salary">
            <MoneyInput value={salary} onChange={setSalary} />
          </Field>
        )}
      </FormSection>
    </FormPage>
  );
}

// The page for making or changing a role: a name and its switches. Turning one
// on turns on what it needs; turning one off turns off what depends on it.
export function RoleForm({ role }: { role: Role | null }) {
  const router = useRouter();
  const [name, setName] = useState(role?.name ?? "");
  const [description, setDescription] = useState(role?.description ?? "");
  // A role saved without a list allows everything, so every switch starts on.
  const [keys, setKeys] = useState<Set<string>>(() =>
    withRequirements(role && (role.permissions === null || role.permissions === undefined) ? ALL_KEYS : role?.permissions ?? []),
  );
  const [saving, setSaving] = useState(false);


  const save = async () => {
    if (!name.trim()) return toast.error("Give the role a name, e.g. Cashier");
    setSaving(true);
    try {
      await ownerRequest(role ? `/roles/${role.id}` : "/roles", {
        method: role ? "PATCH" : "POST",
        body: JSON.stringify({ name: name.trim(), description: description.trim(), permissions: [...keys] }),
      });
      toast.success(role ? `${name.trim()} saved` : `${name.trim()} added`);
      router.push(WORKERS);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save the role");
      setSaving(false);
    }
  };

  return (
    <FormPage
      back={WORKERS}
      backLabel="Workers"
      eyebrow="Roles"
      title={role ? `Edit ${role.name}` : "Add a role"}
      description="What workers with this role may do. Everyone with it gets the change at once."
      note={`${keys.size} ${keys.size === 1 ? "switch" : "switches"} on`}
      actions={
        <>
          <BackButton href={WORKERS} />
          <Button onClick={save} busy={saving} icon={ShieldCheck}>
            {role ? "Save role" : "Add role"}
          </Button>
        </>
      }
    >
      <FormSection title="Role">
        {!role && (
          <div>
            <p className="mb-2 text-xs font-semibold text-ink">Start from</p>
            <div className="flex flex-wrap gap-2">
              {ROLE_PRESETS.map((preset) => (
                <Button
                  key={preset.name}
                  small
                  tone="outline"
                  onClick={() => {
                    setName(preset.name);
                    setDescription(preset.description);
                    setKeys(withRequirements(preset.permissions));
                  }}
                >
                  {preset.name}
                </Button>
              ))}
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Name">
            <TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Cashier" />
          </Field>
          <Field label="Description (optional)">
            <TextInput value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What they do" />
          </Field>
        </div>

        {role && (role.permissions === null || role.permissions === undefined) && (
          <p className="rounded-xl bg-lime/30 px-3 py-2 text-xs text-ink">This role was saved before switches existed and allows everything, so every switch is on. Turn off what it shouldn&apos;t do.</p>
        )}
      </FormSection>

      <PermissionList value={keys} onChange={setKeys} />
    </FormPage>
  );
}
