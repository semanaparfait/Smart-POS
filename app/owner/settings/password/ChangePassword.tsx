"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Check, CheckCircle2, Circle, Eye, EyeOff } from "lucide-react";
import useAuthStore from "@/stores/auth/authstore";
import { ownerRequest } from "@/stores/owner/api";
import { Button, Field, FormPage, FormSection, TextInput } from "@/app/owner/components/forms";

// Same minimum the server enforces.
const MIN_LENGTH = 8;
const EMPTY = { current: "", next: "", confirm: "" };

function Rule({ ok, label }: { ok: boolean; label: string }) {
  return (
    <p className={`flex items-center gap-2 text-xs ${ok ? "text-emerald-700" : "text-ink/50"}`}>
      {ok ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
      {label}
    </p>
  );
}

// The password used to sign in with your email.
// Used by owners and by the super admin. After a temporary password is replaced,
// it goes on to `home`.
export default function ChangePassword({ back, backLabel, eyebrow, home }: { back: string; backLabel: string; eyebrow: string; home: string }) {
  const router = useRouter();
  const fetchMe = useAuthStore((s) => s.fetchMe);
  const mustChange = useAuthStore((s) => s.user?.mustChangePassword);
  const [form, setForm] = useState(EMPTY);
  const [visible, setVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const longEnough = form.next.length >= MIN_LENGTH;
  const different = !!form.next && form.next !== form.current;
  const matches = !!form.confirm && form.confirm === form.next;
  const canSave = !!form.current && longEnough && different && matches;

  const save = async () => {
    if (!canSave) return toast.error("Fill in every field and meet all the rules below.");
    setSaving(true);
    try {
      await ownerRequest("/auth/change-password", { method: "PATCH", body: JSON.stringify({ currentPassword: form.current, newPassword: form.next }) });
      setForm(EMPTY);
      // Clears "must change password" on the account.
      await fetchMe();
      toast.success("Password changed. Use it next time you sign in.");
      if (mustChange) router.push(home);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not change your password");
    } finally {
      setSaving(false);
    }
  };

  const field = (key: keyof typeof EMPTY, label: string, placeholder: string, isNew: boolean) => (
    <Field label={label}>
      <TextInput
        type={visible ? "text" : "password"}
        autoComplete={isNew ? "new-password" : "current-password"}
        value={form[key]}
        placeholder={placeholder}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        onKeyDown={(e) => key === "confirm" && e.key === "Enter" && save()}
      />
    </Field>
  );

  return (
    <FormPage
      back={back}
      backLabel={backLabel}
      eyebrow={eyebrow}
      title="Change password"
      description="The password you use to sign in with your email."
      actions={
        <>
          <Button tone="outline" disabled={saving} onClick={() => setForm(EMPTY)}>
            Clear
          </Button>
          <Button icon={Check} busy={saving} onClick={save}>
            Change password
          </Button>
        </>
      }
    >
      {mustChange && <p className="rounded-2xl bg-lime/40 px-4 py-3 text-sm text-ink">Choose your own password before you go on.</p>}
      <FormSection title="New password">
        <div className="flex justify-end">
          <Button small tone="quiet" icon={visible ? EyeOff : Eye} onClick={() => setVisible((v) => !v)}>
            {visible ? "Hide passwords" : "Show passwords"}
          </Button>
        </div>
        {field("current", "Current password", "Your current password", false)}
        {field("next", "New password", `At least ${MIN_LENGTH} characters`, true)}
        {field("confirm", "Confirm new password", "Type it again", true)}
        <div className="space-y-1.5">
          <Rule ok={longEnough} label={`At least ${MIN_LENGTH} characters`} />
          <Rule ok={different} label="Different from your current password" />
          <Rule ok={matches} label="Both new passwords match" />
        </div>
      </FormSection>
    </FormPage>
  );
}
