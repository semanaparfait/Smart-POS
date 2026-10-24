"use client";

import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { Check, CheckCircle2, Copy, KeyRound, Loader2, Mail, Phone, Search, UserRound, X } from "lucide-react";
import useUserStore from "@/stores/users/userStore";
import useCompaniesStore from "@/stores/companies/companystore";
import { UserRole, type UserPayload, type createUserResponse } from "@/stores/users/userTypes";
import { ROLES } from "@/app/admin/tabs/users/components/FetchUsers";
import { CompanyBadge, primaryButton, secondaryButton } from "@/app/admin/components/shared";

const field =
  "h-11 w-full rounded-lg border border-ink/12 bg-white pl-10 pr-3 text-sm text-ink outline-none transition placeholder:text-ink/45 hover:border-ink/25 focus:border-ink/40 focus:ring-4 focus:ring-lime/40";

const EMPTY: UserPayload = { companyCode: "", name: "", email: "", phone: "", role: UserRole.OWNER };

export default function AddUserForm({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) {
  const createUser = useUserStore((s) => s.createUser);
  const companies = useCompaniesStore((s) => s.companies);
  const fetchCompanies = useCompaniesStore((s) => s.fetchCompanies);

  const [form, setForm] = useState<UserPayload>(EMPTY);
  const [companyQuery, setCompanyQuery] = useState("");
  const [companiesFailed, setCompaniesFailed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState<createUserResponse | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchCompanies().catch(() => setCompaniesFailed(true));
  }, [fetchCompanies]);

  const selectedCompany = companies.find((c) => c.code === form.companyCode);

  const companyMatches = useMemo(() => {
    const q = companyQuery.trim().toLowerCase();
    return companies
      .filter((c) => !q || [c.name, c.code, c.location].some((v) => v?.toLowerCase().includes(q)))
      .slice(0, 6);
  }, [companies, companyQuery]);

  const set = (key: keyof UserPayload) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: key === "companyCode" ? e.target.value.toUpperCase() : e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.companyCode || !form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      setError("Please choose a business and fill in every field.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const user = await createUser({ ...form, name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim() });
      if (!user) throw new Error("Please sign in again and retry.");
      toast.success(`${user.name || "User"} added`);
      setCreated(user);
      setForm(EMPTY);
      setCompanyQuery("");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not create the user.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const copyPassword = async () => {
    if (!created?.password) return;
    try {
      await navigator.clipboard.writeText(created.password);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="overflow-hidden rounded-2xl border border-ink/12 bg-white shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-3">
          {/* Step 1: business */}
          <section className="border-b border-ink/6 p-6 lg:border-b-0 lg:border-r">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink/45">Step 1</p>
            <h2 className="mt-1 text-sm font-bold text-ink">Choose the business</h2>
            <p className="mt-1 text-xs text-ink/60">The user will only see this business&apos;s data.</p>

            {selectedCompany ? (
              <div className="mt-4 flex items-center gap-3 rounded-xl bg-ink p-3 text-white">
                <CompanyBadge name={selectedCompany.name} logo={selectedCompany.logo} size="h-10 w-10 text-xs" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold">{selectedCompany.name}</span>
                  <span className="block truncate font-mono text-[11px] text-lime">{selectedCompany.code}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, companyCode: "" }))}
                  className="rounded-md px-2 py-1 text-xs font-semibold text-white/70 hover:bg-white/10 hover:text-white"
                >
                  Change
                </button>
              </div>
            ) : companiesFailed || companies.length === 0 ? (
              <label className="mt-4 block">
                <span className="mb-1.5 block text-xs font-semibold text-ink/80">Business code</span>
                <span className="relative block">
                  <KeyRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/45" />
                  <input value={form.companyCode} onChange={set("companyCode")} placeholder="e.g. SPX-0012" className={`${field} font-mono uppercase`} />
                </span>
                <span className="mt-1.5 block text-[11px] text-ink/45">Find it on the business&apos;s page under Companies.</span>
              </label>
            ) : (
              <div className="mt-4">
                <span className="relative block">
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/45" />
                  <input
                    value={companyQuery}
                    onChange={(e) => setCompanyQuery(e.target.value)}
                    placeholder="Search businesses..."
                    aria-label="Search businesses"
                    className={field}
                  />
                </span>
                <ul className="mt-2 space-y-1" role="listbox" aria-label="Businesses">
                  {companyMatches.map((c) => (
                    <li key={c.id}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={false}
                        onClick={() => setForm((f) => ({ ...f, companyCode: c.code }))}
                        className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-ivory"
                      >
                        <CompanyBadge name={c.name} logo={c.logo} />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[13px] font-semibold text-ink">{c.name}</span>
                          <span className="block truncate text-[11px] text-ink/45">{c.location}</span>
                        </span>
                        <span className="font-mono text-[11px] text-ink/45">{c.code}</span>
                      </button>
                    </li>
                  ))}
                  {companyMatches.length === 0 && <li className="px-2.5 py-3 text-xs text-ink/45">No business matches “{companyQuery}”.</li>}
                </ul>
              </div>
            )}
          </section>

          {/* Step 2: person + role */}
          <section className="p-6 lg:col-span-2">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink/45">Step 2</p>
            <h2 className="mt-1 text-sm font-bold text-ink">Who are you adding?</h2>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="sm:col-span-2">
                <span className="mb-1.5 block text-xs font-semibold text-ink/80">Full name</span>
                <span className="relative block">
                  <UserRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/45" />
                  <input value={form.name} onChange={set("name")} placeholder="e.g. Aline Uwase" autoComplete="off" className={field} />
                </span>
              </label>
              <label>
                <span className="mb-1.5 block text-xs font-semibold text-ink/80">Email</span>
                <span className="relative block">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/45" />
                  <input type="email" value={form.email} onChange={set("email")} placeholder="name@business.rw" autoComplete="off" className={field} />
                </span>
              </label>
              <label>
                <span className="mb-1.5 block text-xs font-semibold text-ink/80">Phone</span>
                <span className="relative block">
                  <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/45" />
                  <input type="tel" value={form.phone} onChange={set("phone")} placeholder="07XX XXX XXX" autoComplete="off" className={field} />
                </span>
              </label>
            </div>

            <fieldset className="mt-5">
              <legend className="mb-2 text-xs font-semibold text-ink/80">Role</legend>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {[UserRole.OWNER, UserRole.EMPLOYEE].map((value) => {
                  const { label, icon: Icon, note } = ROLES[value];
                  const checked = form.role === value;
                  return (
                    <label
                      key={value}
                      className={`flex cursor-pointer items-center gap-3 rounded-xl p-3.5 ring-inset transition-all ${
                        checked ? "bg-ivory ring-2 ring-ink" : "ring-1 ring-ink/12 hover:ring-ink/25"
                      }`}
                    >
                      <input
                        type="radio"
                        name="role"
                        value={value}
                        checked={checked}
                        onChange={() => setForm((f) => ({ ...f, role: value }))}
                        className="sr-only"
                      />
                      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${checked ? "bg-ink text-lime" : "bg-ink/6 text-ink/60"}`}>
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-bold text-ink">{label}</span>
                        <span className="block text-xs text-ink/60">{note}</span>
                      </span>
                      <span className={`flex h-5 w-5 items-center justify-center rounded-full ${checked ? "bg-lime ring-1 ring-ink/30" : "ring-1 ring-inset ring-ink/25"}`}>
                        {checked && <Check className="h-3 w-3 text-ink" strokeWidth={3} />}
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            {error && (
              <p role="alert" className="mt-5 rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">
                {error}
              </p>
            )}
          </section>
        </div>

        <div className="flex flex-col-reverse gap-2.5 border-t border-ink/6 bg-ivory/70 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-ink/60">They&apos;ll get an email to set their own password.</p>
          <div className="flex justify-end gap-2.5">
            <button type="button" onClick={onCancel} disabled={submitting} className={secondaryButton}>
              Cancel
            </button>
            <button type="submit" disabled={submitting} className={primaryButton}>
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {submitting ? "Adding…" : "Add user"}
            </button>
          </div>
        </div>
      </form>

      {/* Created */}
      {created && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/50 p-4 backdrop-blur-sm">
          <div role="dialog" aria-modal="true" aria-labelledby="user-created-title" className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-start gap-4 p-6">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-lime text-ink">
                <CheckCircle2 className="h-6 w-6" />
              </span>
              <div className="min-w-0 flex-1">
                <h2 id="user-created-title" className="text-base font-bold text-ink">
                  {created.name} can now sign in
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-ink/60">
                  We sent a link to <span className="font-semibold text-ink">{created.email}</span> to set their password. Ask them to
                  check their spam folder too.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setCreated(null);
                  onSuccess();
                }}
                aria-label="Close"
                className="rounded-lg p-1.5 text-ink/45 hover:bg-ink/6 hover:text-ink"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <dl className="mx-6 divide-y divide-ink/6 rounded-xl bg-ivory px-4 text-sm">
              <div className="flex justify-between gap-4 py-2.5">
                <dt className="text-ink/60">Role</dt>
                <dd className="font-semibold text-ink">{ROLES[created.role]?.label ?? created.role}</dd>
              </div>
              <div className="flex justify-between gap-4 py-2.5">
                <dt className="text-ink/60">Phone</dt>
                <dd className="font-semibold text-ink">{created.phone}</dd>
              </div>
              {created.password && (
                <div className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-ink/60">Temporary password</dt>
                  <dd className="flex items-center gap-2">
                    <code className="rounded-md bg-white px-2 py-0.5 font-mono text-[13px] font-semibold text-ink ring-1 ring-ink/12">{created.password}</code>
                    <button type="button" onClick={copyPassword} aria-label="Copy password" className="rounded-md p-1 text-ink/45 hover:bg-white hover:text-ink">
                      {copied ? <Check className="h-4 w-4 text-ink" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </dd>
                </div>
              )}
              <div className="flex justify-between gap-4 py-2.5">
                <dt className="text-ink/60">Must change password</dt>
                <dd className="font-semibold text-ink">{created.mustChangePassword ? "Yes, on first sign-in" : "No"}</dd>
              </div>
            </dl>

            <div className="mt-6 flex justify-end border-t border-ink/6 bg-ivory/70 px-6 py-4">
              <button
                type="button"
                onClick={() => {
                  setCreated(null);
                  onSuccess();
                }}
                className={primaryButton}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
