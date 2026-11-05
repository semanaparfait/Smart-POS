"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Bug, Check, KeyRound } from "lucide-react";
import * as Sentry from "@sentry/nextjs";
import useAuthStore from "@/stores/auth/authstore";
import { ownerRequest } from "@/stores/owner/api";
import type { superadminType } from "@/stores/auth/AuthTypes";
import { Button, Field, FormPage, FormSection, LinkButton, PhotoPicker, TextInput } from "@/app/owner/components/forms";

type Fields = { name: string; phone: string; email: string };
const fieldsOf = (u: superadminType): Fields => ({ name: u.name ?? "", phone: u.phone ?? "", email: u.email ?? "" });

// Sends a test error from the website and from the server, to see that both
// reach Sentry.
function ErrorTrackingCheck() {
  const [busy, setBusy] = useState<"web" | "server" | null>(null);
  const websiteOn = !!process.env.NEXT_PUBLIC_SENTRY_DSN;

  const testWebsite = () => {
    if (!websiteOn) return toast.error("Error tracking isn't set up on the website. Add NEXT_PUBLIC_SENTRY_DSN and redeploy.");
    setBusy("web");
    Sentry.captureException(new Error(`SmartPOS test error from the website (${new Date().toISOString()})`));
    void Sentry.flush(3000).finally(() => {
      setBusy(null);
      toast.success("Sent. In Sentry, open smartpos-website, then Issues.");
    });
  };

  const testServer = async () => {
    setBusy("server");
    try {
      await ownerRequest("/system/test-error", { method: "POST" });
      toast.error("The server didn't fail as expected. Is it updated?");
    } catch {
      toast.success("Sent. In Sentry, open smartpos-server, then Issues. Nothing there? Check SENTRY_DSN on the server.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <FormSection title="Check error tracking" description="Sends a harmless test error to Sentry. It should appear there within a minute.">
      <div className="flex flex-wrap gap-2">
        <Button tone="outline" icon={Bug} busy={busy === "web"} onClick={testWebsite}>
          Test the website
        </Button>
        <Button tone="outline" icon={Bug} busy={busy === "server"} onClick={testServer}>
          Test the server
        </Button>
      </div>
      {!websiteOn && <p className="text-xs text-ink/55">Website error tracking is off: NEXT_PUBLIC_SENTRY_DSN isn&apos;t set.</p>}
    </FormSection>
  );
}

// The super admin's own account: name, phone, email, picture.
function Profile({ user }: { user: superadminType }) {
  const fetchMe = useAuthStore((s) => s.fetchMe);
  const start = fieldsOf(user);
  const [form, setForm] = useState<Fields>(start);
  const [picture, setPicture] = useState<File | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const emailChanged = form.email.trim() !== start.email;
  const changes = (Object.keys(form) as (keyof Fields)[]).filter((k) => form[k].trim() !== start[k]);

  const save = async () => {
    if (!form.name.trim() || !form.email.trim()) return toast.error("Your name and email are needed.");
    if (!changes.length && !picture) return toast("Nothing to save");
    if (emailChanged && !currentPassword) return toast.error("Enter your current password to change your email.");
    setBusy(true);
    try {
      const body = new FormData();
      changes.forEach((k) => body.append(k, form[k].trim()));
      if (emailChanged) body.append("currentPassword", currentPassword);
      if (picture) body.append("picture", picture, picture.name);
      await ownerRequest("/auth/me", { method: "PATCH", body });
      await fetchMe();
      setPicture(null);
      setCurrentPassword("");
      toast.success("Profile saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save");
    } finally {
      setBusy(false);
    }
  };

  return (
    <FormPage
      back="/admin"
      backLabel="Dashboard"
      eyebrow="My account"
      title="My profile"
      description="How you appear in SmartPOS, and the email you sign in with."
      actions={
        <>
          <LinkButton href="/admin/tabs/profile/password" tone="outline" icon={KeyRound}>
            Change password
          </LinkButton>
          <Button tone="lime" icon={Check} busy={busy} onClick={save}>
            Save profile
          </Button>
        </>
      }
    >
      <FormSection title="Picture">
        <PhotoPicker round current={user.picture?.thumbnailUrl ?? user.picture?.url} file={picture} onChange={setPicture} />
      </FormSection>
      <FormSection title="You">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="Full name">
              <TextInput value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Field>
          </div>
          <Field label="Email" hint="You sign in with this.">
            <TextInput type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </Field>
          <Field label="Phone">
            <TextInput type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </Field>
          {emailChanged && (
            <div className="sm:col-span-2">
              <Field label="Current password" hint="Needed to change the email you sign in with.">
                <TextInput type="password" autoComplete="current-password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
              </Field>
            </div>
          )}
        </div>
      </FormSection>
      <ErrorTrackingCheck />
    </FormPage>
  );
}

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  if (!user) return <div className="mx-auto h-64 max-w-3xl animate-pulse rounded-2xl bg-white" />;
  return <Profile key={user.updatedAt ?? user.id} user={user} />;
}
