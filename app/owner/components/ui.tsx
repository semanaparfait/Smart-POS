"use client";

import { AlertTriangle, Inbox, RotateCw, type LucideIcon } from "lucide-react";
import type { Person } from "@/app/owner/types";

// Small building blocks shared by every owner page, so they look and read alike.

// ---------- formatting ----------

export const toNumber = (value: string | number | null | undefined) => {
  const n = typeof value === "number" ? value : parseFloat(value ?? "");
  return Number.isFinite(n) ? n : 0;
};

export const rwf = (value: string | number | null | undefined) => `${Math.round(toNumber(value)).toLocaleString()} RWF`;

// 12,400 → "12.4K", for tight spaces such as chart labels.
export const shortRwf = (value: number) =>
  value >= 1_000_000 ? `${(value / 1_000_000).toFixed(1)}M` : value >= 1_000 ? `${(value / 1_000).toFixed(1)}K` : `${Math.round(value)}`;

export const dayKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

export const formatDate = (iso?: string | null, withTime = false) => {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  });
};

export const timeAgo = (iso?: string | null) => {
  if (!iso) return "Never";
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  return days === 1 ? "Yesterday" : `${days} days ago`;
};

export const personName = (person?: Person | null) => person?.employee?.name ?? person?.name ?? "—";

export const initials = (name?: string | null) =>
  (name ?? "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "?";

// ---------- layout ----------

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-ink/45">{eyebrow}</p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-[-0.02em] text-ink md:text-[28px]">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-sm text-ink/60">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Card({
  title,
  description,
  action,
  children,
  className = "",
}: {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-2xl border border-ink/10 bg-white shadow-[0_1px_2px_rgba(32,40,59,0.04)] ${className}`}>
      {title && (
        <header className="flex items-start justify-between gap-4 border-b border-ink/6 px-5 py-4">
          <div>
            <h2 className="text-sm font-bold text-ink">{title}</h2>
            {description && <p className="mt-0.5 text-xs text-ink/55">{description}</p>}
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "light",
}: {
  label: string;
  value: string;
  hint?: React.ReactNode;
  icon: LucideIcon;
  tone?: "light" | "dark";
}) {
  const dark = tone === "dark";
  return (
    <div
      className={`relative overflow-hidden rounded-2xl p-5 ${
        dark ? "bg-ink text-white" : "border border-ink/10 bg-white text-ink shadow-[0_1px_2px_rgba(32,40,59,0.04)]"
      }`}
    >
      {dark && <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-lime/15" aria-hidden="true" />}
      <div className="relative flex items-start justify-between gap-3">
        <p className={`text-xs font-semibold ${dark ? "text-white/60" : "text-ink/55"}`}>{label}</p>
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${dark ? "bg-lime text-ink" : "bg-ivory text-ink/70"}`}
        >
          <Icon className="h-4.5 w-4.5" />
        </span>
      </div>
      <p className="relative mt-3 truncate text-2xl font-extrabold tracking-[-0.02em]">{value}</p>
      {hint && <div className={`relative mt-1 text-xs ${dark ? "text-white/60" : "text-ink/55"}`}>{hint}</div>}
    </div>
  );
}

const BADGE_TONES = {
  ink: "bg-ink text-lime",
  lime: "bg-lime/40 text-ink",
  muted: "bg-ivory text-ink/70 ring-1 ring-inset ring-ink/10",
  success: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
  danger: "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200",
} as const;

export function Badge({ tone = "muted", children }: { tone?: keyof typeof BADGE_TONES; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${BADGE_TONES[tone]}`}>
      {children}
    </span>
  );
}

export function Avatar({ name, src, size = 36 }: { name?: string | null; src?: string | null; size?: number }) {
  return src ? (
    // eslint-disable-next-line @next/next/no-img-element -- photos come from the API's storage
    <img loading="lazy" decoding="async" src={src} alt="" className="shrink-0 rounded-full object-cover" style={{ width: size, height: size }} />
  ) : (
    <span
      className="flex shrink-0 items-center justify-center rounded-full bg-ink font-bold text-lime"
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {initials(name)}
    </span>
  );
}

export function SearchInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <input
      type="search"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="h-10 w-full rounded-xl border border-ink/12 bg-white px-3.5 text-sm text-ink outline-none transition placeholder:text-ink/40 focus:border-ink focus:ring-4 focus:ring-lime/40 sm:w-72"
    />
  );
}

export function Tabs<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string; count?: number }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="inline-flex flex-wrap gap-1 rounded-xl bg-white p-1 ring-1 ring-inset ring-ink/10">
      {options.map((option) => {
        const on = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={on}
            className={`inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition-colors ${
              on ? "bg-ink text-white" : "text-ink/65 hover:bg-ivory hover:text-ink"
            }`}
          >
            {option.label}
            {option.count !== undefined && (
              <span className={`rounded-full px-1.5 text-[10px] ${on ? "bg-lime text-ink" : "bg-ivory text-ink/55"}`}>
                {option.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ---------- states ----------

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-ink/6 ${className}`} />;
}

export function EmptyState({ title, text, icon: Icon = Inbox }: { title: string; text?: string; icon?: LucideIcon }) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ivory text-ink/45">
        <Icon className="h-6 w-6" />
      </span>
      <p className="mt-3 text-sm font-bold text-ink">{title}</p>
      {text && <p className="mt-1 max-w-sm text-xs text-ink/55">{text}</p>}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-ink/20 bg-white px-6 py-14 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
        <AlertTriangle className="h-6 w-6" />
      </span>
      <p className="mt-3 text-sm font-bold text-ink">Couldn&apos;t load this</p>
      <p className="mt-1 max-w-sm text-xs text-ink/55">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-lime px-4 py-2 text-sm font-semibold text-ink hover:bg-lime-dark"
      >
        <RotateCw className="h-4 w-4" />
        Try again
      </button>
    </div>
  );
}
