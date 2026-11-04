"use client";

import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Building2, ChevronDown, Inbox, KeyRound, Mail, MessageCircle, Phone, RotateCw, type LucideIcon } from "lucide-react";
import { ownerRequest, useOwnerData } from "@/stores/owner/api";
import { usePlatform } from "@/app/admin/components/Platform";
import { formatDate, timeAgo } from "@/app/owner/components/ui";
import { Button, TextArea } from "@/app/owner/components/forms";

type Kind = "INSTALLATION" | "CONTACT" | "PASSWORD_HELP";
type Status = "NEW" | "IN_PROGRESS" | "DONE";

interface Item {
  id: string;
  createdAt: string;
  kind: Kind;
  status: Status;
  name: string;
  email: string | null;
  phone: string | null;
  subject: string;
  message: string | null;
  details: { businessType?: string; location?: string; branches?: number; plan?: string; preferredDate?: string | null };
  adminNote: string | null;
  handledByName: string | null;
  handledAt: string | null;
}

const KINDS: Record<Kind, { label: string; many: string; icon: LucideIcon }> = {
  INSTALLATION: { label: "Installation request", many: "Installation requests", icon: Building2 },
  CONTACT: { label: "Message", many: "Messages", icon: MessageCircle },
  PASSWORD_HELP: { label: "Password help", many: "Password help", icon: KeyRound },
};

const STATUS: Record<Status, { label: string; cls: string }> = {
  NEW: { label: "New", cls: "bg-ink text-lime" },
  IN_PROGRESS: { label: "In progress", cls: "bg-lime/50 text-ink" },
  DONE: { label: "Done", cls: "bg-emerald-50 text-emerald-700" },
};

const title = (v?: string | null) => (v ? v.charAt(0).toUpperCase() + v.slice(1).toLowerCase() : "—");
// 0788 123 456 → 250788123456, for WhatsApp.
const waNumber = (phone: string) => {
  const digits = phone.replace(/\D/g, "");
  return digits.startsWith("0") ? `250${digits.slice(1)}` : digits;
};

function Row({ item, accountId, onChanged }: { item: Item; accountId?: string; onChanged: () => void }) {
  const [open, setOpen] = useState(item.status === "NEW");
  const [note, setNote] = useState(item.adminNote ?? "");
  const [busy, setBusy] = useState<string | null>(null);
  const meta = KINDS[item.kind];
  const Icon = meta.icon;

  const save = async (key: string, body: { status?: Status; adminNote?: string }, done: string) => {
    setBusy(key);
    try {
      await ownerRequest(`/inbox/${item.id}`, { method: "PATCH", body: JSON.stringify(body) });
      toast.success(done);
      onChanged();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save");
    } finally {
      setBusy(null);
    }
  };

  const companyHref = `/admin/tabs/companies/new?${new URLSearchParams({
    name: item.subject,
    type: item.details.businessType ?? "",
    location: item.details.location ?? "",
    email: item.email ?? "",
    phone: item.phone ?? "",
  })}`;

  return (
    <li className="rounded-2xl border border-ink/10 bg-white shadow-xs">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex w-full items-center gap-4 px-5 py-4 text-left">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${item.status === "NEW" ? "bg-ink text-lime" : "bg-ink/6 text-ink/60"}`}>
          <Icon className="h-4.5 w-4.5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="truncate text-sm font-semibold text-ink">{item.subject}</span>
            <span className="text-xs text-ink/45">{meta.label}</span>
          </span>
          <span className="mt-0.5 block truncate text-xs text-ink/55">
            {item.name}
            {item.phone ? ` · ${item.phone}` : ""}
            {item.email ? ` · ${item.email}` : ""}
          </span>
        </span>
        <span className="hidden text-xs text-ink/50 sm:block">{timeAgo(item.createdAt)}</span>
        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${STATUS[item.status].cls}`}>{STATUS[item.status].label}</span>
        <ChevronDown className={`h-4 w-4 text-ink/35 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="space-y-4 border-t border-ink/6 px-5 py-4">
          {item.kind === "INSTALLATION" && (
            <dl className="grid grid-cols-2 gap-3 rounded-xl bg-ivory px-4 py-3 text-sm sm:grid-cols-5">
              {[
                ["Business", title(item.details.businessType)],
                ["Where", item.details.location ?? "—"],
                ["Branches", String(item.details.branches ?? 1)],
                ["Plan", title(item.details.plan)],
                ["Preferred day", item.details.preferredDate ? formatDate(item.details.preferredDate) : "Any day"],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-[11px] font-medium text-ink/50">{k}</dt>
                  <dd className="font-semibold text-ink">{v}</dd>
                </div>
              ))}
            </dl>
          )}
          {item.message && <p className="whitespace-pre-line text-sm leading-6 text-ink/80">{item.message}</p>}
          <p className="text-xs text-ink/45">
            Sent {formatDate(item.createdAt, true)}
            {item.handledByName ? ` · last changed by ${item.handledByName} ${timeAgo(item.handledAt).toLowerCase()}` : ""}
          </p>

          <div className="flex flex-wrap gap-2">
            {item.phone && (
              <>
                <a href={`tel:${item.phone.replace(/\s/g, "")}`} className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-white px-3 text-xs font-semibold text-ink ring-1 ring-inset ring-ink/15 hover:bg-ivory">
                  <Phone className="h-3.5 w-3.5" /> Call
                </a>
                <a href={`https://wa.me/${waNumber(item.phone)}`} target="_blank" rel="noreferrer" className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-white px-3 text-xs font-semibold text-ink ring-1 ring-inset ring-ink/15 hover:bg-ivory">
                  <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                </a>
              </>
            )}
            {item.email && (
              <a href={`mailto:${item.email}?subject=${encodeURIComponent(`Re: ${item.subject}`)}`} className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-white px-3 text-xs font-semibold text-ink ring-1 ring-inset ring-ink/15 hover:bg-ivory">
                <Mail className="h-3.5 w-3.5" /> Email
              </a>
            )}
            {item.kind === "INSTALLATION" && (
              <Link href={companyHref} className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-lime px-3 text-xs font-semibold text-ink hover:bg-lime-dark">
                <Building2 className="h-3.5 w-3.5" /> Register this company
              </Link>
            )}
            {item.kind === "PASSWORD_HELP" &&
              (accountId ? (
                <Link href={`/admin/tabs/users/${accountId}`} className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-lime px-3 text-xs font-semibold text-ink hover:bg-lime-dark">
                  <KeyRound className="h-3.5 w-3.5" /> Open their account to reset the password
                </Link>
              ) : (
                <span className="inline-flex h-9 items-center text-xs text-ink/55">No account found for this email.</span>
              ))}
          </div>

          <div className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-end">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-ink">Your note</span>
              <TextArea rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Called on Monday, visiting Thursday at 10:00" />
            </label>
            <Button tone="outline" small busy={busy === "note"} disabled={note === (item.adminNote ?? "")} onClick={() => save("note", { adminNote: note }, "Note saved")}>
              Save note
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 border-t border-ink/6 pt-4">
            {item.status !== "IN_PROGRESS" && (
              <Button small tone="outline" busy={busy === "IN_PROGRESS"} onClick={() => save("IN_PROGRESS", { status: "IN_PROGRESS" }, "Marked in progress")}>
                Mark in progress
              </Button>
            )}
            {item.status !== "DONE" && (
              <Button small busy={busy === "DONE"} onClick={() => save("DONE", { status: "DONE" }, "Marked done")}>
                Mark done
              </Button>
            )}
            {item.status !== "NEW" && (
              <Button small tone="quiet" busy={busy === "NEW"} onClick={() => save("NEW", { status: "NEW" }, "Marked new again")}>
                Mark new
              </Button>
            )}
          </div>
        </div>
      )}
    </li>
  );
}

