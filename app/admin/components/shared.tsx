"use client";

import React from "react";
import { LayoutGrid, List, type LucideIcon } from "lucide-react";

/** Shared building blocks for admin pages, in the SmartPOS brand (ink / lime / ivory / white). */

export const formatDate = (value?: string | null, withTime = false) => {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  });
};

export const timeAgo = (value?: string | null) => {
  const ms = value ? Date.now() - new Date(value).getTime() : NaN;
  if (Number.isNaN(ms) || ms < 0) return "";
  const minutes = Math.floor(ms / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months > 1 ? "s" : ""} ago`;
  const years = Math.floor(months / 12);
  return `${years} year${years > 1 ? "s" : ""} ago`;
};

export const initials = (name?: string) =>
  (name ?? "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "?";

/** Navy tile with lime initials */
export function InitialsAvatar({ name, size = "h-11 w-11 text-sm", muted = false }: { name?: string; size?: string; muted?: boolean }) {
  return (
    <span
      className={`${size} flex shrink-0 items-center justify-center rounded-xl font-extrabold tracking-wide ${
        muted ? "bg-ink/6 text-ink/45" : "bg-ink text-lime"
      }`}
    >
      {initials(name)}
    </span>
  );
}

/** Company logo, or initials on a soft tile */
export function CompanyBadge({ name, logo, size = "h-7 w-7 text-[10px]" }: { name?: string; logo?: string | null; size?: string }) {
  return logo?.trim() ? (
    // eslint-disable-next-line @next/next/no-img-element -- logos come from arbitrary hosts
    <img loading="lazy" decoding="async" src={logo} alt="" className={`${size} shrink-0 rounded-lg bg-white object-cover ring-1 ring-ink/12`} />
  ) : (
    <span className={`${size} flex shrink-0 items-center justify-center rounded-lg bg-ink/6 font-bold text-ink/70`}>
      {initials(name)}
    </span>
  );
}

export type Stat = { label: string; value: number; icon: LucideIcon; highlight?: boolean };

/** Four figures in one bordered strip */
export function SummaryBar({ stats, loading }: { stats: Stat[]; loading?: boolean }) {
  return (
    <section className="grid grid-cols-2 overflow-hidden rounded-2xl border border-ink/12 bg-white shadow-xs lg:grid-cols-4">
      {stats.map(({ label, value, icon: Icon, highlight }, i) => (
        <div
          key={label}
          className={`flex items-center justify-between gap-3 p-5 ${i % 2 === 1 ? "border-l border-ink/6" : ""} ${
            i >= 2 ? "border-t border-ink/6 lg:border-t-0" : ""
          } ${i === 2 ? "lg:border-l" : ""}`}
        >
          <div>
            <p className="text-xs font-semibold text-ink/60">{label}</p>
            <p className="mt-1 text-2xl font-bold tracking-[-0.02em] text-ink tabular-nums">
              {loading ? <span className="inline-block h-7 w-10 animate-pulse rounded bg-ink/6 align-middle" /> : value}
            </p>
          </div>
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
              highlight ? "bg-lime text-ink" : "bg-ink/6 text-ink/60"
            }`}
          >
            <Icon className="h-5 w-5" />
          </span>
        </div>
      ))}
    </section>
  );
}

/** Pill filters with counts; the selected one is navy with lime text */
export function FilterChips<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { key: T; label: string; count: number }[];
  value: T;
  onChange: (key: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label={label}>
      {options.map((chip) => {
        const active = value === chip.key;
        return (
          <button
            key={chip.key || "all"}
            type="button"
            onClick={() => onChange(chip.key)}
            aria-pressed={active}
            className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors ${
              active ? "bg-ink text-lime shadow-sm" : "bg-white text-ink/70 ring-1 ring-inset ring-ink/12 hover:text-ink hover:ring-ink/25"
            }`}
          >
            {chip.label}
            <span className={`rounded-full px-1.5 text-[11px] tabular-nums ${active ? "bg-white/15 text-white" : "bg-ink/6 text-ink/60"}`}>
              {chip.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function ViewToggle({ value, onChange }: { value: "grid" | "list"; onChange: (v: "grid" | "list") => void }) {
  return (
    <div className="flex h-10 items-center rounded-lg bg-ink/6 p-1" role="group" aria-label="Layout">
      {([
        { key: "grid", icon: LayoutGrid, label: "Grid view" },
        { key: "list", icon: List, label: "List view" },
      ] as const).map(({ key, icon: Icon, label }) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          aria-pressed={value === key}
          aria-label={label}
          title={label}
          className={`flex h-8 w-9 items-center justify-center rounded-md transition-all ${
            value === key ? "bg-white text-ink shadow-sm" : "text-ink/45 hover:text-ink/80"
          }`}
        >
          <Icon className="h-4 w-4" />
        </button>
      ))}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, text, action }: { icon: LucideIcon; title: string; text: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-ink/20 bg-white px-6 py-14 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-ink/6 text-ink/45">
        <Icon className="h-6 w-6" />
      </span>
      <h2 className="mt-4 text-sm font-bold text-ink">{title}</h2>
      <p className="mt-1 max-w-sm text-sm text-ink/60">{text}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/** Shared control styles */
export const controlClass =
  "h-10 rounded-lg border border-ink/12 bg-white text-sm text-ink/80 outline-none transition hover:border-ink/25 focus:border-ink/40 focus:ring-4 focus:ring-lime/40";

export const primaryButton =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-lime px-4 py-2.5 text-sm font-bold text-ink shadow-sm transition-colors hover:bg-lime-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30 focus-visible:ring-offset-2 disabled:opacity-60";

export const secondaryButton =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-ink/80 ring-1 ring-inset ring-ink/12 transition-colors hover:bg-ivory hover:text-ink disabled:opacity-60";
