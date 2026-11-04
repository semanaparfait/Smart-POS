"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Ban, CircleCheck, Loader2, Power } from "lucide-react";
import { ownerRequest } from "@/stores/owner/api";

const REASONS = ["Subscription not paid", "Asked to close", "Breaking the rules", "Under review"];

type Status = { active?: boolean; suspendedAt?: string | null; suspendedReason?: string | null };

// Terminate a company (nobody in it can sign in or use SmartPOS, its data is
// kept) or activate it again. One click each, as everywhere in SmartPOS.
export default function CompanyStatus({ companyId, name, initial, onChanged }: { companyId: string; name: string; initial: Status; onChanged: (s: Status) => void }) {
  const [status, setStatus] = useState<Status>(initial);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const active = status.active !== false;

  const save = async (next: boolean) => {
    setBusy(true);
    try {
      const saved = await ownerRequest<Status>(`/companies/${companyId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ active: next, ...(!next && reason.trim() ? { reason: reason.trim() } : {}) }),
      });
      const fresh = { active: saved?.active ?? next, suspendedAt: saved?.suspendedAt ?? null, suspendedReason: saved?.suspendedReason ?? null };
      setStatus(fresh);
      onChanged(fresh);
      setReason("");
      toast.success(next ? `${name} is active again. Its owner and workers can sign in.` : `${name} terminated. Everyone in it is signed out.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not change the company");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className={`rounded-2xl border bg-white shadow-xs ${active ? "border-ink/12" : "border-rose-200"}`}>
      <header className="flex items-center justify-between gap-3 border-b border-ink/6 px-6 py-4">
        <div>
          <h2 className="text-sm font-bold text-ink">Company status</h2>
          <p className="mt-0.5 text-xs text-ink/60">Terminating signs everyone out and stops all use. Nothing is deleted.</p>
        </div>
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${active ? "bg-lime text-ink" : "bg-rose-50 text-rose-700"}`}>
          {active ? <CircleCheck className="h-3.5 w-3.5" /> : <Ban className="h-3.5 w-3.5" />}
          {active ? "Active" : "Terminated"}
        </span>
      </header>
      <div className="space-y-3 px-6 py-5">
        {active ? (
          <>
            <p className="text-sm text-ink/70">The owner and workers of {name} can sign in and sell.</p>
            <div className="flex flex-wrap gap-2">
              {REASONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setReason(r)}
                  aria-pressed={reason === r}
                  className={`h-8 rounded-lg px-3 text-xs font-semibold transition-colors ${reason === r ? "bg-ink text-white" : "bg-white text-ink ring-1 ring-inset ring-ink/12 hover:bg-ivory"}`}
                >
                  {r}
                </button>
              ))}
            </div>
            <input
              value={reason}
              maxLength={255}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why (optional), e.g. Subscription not paid"
              className="h-10 w-full rounded-xl border border-ink/12 bg-white px-3.5 text-sm text-ink outline-none placeholder:text-ink/40 focus:border-ink focus:ring-4 focus:ring-lime/40"
            />
            <button
              type="button"
              disabled={busy}
              onClick={() => save(false)}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-rose-600 ring-1 ring-inset ring-rose-200 hover:bg-rose-50 disabled:opacity-60"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Ban className="h-4 w-4" />}
              Terminate company
            </button>
          </>
        ) : (
          <>
            <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-800">
              <p className="font-semibold">Terminated{status.suspendedAt ? ` on ${new Date(status.suspendedAt).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}` : ""}</p>
              <p className="mt-0.5">{status.suspendedReason ? `Why: ${status.suspendedReason}` : "No reason given."}</p>
              <p className="mt-1 text-xs text-rose-700/80">Nobody in {name} can sign in. Its sales, products and workers are kept.</p>
            </div>
            <button
              type="button"
              disabled={busy}
              onClick={() => save(true)}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-ink px-4 text-sm font-semibold text-white hover:bg-ink-soft disabled:opacity-60"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Power className="h-4 w-4 text-lime" />}
              Activate company
            </button>
          </>
        )}
      </div>
    </section>
  );
}
