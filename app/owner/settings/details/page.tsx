"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Check, Undo2 } from "lucide-react";
import useAuthStore from "@/stores/auth/authstore";
import { ownerRequest } from "@/stores/owner/api";
import type { superadminType } from "@/stores/auth/AuthTypes";
import { Button, Choices, Field, FormPage, FormPageState, FormSection, PhotoPicker, TextInput } from "@/app/owner/components/forms";

const COMPANY_TYPES = ["RESTAURANT", "BAR", "HOTEL", "SUPERMARKET", "PHARMACY", "SHOP"] as const;
const TYPE_OPTIONS = COMPANY_TYPES.map((value) => ({ value, label: value.charAt(0) + value.slice(1).toLowerCase() }));
const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "rw", label: "Ikinyarwanda" },
  { value: "fr", label: "Français" },
  { value: "sw", label: "Kiswahili" },
];

type Person = { name: string; phone: string; email: string };
type Company = { name: string; type: string; email: string; phone_number: string; location: string; tin: string; maxHoldMinutes: string };

const personFrom = (u: superadminType): Person => ({ name: u.name ?? "", phone: u.phone ?? "", email: u.email ?? "" });
const companyFrom = (u: superadminType): Company => ({
  name: u.company?.name ?? "",
  type: u.company?.type ?? "",
  email: u.company?.email ?? "",
  phone_number: u.company?.phone_number ?? "",
  location: u.company?.location ?? "",
  tin: u.company?.tin ?? "",
  maxHoldMinutes: String(u.company?.maxHoldMinutes ?? 60),
});

// Only the fields that changed, trimmed, so unchanged values aren't checked again.
function changedFields<T extends Record<string, string>>(form: T, original: T) {
  const changes: Partial<T> = {};
  (Object.keys(form) as (keyof T)[]).forEach((key) => {
    const value = form[key].trim();
    if (value !== original[key].trim()) changes[key] = value as T[keyof T];
  });
  return changes;
}

const toForm = (fields: Record<string, string | number>, fileKey: string, file: File | null) => {
  const form = new FormData();
  Object.entries(fields).forEach(([k, v]) => form.append(k, String(v)));
  if (file) form.append(fileKey, file, file.name);
  return form;
};

