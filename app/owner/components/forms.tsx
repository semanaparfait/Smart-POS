"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, X } from "lucide-react";

// Form pieces for the owner pages: a dialog, labelled fields and buttons.

const fieldClass =
  "h-11 w-full rounded-xl border border-ink/12 bg-white px-3.5 text-sm text-ink outline-none transition placeholder:text-ink/40 focus:border-ink focus:ring-4 focus:ring-lime/40 disabled:bg-ivory";

export function Dialog({
  title,
  description,
  onClose,
  children,
  footer,
  wide = false,
}: {
  title: string;
  description?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  wide?: boolean;
}) {
  // Escape closes the form, like the X.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/45 p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 cursor-default" />
      <div className={`relative flex max-h-[92vh] w-full flex-col rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl ${wide ? "sm:max-w-2xl" : "sm:max-w-lg"}`}>
        <header className="flex items-start justify-between gap-4 border-b border-ink/8 px-6 py-5">
          <div>
            <h2 className="text-lg font-extrabold text-ink">{title}</h2>
            {description && <p className="mt-0.5 text-sm text-ink/55">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-ink/50 hover:bg-ivory hover:text-ink"
          >
            <X className="h-4 w-4" />
          </button>
        </header>
        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">{children}</div>
        {footer && <footer className="flex flex-wrap justify-end gap-2 border-t border-ink/8 bg-ivory/50 px-6 py-4">{footer}</footer>}
      </div>
    </div>
  );
}

// A whole page for adding or changing something: a way back, a title, the
// sections, and a save bar that stays in view at the bottom.
export function FormPage({
  back,
  backLabel,
  eyebrow,
  title,
  description,
  actions,
  note,
  children,
}: {
  back: string;
  backLabel: string;
  eyebrow: string;
  title: string;
  description?: string;
  actions: React.ReactNode;
  note?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link href={back} className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink/55 hover:text-ink">
          <ArrowLeft className="h-4 w-4" />
          {backLabel}
        </Link>
        <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.2em] text-ink/45">{eyebrow}</p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-[-0.02em] text-ink md:text-[28px]">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-sm text-ink/60">{description}</p>}
      </div>
      <div className="space-y-5">{children}</div>
      <div className="sticky bottom-4 z-10 flex flex-wrap items-center justify-end gap-2 rounded-2xl border border-ink/10 bg-white/95 px-4 py-3 shadow-[0_8px_24px_rgba(32,40,59,0.10)] backdrop-blur">
        {note && <span className="mr-auto text-xs text-ink/55">{note}</span>}
        {actions}
      </div>
    </div>
  );
}

// One titled group of fields on a form page.
export function FormSection({ title, description, children }: { title?: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-ink/10 bg-white shadow-[0_1px_2px_rgba(32,40,59,0.04)]">
      {title && (
        <header className="border-b border-ink/6 px-5 py-4">
          <h2 className="text-sm font-bold text-ink">{title}</h2>
          {description && <p className="mt-0.5 text-xs text-ink/55">{description}</p>}
        </header>
      )}
      <div className="space-y-4 p-5">{children}</div>
    </section>
  );
}

// A link that looks like a Button, for going to a form page.
export function LinkButton({
  href,
  tone = "primary",
  icon: Icon,
  small = false,
  children,
}: {
  href: string;
  tone?: keyof typeof BUTTON_TONES;
  icon?: React.ComponentType<{ className?: string }>;
  small?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors ${small ? "h-8 px-3 text-xs" : "h-10 px-4 text-sm"} ${BUTTON_TONES[tone]}`}
    >
      {Icon && <Icon className="h-4 w-4" />}
      {children}
    </Link>
  );
}

// A Cancel that goes back to the list.
export function BackButton({ href, children = "Cancel" }: { href: string; children?: React.ReactNode }) {
  return (
    <LinkButton href={href} tone="outline">
      {children}
    </LinkButton>
  );
}

// While an edit page loads what it changes, or when it is gone.
export function FormPageState({ back, backLabel, loading, error, onRetry }: { back: string; backLabel: string; loading: boolean; error: string | null; onRetry: () => void }) {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href={back} className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink/55 hover:text-ink">
        <ArrowLeft className="h-4 w-4" />
        {backLabel}
      </Link>
      {loading ? (
        <div className="space-y-4">
          <div className="h-10 w-64 animate-pulse rounded-xl bg-ink/6" />
          <div className="h-64 animate-pulse rounded-2xl bg-ink/6" />
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-ink/20 bg-white px-6 py-14 text-center">
          <p className="text-sm font-bold text-ink">{error ? "Couldn't load this" : "Not found"}</p>
          <p className="mt-1 text-xs text-ink/55">{error ?? "It may have been removed."}</p>
          {error && (
            <button type="button" onClick={onRetry} className="mt-4 rounded-lg bg-lime px-4 py-2 text-sm font-semibold text-ink hover:bg-lime-dark">
              Try again
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-ink">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-ink/50">{hint}</span>}
    </label>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${fieldClass} ${props.className ?? ""}`} />;
}

