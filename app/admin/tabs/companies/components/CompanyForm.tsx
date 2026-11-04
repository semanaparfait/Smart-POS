"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Building2, Check, CheckCircle2, Copy, Plus, UserPlus } from "lucide-react";
import { ownerRequest } from "@/stores/owner/api";
import { CompanyKind, type CompanyTypeResponse } from "@/stores/companies/companyTypes";
import { industryOf } from "@/app/admin/tabs/companies/components/FetchCompany";
import { Button, Field, FormPage, FormSection, LinkButton, PhotoPicker, Select, TextInput } from "@/app/owner/components/forms";
import { usePlatform } from "@/app/admin/components/Platform";

export type CompanyFields = { name: string; type: string; location: string; email: string; phone_number: string; tin: string };

const TYPES = Object.values(CompanyKind).map((k) => ({ value: k, label: industryOf(k).label }));

const blank: CompanyFields = { name: "", type: CompanyKind.RESTAURANT, location: "", email: "", phone_number: "", tin: "" };

export const fieldsOf = (c: Partial<CompanyTypeResponse> & { tin?: string | null }): CompanyFields => ({
  name: c.name ?? "",
  type: c.type ?? CompanyKind.RESTAURANT,
  location: c.location ?? "",
  email: c.email ?? "",
  phone_number: c.phone_number ? String(c.phone_number) : "",
  tin: c.tin ?? "",
});

// The new company's code, to hand to the owner, and what to do next.
function Created({ company, onAnother }: { company: CompanyTypeResponse; onAnother: () => void }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(company.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable */
    }
  };
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="rounded-2xl border border-ink/10 bg-white p-6 shadow-xs sm:p-8">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-lime text-ink">
          <CheckCircle2 className="h-6 w-6" />
        </span>
        <h1 className="mt-5 text-2xl font-bold tracking-[-0.02em] text-ink">{company.name} is on SmartPOS</h1>
        <p className="mt-1 text-sm text-ink/60">Next, add its owner. They sign in with email and a temporary password, then choose their own.</p>
        <div className="mt-6 flex items-center justify-between gap-3 rounded-xl bg-ivory px-4 py-3">
          <span>
            <span className="block text-[11px] font-medium text-ink/50">Company code</span>
            <span className="font-mono text-lg font-semibold tracking-wider text-ink">{company.code}</span>
          </span>
          <Button small tone="outline" icon={copied ? Check : Copy} onClick={copy}>
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          <LinkButton href={`/admin/tabs/users/new?company=${encodeURIComponent(company.code)}`} tone="lime" icon={UserPlus}>
            Add its owner
          </LinkButton>
          <LinkButton href={`/admin/tabs/companies/${company.id}`} tone="outline" icon={Building2}>
            Open the company
          </LinkButton>
          <Button tone="quiet" icon={Plus} onClick={onAnother}>
            Add another company
          </Button>
        </div>
      </div>
    </div>
  );
}

// Adding a company, or editing one when `company` is given.
export default function CompanyForm({ company, initial }: { company?: CompanyTypeResponse & { tin?: string | null }; initial?: Partial<CompanyFields> }) {
  const router = useRouter();
  const platform = usePlatform();
  const start = company ? fieldsOf(company) : { ...blank, ...initial };
  const [form, setForm] = useState<CompanyFields>(start);
  const [logo, setLogo] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [created, setCreated] = useState<CompanyTypeResponse | null>(null);
  const set = (key: keyof CompanyFields) => (value: string) => setForm((f) => ({ ...f, [key]: value }));
  const back = company ? `/admin/tabs/companies/${company.id}` : "/admin/tabs/companies";

  const save = async () => {
    if (!form.name.trim() || !form.location.trim()) return toast.error("The business name and where it is are needed.");
    if (!company && (!form.email.trim() || !form.phone_number.trim())) return toast.error("Add the business's email and phone.");
    setBusy(true);
    try {
      const fields = Object.fromEntries(Object.entries(form).map(([k, v]) => [k, v.trim()])) as CompanyFields;
      if (company) {
        const body = new FormData();
        Object.entries(fields).forEach(([k, v]) => {
          if (v !== String(start[k as keyof CompanyFields]).trim()) body.append(k, v);
        });
        if (logo) body.append("logo", logo, logo.name);
        await ownerRequest(`/companies/${company.id}`, { method: "PATCH", body });
        toast.success("Company saved");
        platform.reload();
        router.push(back);
      } else {
        const { tin, ...rest } = fields;
        const made = await ownerRequest<CompanyTypeResponse>("/companies", { method: "POST", body: JSON.stringify({ ...rest, ...(tin ? { tin } : {}) }) });
        let saved = made;
        if (logo) {
          const body = new FormData();
          body.append("logo", logo, logo.name);
          saved = await ownerRequest<CompanyTypeResponse>(`/companies/${made.id}`, { method: "PATCH", body }).catch(() => {
            toast.error("The company was added, but its logo didn't upload. Add it from Edit.");
            return made;
          });
        }
        toast.success(`${made.name} added`);
        platform.reload();
        setCreated(saved);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save the company");
    } finally {
      setBusy(false);
    }
  };

  if (created)
    return (
      <Created
        company={created}
        onAnother={() => {
          setCreated(null);
          setForm(blank);
          setLogo(null);
        }}
      />
    );

  return (
    <FormPage
      back={back}
      backLabel={company ? company.name : "Companies"}
      eyebrow={company ? "Edit company" : "New company"}
      title={company ? `Edit ${company.name}` : "Register a company"}
      description={company ? "Change the business details the owner and SmartPOS see." : "Add a business to SmartPOS. You get its code to hand to the owner."}
      note={company ? undefined : "Extras and the plan are set on the company's page after this."}
      actions={
        <>
          <Link href={back} className="inline-flex h-10 items-center rounded-xl bg-white px-4 text-sm font-semibold text-ink ring-1 ring-inset ring-ink/15 hover:bg-ivory">
            Cancel
          </Link>
          <Button tone="lime" busy={busy} onClick={save}>
            {company ? "Save changes" : "Add company"}
          </Button>
        </>
      }
    >
      <FormSection title="Business">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="Business name">
              <TextInput value={form.name} onChange={(e) => set("name")(e.target.value)} placeholder="e.g. Inzozi Café" autoFocus />
            </Field>
          </div>
          <Field label="Kind of business">
            <Select value={form.type} onChange={set("type")} options={TYPES} />
          </Field>
          <Field label="Where it is">
            <TextInput value={form.location} onChange={(e) => set("location")(e.target.value)} placeholder="e.g. Kimihurura, Kigali" />
          </Field>
          <Field label="Tax number (TIN)" hint="Optional. Printed on receipts.">
            <TextInput value={form.tin} onChange={(e) => set("tin")(e.target.value)} placeholder="9 digits" inputMode="numeric" />
          </Field>
        </div>
      </FormSection>
      <FormSection title="Contact">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Email">
            <TextInput type="email" value={form.email} onChange={(e) => set("email")(e.target.value)} placeholder="name@business.rw" />
          </Field>
          <Field label="Phone">
            <TextInput type="tel" value={form.phone_number} onChange={(e) => set("phone_number")(e.target.value)} placeholder="07XX XXX XXX" />
          </Field>
        </div>
      </FormSection>
      <FormSection title="Logo" description="Shown in the app, on receipts and here.">
        <PhotoPicker current={company?.logo} file={logo} onChange={setLogo} />
      </FormSection>
    </FormPage>
  );
}