// Your own profile, your language, and the business details.
function DetailsForm({ user }: { user: superadminType }) {
  const fetchMe = useAuthStore((s) => s.fetchMe);
  const [person, setPerson] = useState(personFrom(user));
  const [company, setCompany] = useState(companyFrom(user));
  const [picture, setPicture] = useState<File | null>(null);
  const [logo, setLogo] = useState<File | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [language, setLanguage] = useState(user.language ?? "en");
  const [busy, setBusy] = useState<string | null>(null);

  const originalPerson = personFrom(user);
  const originalCompany = companyFrom(user);
  const personChanges = changedFields(person, originalPerson);
  const companyChanges = changedFields(company, originalCompany);
  const personDirty = Object.keys(personChanges).length > 0 || !!picture;
  const companyDirty = Object.keys(companyChanges).length > 0 || !!logo;
  const emailChanged = personChanges.email !== undefined;

  const savePerson = async () => {
    if (!person.name.trim() || !person.phone.trim() || !person.email.trim()) return toast.error("Name, phone and email are required.");
    if (emailChanged && !currentPassword) return toast.error("Enter your current password to change your email.");
    setBusy("person");
    try {
      await ownerRequest("/auth/me", { method: "PATCH", body: toForm({ ...personChanges, ...(emailChanged ? { currentPassword } : {}) }, "picture", picture) });
      await fetchMe();
      setPicture(null);
      setCurrentPassword("");
      toast.success("Profile saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save");
    } finally {
      setBusy(null);
    }
  };

  const saveLanguage = async (value: string) => {
    setLanguage(value);
    try {
      await ownerRequest("/auth/me", { method: "PATCH", body: toForm({ language: value }, "picture", null) });
      toast.success(`Language: ${LANGUAGES.find((l) => l.value === value)?.label}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save");
    }
  };

  const saveCompany = async () => {
    if (!company.name.trim() || !company.email.trim() || !company.phone_number.trim() || !company.location.trim()) return toast.error("Name, email, phone and address are required.");
    const { maxHoldMinutes, ...details } = companyChanges;
    const changes: Record<string, string | number> = { ...(details as Record<string, string>) };
    if (maxHoldMinutes !== undefined) {
      const minutes = Number(maxHoldMinutes);
      if (!Number.isInteger(minutes) || minutes < 1 || minutes > 240) return toast.error("Use a number of minutes from 1 to 240 for the hold time.");
      changes.maxHoldMinutes = minutes;
    }
    setBusy("company");
    try {
      await ownerRequest(`/companies/${user.company!.id}`, { method: "PATCH", body: toForm(changes, "logo", logo) });
      await fetchMe();
      setLogo(null);
      toast.success("Company details saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save");
    } finally {
      setBusy(null);
    }
  };

  return (
    <FormPage
      back="/owner/company"
      backLabel="Company profile"
      eyebrow="Settings"
      title="Edit details"
      description="Update your own profile and your business details."
      actions={<span className="text-xs text-ink/55">Each part saves on its own.</span>}
    >
      <FormSection title="Your profile" description="How you appear in the app">
        <PhotoPicker current={user.picture?.thumbnailUrl ?? user.picture?.url} file={picture} onChange={setPicture} round />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Full name">
            <TextInput value={person.name} onChange={(e) => setPerson({ ...person, name: e.target.value })} placeholder="John Doe" />
          </Field>
          <Field label="Phone">
            <TextInput type="tel" value={person.phone} onChange={(e) => setPerson({ ...person, phone: e.target.value })} placeholder="+250 788 000 000" />
          </Field>
          <Field label="Email">
            <TextInput type="email" value={person.email} onChange={(e) => setPerson({ ...person, email: e.target.value })} placeholder="you@example.com" />
          </Field>
        </div>
        {emailChanged && (
          <Field label="Current password" hint="Needed to change your email">
            <TextInput type="password" autoComplete="current-password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
          </Field>
        )}
        <div className="flex justify-end gap-2">
          <Button tone="outline" icon={Undo2} disabled={!personDirty || busy === "person"} onClick={() => (setPerson(originalPerson), setPicture(null), setCurrentPassword(""))}>
            Discard
          </Button>
          <Button icon={Check} busy={busy === "person"} disabled={!personDirty} onClick={savePerson}>
            {personDirty ? "Save profile" : "No changes"}
          </Button>
        </div>
      </FormSection>

      <FormSection title="Language" description="Saved on your account. The app shows itself in it.">
        <Choices value={language} onChange={saveLanguage} options={LANGUAGES} />
      </FormSection>

      {user.company && (
        <FormSection title="Company" description="Seen by staff and on receipts">
          <PhotoPicker current={user.company.logo} file={logo} onChange={setLogo} />
          <Field label="Business name">
            <TextInput value={company.name} onChange={(e) => setCompany({ ...company, name: e.target.value })} placeholder="My Restaurant" />
          </Field>
          <Field label="Type of business">
            <Choices value={company.type} onChange={(type) => setCompany({ ...company, type })} options={TYPE_OPTIONS} />
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Business email">
              <TextInput type="email" value={company.email} onChange={(e) => setCompany({ ...company, email: e.target.value })} placeholder="hello@business.com" />
            </Field>
            <Field label="Business phone">
              <TextInput type="tel" value={company.phone_number} onChange={(e) => setCompany({ ...company, phone_number: e.target.value })} placeholder="+250 788 000 000" />
            </Field>
          </div>
          <Field label="Address">
            <TextInput value={company.location} onChange={(e) => setCompany({ ...company, location: e.target.value })} placeholder="KN 4 Ave, Kigali" />
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="TIN" hint="Printed on your receipts">
              <TextInput inputMode="numeric" maxLength={20} value={company.tin} onChange={(e) => setCompany({ ...company, tin: e.target.value })} />
            </Field>
            <Field label="Longest hold for a sale (minutes)" hint="Workers can't keep a sale on hold longer than this.">
              <TextInput inputMode="numeric" maxLength={3} value={company.maxHoldMinutes} onChange={(e) => setCompany({ ...company, maxHoldMinutes: e.target.value.replace(/[^0-9]/g, "") })} />
            </Field>
          </div>
          <div className="flex justify-end gap-2">
            <Button tone="outline" icon={Undo2} disabled={!companyDirty || busy === "company"} onClick={() => (setCompany(originalCompany), setLogo(null))}>
              Discard
            </Button>
            <Button icon={Check} busy={busy === "company"} disabled={!companyDirty} onClick={saveCompany}>
              {companyDirty ? "Save company" : "No changes"}
            </Button>
          </div>
        </FormSection>
      )}
    </FormPage>
  );
}

export default function EditDetailsPage() {
  const user = useAuthStore((s) => s.user);
  if (!user) return <FormPageState back="/owner/company" backLabel="Company profile" loading error={null} onRetry={() => {}} />;
  // Keyed by save time, so the form refills from what was saved.
  return <DetailsForm key={user.updatedAt} user={user} />;
}