// Whole RWF amounts only.
export function MoneyInput({
  value,
  onChange,
  placeholder = "0",
  autoFocus,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}) {
  return (
    <div className="relative">
      <input
        inputMode="numeric"
        value={value}
        autoFocus={autoFocus}
        onChange={(e) => onChange(e.target.value.replace(/[^0-9]/g, ""))}
        placeholder={placeholder}
        className={`${fieldClass} pr-14 font-semibold`}
      />
      <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-ink/45">RWF</span>
    </div>
  );
}

export function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={fieldClass}>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      rows={3}
      {...props}
      className={`w-full rounded-xl border border-ink/12 bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition placeholder:text-ink/40 focus:border-ink focus:ring-4 focus:ring-lime/40 ${props.className ?? ""}`}
    />
  );
}

// One choice out of a few, as buttons.
export function Choices<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            aria-pressed={on}
            className={`h-10 rounded-xl px-3.5 text-sm font-semibold transition-colors ${
              on ? "bg-ink text-white" : "bg-white text-ink ring-1 ring-inset ring-ink/12 hover:bg-ivory"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

const BUTTON_TONES = {
  primary: "bg-ink text-white hover:bg-ink-soft",
  lime: "bg-lime text-ink hover:bg-lime-dark",
  outline: "bg-white text-ink ring-1 ring-inset ring-ink/15 hover:bg-ivory",
  danger: "bg-white text-rose-600 ring-1 ring-inset ring-rose-200 hover:bg-rose-50",
  quiet: "text-ink/60 hover:bg-ivory hover:text-ink",
} as const;

export function Button({
  tone = "primary",
  busy = false,
  icon: Icon,
  children,
  small = false,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: keyof typeof BUTTON_TONES;
  busy?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
  small?: boolean;
}) {
  return (
    <button
      type="button"
      {...props}
      disabled={props.disabled || busy}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors disabled:opacity-55 ${
        small ? "h-8 px-3 text-xs" : "h-10 px-4 text-sm"
      } ${BUTTON_TONES[tone]} ${props.className ?? ""}`}
    >
      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : Icon ? <Icon className="h-4 w-4" /> : null}
      {children}
    </button>
  );
}

export const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export const monthKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

// A photo chosen from the computer, with a preview. `current` is the saved one.
export function PhotoPicker({
  current,
  file,
  onChange,
  round = false,
}: {
  current?: string | null;
  file: File | null;
  onChange: (file: File | null) => void;
  round?: boolean;
}) {
  const preview = useMemo(() => (file ? URL.createObjectURL(file) : current), [file, current]);
  return (
    <div className="flex items-center gap-4">
      <div className={`flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden bg-ivory ring-1 ring-inset ring-ink/10 ${round ? "rounded-full" : "rounded-2xl"}`}>
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element -- a local preview or the API's storage
          <img loading="lazy" decoding="async" src={preview} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="text-[11px] font-semibold text-ink/40">No photo</span>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        <label className="inline-flex h-9 cursor-pointer items-center rounded-xl bg-white px-3.5 text-sm font-semibold text-ink ring-1 ring-inset ring-ink/15 hover:bg-ivory">
          {preview ? "Change photo" : "Choose a photo"}
          <input type="file" accept="image/*" className="sr-only" onChange={(e) => onChange(e.target.files?.[0] ?? null)} />
        </label>
        {file && (
          <button type="button" onClick={() => onChange(null)} className="h-9 rounded-xl px-3 text-sm font-semibold text-ink/55 hover:bg-ivory">
            Undo
          </button>
        )}
      </div>
    </div>
  );
}

// A yes/no switch with a label and what it means.
export function Switch({ checked, onChange, label, hint }: { checked: boolean; onChange: (checked: boolean) => void; label: string; hint?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left ring-1 ring-inset ring-ink/10 hover:bg-ivory/70"
    >
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-ink">{label}</span>
        {hint && <span className="block text-xs text-ink/55">{hint}</span>}
      </span>
      <span className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${checked ? "bg-ink" : "bg-ink/15"}`}>
        <span className={`h-4.5 w-4.5 rounded-full shadow-sm transition-transform ${checked ? "translate-x-5.5 bg-lime" : "translate-x-1 bg-white"}`} />
      </span>
    </button>
  );
}