type View = "open" | "NEW" | "IN_PROGRESS" | "DONE" | "all";

export default function InboxPage() {
  const items = useOwnerData<Item[]>("/inbox");
  const users = useOwnerData<{ id: string; email: string }[]>("/user");
  const platform = usePlatform();
  const [kind, setKind] = useState<Kind | "ALL">("ALL");
  const [view, setView] = useState<View>("open");

  const all = items.data ?? [];
  const byKind = all.filter((i) => kind === "ALL" || i.kind === kind);
  const list = byKind.filter((i) => (view === "all" ? true : view === "open" ? i.status !== "DONE" : i.status === view));
  const accountOf = (email: string | null) => (email ? users.data?.find((u) => u.email?.toLowerCase() === email.toLowerCase())?.id : undefined);
  const changed = () => {
    items.reload();
    platform.reload();
  };

  const kinds: { value: Kind | "ALL"; label: string; count: number }[] = [
    { value: "ALL", label: "Everything", count: all.filter((i) => i.status === "NEW").length },
    ...(Object.keys(KINDS) as Kind[]).map((k) => ({ value: k, label: KINDS[k].many, count: all.filter((i) => i.kind === k && i.status === "NEW").length })),
  ];

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-bold tracking-[-0.02em] text-ink">Inbox</h1>
          <p className="mt-1 text-sm text-ink/60">Installation requests and messages from the website, and people who forgot their password.</p>
        </div>
        <Button tone="outline" icon={RotateCw} busy={items.loading && !!items.data} onClick={changed}>
          Refresh
        </Button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {kinds.map((k) => (
            <button
              key={k.value}
              type="button"
              onClick={() => setKind(k.value)}
              aria-pressed={kind === k.value}
              className={`inline-flex h-9 items-center gap-2 rounded-xl px-3.5 text-sm font-medium transition-colors ${kind === k.value ? "bg-ink text-white" : "bg-white text-ink/75 ring-1 ring-inset ring-ink/12 hover:bg-ivory"}`}
            >
              {k.label}
              {k.count > 0 && <span className={`rounded-full px-1.5 text-[11px] font-semibold ${kind === k.value ? "bg-lime text-ink" : "bg-ink text-lime"}`}>{k.count}</span>}
            </button>
          ))}
        </div>
        <select value={view} onChange={(e) => setView(e.target.value as View)} aria-label="Show" className="h-9 rounded-xl border border-ink/12 bg-white px-3 text-sm text-ink">
          <option value="open">Not done yet</option>
          <option value="NEW">New</option>
          <option value="IN_PROGRESS">In progress</option>
          <option value="DONE">Done</option>
          <option value="all">Everything</option>
        </select>
      </div>

      {items.loading && !items.data ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-white" />
          ))}
        </div>
      ) : items.error && !items.data ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
          {items.error}{" "}
          <button type="button" onClick={items.reload} className="font-semibold underline">
            Try again
          </button>
        </div>
      ) : list.length ? (
        <ul className="space-y-3">
          {list.map((item) => (
            <Row key={`${item.id}-${item.status}-${item.adminNote ?? ""}`} item={item} accountId={accountOf(item.email)} onChanged={changed} />
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-ink/20 bg-white px-6 py-16 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ink/6 text-ink/50">
            <Inbox className="h-6 w-6" />
          </span>
          <p className="mt-4 text-sm font-semibold text-ink">Nothing here</p>
          <p className="mt-1 text-xs text-ink/55">{view === "open" ? "Everything has been dealt with." : "No items match this view."}</p>
        </div>
      )}
    </div>
  );
}
