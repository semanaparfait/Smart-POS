"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ownerRequest, useOwnerData } from "@/stores/owner/api";
import type { UserResponse } from "@/stores/users/userTypes";
import { Button, Field, FormPage, FormPageState, FormSection, Switch, TextInput } from "@/app/owner/components/forms";

type Fields = { name: string; email: string; phone: string; active: boolean };

function EditUser({ user }: { user: UserResponse }) {
  const router = useRouter();
  const back = `/admin/tabs/users/${user.id}`;
  const start: Fields = { name: user.name ?? "", email: user.email ?? "", phone: user.phone ?? "", active: user.active };
  const [form, setForm] = useState<Fields>(start);
  const [busy, setBusy] = useState(false);
  const worker = user.role === "EMPLOYEE";

  const save = async () => {
    if (!form.name.trim()) return toast.error("Add their name.");
    if (!worker && !form.email.trim()) return toast.error("Add their email. They sign in with it.");
    const body: Partial<Fields> = {};
    if (form.name.trim() !== start.name) body.name = form.name.trim();
    if (!worker && form.email.trim() !== start.email) body.email = form.email.trim();
    if (form.phone.trim() !== start.phone) body.phone = form.phone.trim();
    if (form.active !== start.active) body.active = form.active;
    if (!Object.keys(body).length) return router.push(back);
    setBusy(true);
    try {
      await ownerRequest(`/user/${user.id}`, { method: "PATCH", body: JSON.stringify(body) });
      toast.success("Account saved");
      router.push(back);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save");
      setBusy(false);
    }
  };

  return (
    <FormPage
      back={back}
      backLabel={user.name || "User"}
      eyebrow="Edit account"
      title={`Edit ${user.name || "this account"}`}
      description={user.company?.name ? `Signs in to ${user.company.name}.` : "A SmartPOS account."}
      actions={
        <>
          <Link href={back} className="inline-flex h-10 items-center rounded-xl bg-white px-4 text-sm font-semibold text-ink ring-1 ring-inset ring-ink/15 hover:bg-ivory">
            Cancel
          </Link>
          <Button tone="lime" busy={busy} onClick={save}>
            Save changes
          </Button>
        </>
      }
    >
      <FormSection title="Person">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="Full name">
              <TextInput value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoFocus />
            </Field>
          </div>
          <Field label="Email" hint={worker ? "A worker's email is changed by the owner on their worker page." : "They sign in with this email."}>
            <TextInput type="email" value={form.email} disabled={worker} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </Field>
          <Field label="Phone">
            <TextInput type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </Field>
        </div>
      </FormSection>
      <FormSection title="Access">
        <Switch
          checked={form.active}
          onChange={(active) => setForm({ ...form, active })}
          label="Can sign in"
          hint="Off signs them out everywhere at once. Nothing is deleted."
        />
      </FormSection>
    </FormPage>
  );
}

export default function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const user = useOwnerData<UserResponse>(`/user/${id}`);
  if (!user.data) return <FormPageState back={`/admin/tabs/users/${id}`} backLabel="User" loading={user.loading} error={user.error} onRetry={user.reload} />;
  return <EditUser key={user.data.updatedAt} user={user.data} />;
}
