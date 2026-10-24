"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowUpRight,
  Briefcase,
  CalendarDays,
  Check,
  Clock,
  Copy,
  Fingerprint,
  KeyRound,
  Loader2,
  LogIn,
  Mail,
  MapPin,
  Phone,
  RotateCw,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import useUserStore from "@/stores/users/userStore";
import type { UserResponse } from "@/stores/users/userTypes";
import { RolePill, StatusDot, roleOf } from "@/app/admin/tabs/users/components/FetchUsers";
import { industryOf } from "@/app/admin/tabs/companies/components/FetchCompany";
import { CompanyBadge, InitialsAvatar, formatDate, primaryButton, secondaryButton, timeAgo } from "@/app/admin/components/shared";

type LoadState = "loading" | "ready" | "error";

/** Rwandan 9/10-digit numbers dial as +250… */
const telHref = (phone: string) => {
  const digits = phone.replace(/[^\d+]/g, "");
  if (/^7\d{8}$/.test(digits)) return `tel:+250${digits}`;
  if (/^07\d{8}$/.test(digits)) return `tel:+250${digits.slice(1)}`;
  return `tel:${digits}`;
};

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const fetchUserById = useUserStore((s) => s.fetchUserById);
  const deleteUser = useUserStore((s) => s.deleteUser);

  const [user, setUser] = useState<UserResponse | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [errorText, setErrorText] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [copied, setCopied] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    let alive = true;
    fetchUserById(id)
      .then((data) => {
        if (!alive) return;
        if (data) {
          setUser(data);
          setLoadState("ready");
        } else {
          setErrorText("Please sign in again to view this user.");
          setLoadState("error");
        }
      })
      .catch((err: unknown) => {
        if (!alive) return;
        setErrorText(err instanceof Error ? err.message : "Failed to load the user.");
        setLoadState("error");
      });
    return () => {
      alive = false;
    };
  }, [id, fetchUserById, attempt]);

  useEffect(() => {
    if (!confirmDelete) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !deleting && setConfirmDelete(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [confirmDelete, deleting]);

  const retry = () => {
    setLoadState("loading");
    setAttempt((n) => n + 1);
  };

  const copy = async (key: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      setTimeout(() => setCopied((c) => (c === key ? "" : c)), 1800);
    } catch {
      /* clipboard unavailable */
    }
  };

  const handleDelete = async () => {
    if (!user) return;
    setDeleting(true);
    try {
      await deleteUser(user.id);
      toast.success(`${user.name || "User"} deleted`);
      router.push("/admin/tabs/users");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete the user");
      setDeleting(false);
    }
  };

  const backLink = (
    <Link href="/admin/tabs/users" className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-ink/60 transition-colors hover:text-ink">
      <ArrowLeft className="h-4 w-4" />
      Users
    </Link>
  );

  if (loadState === "loading") {
    return (
      <div className="space-y-6" aria-busy="true">
        {backLink}
        <div className="h-40 animate-pulse rounded-2xl border border-ink/12 bg-white" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="h-72 animate-pulse rounded-2xl bg-white lg:col-span-2" />
          <div className="h-72 animate-pulse rounded-2xl bg-white" />
        </div>
      </div>
    );
  }

  if (loadState === "error" || !user) {
    return (
      <div className="space-y-6">
        {backLink}
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-ink/20 bg-white px-6 py-14 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-500">
            <AlertTriangle className="h-6 w-6" />
          </span>
          <h1 className="mt-4 text-base font-bold text-ink">Couldn&apos;t load this user</h1>
          <p className="mt-1 max-w-sm text-sm text-ink/60">{errorText || "The user may have been removed."}</p>
          <button type="button" onClick={retry} className={`${primaryButton} mt-5`}>
            <RotateCw className="h-4 w-4" />
            Try again
          </button>
        </div>
      </div>
    );
  }

  const role = roleOf(user.role);
  const company = user.company;
  const employee = user.employee;

  const account: { label: string; value: string; sub?: string; icon: LucideIcon }[] = [
    { label: "Role", value: role.label, sub: role.note, icon: role.icon },
    {
      label: "Last sign-in",
      value: user.lastLoginAt ? formatDate(user.lastLoginAt, true) : "Never",
      sub: user.lastLoginAt ? timeAgo(user.lastLoginAt) : "Hasn't signed in yet",
      icon: LogIn,
    },
    {
      label: "Password",
      value: user.mustChangePassword ? "Must be changed" : "Set by the user",
      sub: user.mustChangePassword ? "Required at next sign-in" : undefined,
      icon: KeyRound,
    },
    { label: "Added", value: formatDate(user.createdAt, true), sub: timeAgo(user.createdAt), icon: CalendarDays },
  ];

  return (
    <div className="space-y-6 pb-10">
      {backLink}

      {/* Header */}
      <section className="overflow-hidden rounded-2xl border border-ink/12 bg-white shadow-xs">
        <div className="relative h-24 bg-ink">
          <div
            className="absolute inset-0 bg-[radial-gradient(rgba(208,230,107,0.22)_1px,transparent_1px)] bg-size-[16px_16px] mask-[linear-gradient(to_left,black,transparent_80%)]"
            aria-hidden="true"
          />
        </div>
        <div className="flex flex-col gap-5 px-6 pb-6 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="relative z-10 -mt-10 rounded-2xl ring-4 ring-white">
              <InitialsAvatar name={user.name} size="h-20 w-20 text-2xl" muted={!user.active} />
            </div>
            <div className="min-w-0 pb-0.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="truncate text-2xl font-bold tracking-[-0.02em] text-ink">{user.name || "Unnamed user"}</h1>
                <RolePill role={user.role} />
                <StatusDot active={user.active} />
              </div>
              <p className="mt-1.5 text-sm text-ink/60">
                {company?.name ? (
                  <>
                    {role.label} at{" "}
                    <Link href={`/admin/tabs/companies/${company.id}`} className="font-semibold text-ink hover:underline">
                      {company.name}
                    </Link>
                  </>
                ) : (
                  role.note
                )}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {user.email && (
              <a href={`mailto:${user.email}`} className={secondaryButton}>
                <Mail className="h-4 w-4" />
                Email
              </a>
            )}
            {user.phone && (
              <a href={telHref(user.phone)} className={secondaryButton}>
                <Phone className="h-4 w-4" />
                Call
              </a>
            )}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Contact */}
          <section className="rounded-2xl border border-ink/12 bg-white shadow-xs">
            <header className="border-b border-ink/6 px-6 py-4">
              <h2 className="text-sm font-bold text-ink">Contact</h2>
            </header>
            <dl className="grid grid-cols-1 sm:grid-cols-2">
              {[
                { key: "email", label: "Email", value: user.email, icon: Mail, href: user.email ? `mailto:${user.email}` : "" },
                { key: "phone", label: "Phone", value: user.phone, icon: Phone, href: user.phone ? telHref(user.phone) : "" },
              ].map(({ key, label, value, icon: Icon, href }, i) => (
                <div key={key} className={`group flex items-start gap-3.5 px-6 py-5 ${i === 1 ? "border-t border-ink/6 sm:border-l sm:border-t-0" : ""}`}>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ink/6 text-ink/60">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <dt className="text-xs font-semibold text-ink/45">{label}</dt>
                    <dd className="mt-0.5 flex items-center gap-2">
                      {value ? (
                        <a href={href} className="truncate text-sm font-semibold text-ink hover:underline">{value}</a>
                      ) : (
                        <span className="text-sm italic text-ink/45">Not provided</span>
                      )}
                      {value && (
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

          {/* Account */}
          <section className="rounded-2xl border border-ink/12 bg-white shadow-xs">
            <header className="border-b border-ink/6 px-6 py-4">
              <h2 className="text-sm font-bold text-ink">Account</h2>
            </header>
            <dl className="grid grid-cols-1 sm:grid-cols-2">
              {account.map(({ label, value, sub, icon: Icon }, i) => (
                <div
                  key={label}
                  className={`flex items-start gap-3.5 px-6 py-5 ${i >= 1 ? "border-t border-ink/6" : ""} ${i === 1 ? "sm:border-t-0" : ""} ${
                    i % 2 === 1 ? "sm:border-l" : ""
                  }`}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ink/6 text-ink/60">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <dt className="text-xs font-semibold text-ink/45">{label}</dt>
                    <dd className="mt-0.5 text-sm font-semibold text-ink">{value}</dd>
                    {sub && <dd className="text-xs text-ink/60">{sub}</dd>}
                  </div>
                </div>
              ))}
            </dl>
          </section>

          {/* Employee record, when linked */}
          {employee && (
            <section className="rounded-2xl border border-ink/12 bg-white shadow-xs">
              <header className="flex items-center gap-2 border-b border-ink/6 px-6 py-4">
                <Briefcase className="h-4 w-4 text-ink/45" />
                <h2 className="text-sm font-bold text-ink">Employee record</h2>
              </header>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-4 px-6 py-5 text-sm sm:grid-cols-4">
                {[
                  ["Name", employee.name],
                  ["Shift", employee.shift],
                  ["Salary", employee.salary != null ? `RWF ${Number(employee.salary).toLocaleString("en-US")}` : ""],
                  ["Phone", employee.phone],
                ].map(([label, value]) => (
                  <div key={label} className="min-w-0">
                    <dt className="text-xs font-semibold text-ink/45">{label}</dt>
                    <dd className={`mt-0.5 truncate font-semibold ${value ? "text-ink" : "italic font-normal text-ink/45"}`}>{value || "—"}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}
        </div>

        <aside className="space-y-6">
          {/* Business */}
          <section className="rounded-2xl border border-ink/12 bg-white shadow-xs">
            <header className="border-b border-ink/6 px-6 py-4">
              <h2 className="text-sm font-bold text-ink">Business</h2>
            </header>
            {company ? (
              <div className="p-6">
                <div className="flex items-center gap-3">
                  <CompanyBadge name={company.name} logo={company.logo} size="h-12 w-12 text-sm" />
                  <div className="min-w-0">
                    <p className="truncate font-bold text-ink">{company.name}</p>
                    <p className="mt-0.5 flex items-center gap-2 text-xs text-ink/60">
                      <span>{industryOf(company.type).label}</span>
                      {company.code && <span className="font-mono">{company.code}</span>}
                    </p>
                  </div>
                </div>
                {company.location && (
                  <p className="mt-4 flex items-center gap-2.5 text-[13px] text-ink/80">
                    <MapPin className="h-4 w-4 shrink-0 text-ink/45" />
                    {company.location}
                  </p>
                )}
                <Link href={`/admin/tabs/companies/${company.id}`} className={`${secondaryButton} mt-5 w-full`}>
                  View business <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <p className="p-6 text-sm text-ink/60">This user isn&apos;t linked to a business.</p>
            )}
          </section>

          {/* Record */}
          <section className="rounded-2xl border border-ink/12 bg-white px-6 py-4 shadow-xs">
            <div className="flex items-start gap-3">
              <Fingerprint className="mt-0.5 h-4 w-4 shrink-0 text-ink/45" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-ink/45">User ID</p>
                <div className="mt-1 flex items-center gap-2">
                  <code className="min-w-0 flex-1 truncate rounded-md bg-ivory px-2 py-1 font-mono text-[11px] text-ink/70 ring-1 ring-inset ring-ink/12">{user.id}</code>
                  <button
                    type="button"
                    onClick={() => copy("id", user.id)}
                    aria-label="Copy user ID"
                    className="rounded-md p-1.5 text-ink/45 transition-colors hover:bg-ink/6 hover:text-ink"
                  >
                    {copied === "id" ? <Check className="h-3.5 w-3.5 text-ink" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
                <p className="mt-2 flex items-center gap-1.5 text-[11px] text-ink/45">
                  <Clock className="h-3 w-3" />
                  Updated {formatDate(user.updatedAt, true)}
                </p>
              </div>
            </div>
          </section>

          {/* Danger zone */}
          <section className="rounded-2xl border border-rose-200/80 bg-white p-6 shadow-xs">
            <h2 className="text-sm font-bold text-ink">Delete user</h2>
            <p className="mt-1 text-xs leading-relaxed text-ink/60">
              Permanently remove this person&apos;s SmartPOS account. They won&apos;t be able to sign in again.
            </p>
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="mt-4 inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold text-rose-600 ring-1 ring-inset ring-rose-200 transition-colors hover:bg-rose-50"
            >
              <Trash2 className="h-4 w-4" />
              Delete user
            </button>
          </section>
        </aside>
      </div>

      {confirmDelete && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/50 p-4 backdrop-blur-sm"
          onPointerDown={(e) => e.target === e.currentTarget && !deleting && setConfirmDelete(false)}
        >
          <div role="alertdialog" aria-modal="true" aria-labelledby="delete-user-title" className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-start gap-4 p-6">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                <Trash2 className="h-5 w-5" />
              </span>
              <div>
                <h2 id="delete-user-title" className="text-base font-bold text-ink">Delete {user.name || "this user"}?</h2>
                <p className="mt-1 text-sm leading-relaxed text-ink/60">They will no longer be able to sign in. This cannot be undone.</p>
              </div>
            </div>
            <div className="flex justify-end gap-2.5 border-t border-ink/6 bg-ivory/70 px-6 py-4">
              <button type="button" disabled={deleting} onClick={() => setConfirmDelete(false)} className={secondaryButton}>
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDelete}
                autoFocus
                className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-rose-700 disabled:opacity-70"
              >
                {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
                {deleting ? "Deleting…" : "Delete user"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
