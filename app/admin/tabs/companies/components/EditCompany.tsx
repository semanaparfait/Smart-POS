"use client";

import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Loader2, X } from "lucide-react";
import useCompaniesStore from "@/stores/companies/companystore";
import { CompanyKind, type CompanyTypeResponse } from "@/stores/companies/companyTypes";
import { industryOf } from "@/app/admin/tabs/companies/components/FetchCompany";

type Form = { name: string; type: string; location: string; email: string; phone_number: string };

const field =
  "h-10 w-full rounded-lg border border-ink/12 bg-white px-3 text-sm text-ink outline-none transition placeholder:text-ink/45 hover:border-ink/25 focus:border-ink/40 focus:ring-4 focus:ring-lime/40";

export default function EditCompany({
  company,
  onClose,
  onSaved,
}: {
  company: CompanyTypeResponse;
  onClose: () => void;
  onSaved: (company: CompanyTypeResponse) => void;
}) {
  const updateCompany = useCompaniesStore((state) => state.updateCompany);
  const firstField = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<Form>({
    name: company.name ?? "",
    type: company.type ?? CompanyKind.RESTAURANT,
    location: company.location ?? "",
    email: company.email ?? "",
    phone_number: company.phone_number ? String(company.phone_number) : "",
  });

  useEffect(() => {
    firstField.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !saving && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, saving]);

  const set = (key: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.location.trim()) {
      setError("Business name and location are required.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const updated = await updateCompany(company.id, {
        name: form.name.trim(),
        type: form.type as CompanyKind,
        location: form.location.trim(),
        email: form.email.trim(),
        phone_number: form.phone_number.trim(),
      });
      toast.success("Company updated");
      onSaved({ ...company, ...updated });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save changes.");
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/50 p-4 backdrop-blur-sm"
      onPointerDown={(e) => e.target === e.currentTarget && !saving && onClose()}
    >
      <form
        onSubmit={handleSubmit}
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-company-title"
        className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-ink/6 px-6 py-5">
          <div>
            <h2 id="edit-company-title" className="text-lg font-bold tracking-[-0.01em] text-ink">
              Edit company
            </h2>
            <p className="mt-0.5 text-sm text-ink/60">Update {company.name}&apos;s business details.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-ink/45 transition-colors hover:bg-ink/6 hover:text-ink disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 px-6 py-5 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className="mb-1.5 block text-xs font-semibold text-ink/80">Business name *</span>
            <input ref={firstField} value={form.name} onChange={set("name")} className={field} required />
          </label>

          <label>
            <span className="mb-1.5 block text-xs font-semibold text-ink/80">Industry *</span>
            <select value={form.type} onChange={set("type")} className={`${field} cursor-pointer`}>
              {Object.values(CompanyKind).map((kind) => (
                <option key={kind} value={kind}>
                  {industryOf(kind).label}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="mb-1.5 block text-xs font-semibold text-ink/80">Location *</span>
            <input value={form.location} onChange={set("location")} placeholder="e.g. Kimihurura, Kigali" className={field} required />
          </label>

          <label>
            <span className="mb-1.5 block text-xs font-semibold text-ink/80">Email</span>
            <input type="email" value={form.email} onChange={set("email")} placeholder="name@business.rw" className={field} />
          </label>

          <label>
            <span className="mb-1.5 block text-xs font-semibold text-ink/80">Phone</span>
            <input type="tel" value={form.phone_number} onChange={set("phone_number")} placeholder="07XX XXX XXX" className={field} />
          </label>

          {error && (
            <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 sm:col-span-2">
              {error}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2.5 border-t border-ink/6 bg-ivory/70 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-ink/80 ring-1 ring-inset ring-ink/12 transition-colors hover:bg-white disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-lime px-4 py-2 text-sm font-semibold text-ink shadow-sm transition-colors hover:bg-lime-dark disabled:opacity-70"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
