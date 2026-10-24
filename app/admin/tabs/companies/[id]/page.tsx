"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import useCompaniesStore from "@/stores/companies/companystore";
import type { CompanyTypeResponse } from "@/stores/companies/companyTypes";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowUpRight,
  Calendar,
  Check,
  Clock,
  Copy,
  Fingerprint,
  Hash,
  Mail,
  MapPin,
  MonitorSmartphone,
  Pencil,
  Phone,
  Receipt,
  RotateCw,
  Store,
  Users,
} from "lucide-react";
import { industryOf } from "@/app/admin/tabs/companies/components/FetchCompany";
import EditCompany from "@/app/admin/tabs/companies/components/EditCompany";

const formatDate = (value?: string, withTime = false) => {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  });
};

const timeAgo = (value?: string) => {
  const days = value ? Math.floor((Date.now() - new Date(value).getTime()) / 86_400_000) : NaN;
  if (Number.isNaN(days) || days < 0) return "";
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months > 1 ? "s" : ""} ago`;
  const years = Math.floor(months / 12);
  return `${years} year${years > 1 ? "s" : ""} ago`;
};

/** Rwandan 9-digit numbers (e.g. 788123456) dial as +250… */
const telHref = (phone: string) => {
  const digits = phone.replace(/[^\d+]/g, "");
  if (/^7\d{8}$/.test(digits)) return `tel:+250${digits}`;
  if (/^07\d{8}$/.test(digits)) return `tel:+250${digits.slice(1)}`;
  return `tel:${digits}`;
};

const initials = (name?: string) =>
  (name ?? "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "C";

type LoadState = "loading" | "ready" | "error";

export default function CompanyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const fetchSingleCompany = useCompaniesStore((state) => state.fetchSingleCompany);

  const [company, setCompany] = useState<CompanyTypeResponse | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [errorText, setErrorText] = useState("");
  const [editing, setEditing] = useState(false);
  const [copied, setCopied] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!id) return;
    let alive = true;

    fetchSingleCompany(id)
      .then((data) => {
        if (!alive) return;
        if (data) {
          setCompany(data);
          setLoadState("ready");
        } else {
          setErrorText("Please sign in again to view this company.");
          setLoadState("error");
        }
      })
      .catch((err: unknown) => {
        if (!alive) return;
        setErrorText(err instanceof Error ? err.message : "Failed to load company details.");
        setLoadState("error");
      });

    return () => {
      alive = false;
    };
  }, [id, fetchSingleCompany, attempt]);

  const retry = () => {
    setLoadState("loading");
    setAttempt((n) => n + 1);
  };

  const copy = async (key: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      setTimeout(() => setCopied((current) => (current === key ? "" : current)), 1800);
    } catch {
      /* clipboard unavailable */
    }
  };

  const backLink = (
    <Link
      href="/admin/tabs/companies"
      className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-ink/60 transition-colors hover:text-ink"
    >
      <ArrowLeft className="h-4 w-4" />
      Companies
    </Link>
  );

  if (loadState === "loading") {
    return (
      <div className="space-y-6" aria-busy="true">
        {backLink}
        <div className="animate-pulse overflow-hidden rounded-2xl border border-ink/12 bg-white">
          <div className="h-28 bg-ink/6" />
          <div className="flex items-end gap-5 px-6 pb-6">
            <div className="-mt-10 h-20 w-20 rounded-2xl bg-ink/12 ring-4 ring-white" />
            <div className="flex-1 space-y-2 pb-1">
              <div className="h-5 w-1/3 rounded bg-ink/6" />
              <div className="h-3.5 w-1/4 rounded bg-ink/6" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="h-72 animate-pulse rounded-2xl bg-white lg:col-span-2" />
          <div className="h-72 animate-pulse rounded-2xl bg-white" />
        </div>
      </div>
    );
  }

  if (loadState === "error" || !company) {
    return (
      <div className="space-y-6">
        {backLink}
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-ink/25 bg-white px-6 py-14 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-500">
            <AlertTriangle className="h-6 w-6" />
          </span>
          <h1 className="mt-4 text-base font-bold text-ink">Couldn&apos;t load this company</h1>
          <p className="mt-1 max-w-sm text-sm text-ink/60">{errorText || "The company may have been removed."}</p>
          <button
            type="button"
            onClick={retry}
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-lime px-4 py-2 text-sm font-semibold text-ink hover:bg-lime-dark"
          >
            <RotateCw className="h-4 w-4" />
            Try again
          </button>
        </div>
      </div>
    );
  }

  const industry = industryOf(company.type);
  const IndustryIcon = industry.icon;
  const phone = company.phone_number ? String(company.phone_number) : "";

  const profile = [
    { key: "location", label: "Location", value: company.location, icon: MapPin },
    { key: "email", label: "Email", value: company.email, icon: Mail, href: company.email ? `mailto:${company.email}` : "", copy: true },
    { key: "phone", label: "Phone", value: phone, icon: Phone, href: phone ? telHref(phone) : "", copy: true },
    { key: "industry", label: "Industry", value: industry.label, icon: IndustryIcon },
  ];

  const modules = [
    { label: "Branches", icon: Store },
    { label: "POS devices", icon: MonitorSmartphone },
    { label: "Staff", icon: Users },
    { label: "Sales", icon: Receipt },
  ];

  return (
    <div className="space-y-6 pb-10">
      {backLink}

      {/* Profile header */}
      <section className="overflow-hidden rounded-2xl border border-ink/12 bg-white shadow-xs">
        <div className="relative h-28 bg-ink">
          <div
            className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.12)_1px,transparent_1px)] bg-size-[16px_16px] mask-[linear-gradient(to_left,black,transparent_85%)]"
            aria-hidden="true"
          />
          <span className="absolute right-6 top-5 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold text-white/80 ring-1 ring-inset ring-white/15">
            <IndustryIcon className="h-3.5 w-3.5" />
            {industry.label}
          </span>
        </div>

        <div className="flex flex-col gap-5 px-6 pb-6 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            {company.logo ? (
              // eslint-disable-next-line @next/next/no-img-element -- logos come from arbitrary hosts
              <img
                src={company.logo}
                alt=""
                className="relative z-10 -mt-10 h-20 w-20 shrink-0 rounded-2xl bg-white object-cover shadow-md ring-4 ring-white"
              />
            ) : (
              <span className="relative z-10 -mt-10 flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-white text-2xl font-extrabold tracking-wide text-ink shadow-md ring-4 ring-white">
                {initials(company.name)}
              </span>
            )}

            <div className="min-w-0 pb-0.5">
              <h1 className="truncate text-2xl font-bold tracking-[-0.02em] text-ink">{company.name}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-ink/60">
                {company.code && (
                  <button
                    type="button"
                    onClick={() => copy("code", company.code)}
                    title="Copy registration code"
                    className="inline-flex items-center gap-1.5 rounded-md bg-ivory px-2 py-0.5 font-mono text-xs font-semibold text-ink/80 ring-1 ring-inset ring-ink/12 transition-colors hover:bg-ink/6"
                  >
                    <Hash className="h-3 w-3 text-ink/45" />
                    {company.code}
                    {copied === "code" ? <Check className="h-3 w-3 text-ink" /> : <Copy className="h-3 w-3 text-ink/45" />}
                  </button>
                )}
                {company.location && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-ink/45" />
                    {company.location}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-ink/45" />
                  Joined {formatDate(company.createdAt)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {company.email && (
              <a
                href={`mailto:${company.email}`}
                className="inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold text-ink/80 ring-1 ring-inset ring-ink/12 transition-colors hover:bg-ivory hover:text-ink"
              >
                <Mail className="h-4 w-4" />
                Email
              </a>
            )}
            {phone && (
              <a
                href={telHref(phone)}
                className="inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold text-ink/80 ring-1 ring-inset ring-ink/12 transition-colors hover:bg-ivory hover:text-ink"
              >
                <Phone className="h-4 w-4" />
                Call
              </a>
            )}
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-lime px-4 py-2 text-sm font-semibold text-ink shadow-sm transition-colors hover:bg-lime-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime focus-visible:ring-offset-2"
            >
              <Pencil className="h-4 w-4" />
              Edit company
            </button>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Business profile */}
          <section className="rounded-2xl border border-ink/12 bg-white shadow-xs">
            <header className="flex items-center justify-between border-b border-ink/6 px-6 py-4">
              <h2 className="text-sm font-bold text-ink">Business profile</h2>
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="text-xs font-semibold text-ink/60 transition-colors hover:text-ink"
              >
                Edit
              </button>
            </header>
            <dl className="grid grid-cols-1 sm:grid-cols-2">
              {profile.map(({ key, label, value, icon: Icon, href, copy: canCopy }, i) => (
                <div
                  key={key}
                  className={`group flex items-start gap-3.5 px-6 py-5 ${i >= 2 ? "border-t border-ink/6" : ""} ${
                    i % 2 === 1 ? "sm:border-l" : ""
                  } ${i === 1 ? "border-t border-ink/6 sm:border-t-0" : ""}`}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ink/6 text-ink/60">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <dt className="text-xs font-semibold text-ink/45">{label}</dt>
                    <dd className="mt-0.5 flex items-center gap-2">
                      {!value ? (
                        <span className="text-sm italic text-ink/45">Not provided</span>
                      ) : href ? (
                        <a href={href} className="truncate text-sm font-semibold text-ink hover:underline">
                          {value}
                        </a>
                      ) : (
                        <span className="truncate text-sm font-semibold text-ink">{value}</span>
                      )}
                      {canCopy && value && (
                        <button
                          type="button"
                          onClick={() => copy(key, value)}
                          aria-label={`Copy ${label.toLowerCase()}`}
                          className="rounded p-1 text-ink/25 opacity-0 transition hover:bg-ink/6 hover:text-ink/80 focus:opacity-100 group-hover:opacity-100"
                        >
                          {copied === key ? <Check className="h-3.5 w-3.5 text-ink" /> : <Copy className="h-3.5 w-3.5" />}
                        </button>
                      )}
                    </dd>
                  </div>
                </div>
              ))}
            </dl>
          </section>

          {/* Operations — not provided by the API yet */}
          <section className="rounded-2xl border border-ink/12 bg-white shadow-xs">
            <header className="border-b border-ink/6 px-6 py-4">
              <h2 className="text-sm font-bold text-ink">Operations</h2>
              <p className="mt-0.5 text-xs text-ink/60">Live figures will appear here once they are connected.</p>
            </header>
            <ul className="grid grid-cols-2 gap-3 p-6 md:grid-cols-4">
              {modules.map(({ label, icon: Icon }) => (
                <li key={label} className="rounded-xl border border-dashed border-ink/12 bg-ivory/60 p-4">
                  <Icon className="h-5 w-5 text-ink/45" />
                  <p className="mt-3 text-sm font-semibold text-ink/80">{label}</p>
                  <p className="mt-0.5 text-[11px] font-medium text-ink/45">Not connected yet</p>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Record */}
        <aside className="space-y-6">
          <section className="rounded-2xl border border-ink/12 bg-white shadow-xs">
            <header className="border-b border-ink/6 px-6 py-4">
              <h2 className="text-sm font-bold text-ink">Record</h2>
            </header>
            <dl className="divide-y divide-ink/6">
              <div className="flex items-start gap-3 px-6 py-4">
                <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-ink/45" />
                <div>
                  <dt className="text-xs font-semibold text-ink/45">Registered</dt>
                  <dd className="text-sm font-semibold text-ink">{formatDate(company.createdAt, true)}</dd>
                  <dd className="text-xs text-ink/60">{timeAgo(company.createdAt)}</dd>
                </div>
              </div>
              <div className="flex items-start gap-3 px-6 py-4">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-ink/45" />
                <div>
                  <dt className="text-xs font-semibold text-ink/45">Last updated</dt>
                  <dd className="text-sm font-semibold text-ink">{formatDate(company.updatedAt, true)}</dd>
                  <dd className="text-xs text-ink/60">{timeAgo(company.updatedAt)}</dd>
                </div>
              </div>
              <div className="flex items-start gap-3 px-6 py-4">
                <Fingerprint className="mt-0.5 h-4 w-4 shrink-0 text-ink/45" />
                <div className="min-w-0 flex-1">
                  <dt className="text-xs font-semibold text-ink/45">Internal ID</dt>
                  <dd className="mt-1 flex items-center gap-2">
                    <code className="min-w-0 flex-1 truncate rounded-md bg-ivory px-2 py-1 font-mono text-[11px] text-ink/70 ring-1 ring-inset ring-ink/12">
                      {company.id}
                    </code>
                    <button
                      type="button"
                      onClick={() => copy("id", company.id)}
                      aria-label="Copy internal ID"
                      className="rounded-md p-1.5 text-ink/45 transition-colors hover:bg-ink/6 hover:text-ink"
                    >
                      {copied === "id" ? <Check className="h-3.5 w-3.5 text-ink" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </dd>
                </div>
              </div>
            </dl>
          </section>

          {company.location && (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(company.location)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between gap-3 rounded-2xl border border-ink/12 bg-white px-6 py-4 shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <span className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink text-lime">
                  <MapPin className="h-4 w-4" />
                </span>
                <span>
                  <span className="block text-sm font-bold text-ink">View on map</span>
                  <span className="block max-w-48 truncate text-xs text-ink/60">{company.location}</span>
                </span>
              </span>
              <ArrowUpRight className="h-4 w-4 text-ink/45 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink" />
            </a>
          )}
        </aside>
      </div>

      {editing && (
        <EditCompany
          company={company}
          onClose={() => setEditing(false)}
          onSaved={(updated) => {
            setCompany(updated);
            setEditing(false);
          }}
        />
      )}
    </div>
  );
}
