"use client";

import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { CreditCard, Loader2, Plus, Trash2 } from "lucide-react";
import { ownerRequest } from "@/stores/owner/api";
import { rwf } from "@/app/owner/components/ui";
import { BILLING_META, PLAN_LABEL, usePlatform } from "@/app/admin/components/Platform";
import { METHODS, dayLabel, useBilling } from "./billing";

// The company's SmartPOS subscription: plan, paid until, and payments.
export default function CompanyBilling({ companyId }: { companyId: string }) {
  const billing = useBilling(companyId);
  const platform = usePlatform();
  const [removing, setRemoving] = useState<string | null>(null);
  const [all, setAll] = useState(false);
  const b = billing.data;

  const remove = async (id: string) => {
    setRemoving(id);
    try {
      await ownerRequest(`/companies/${companyId}/billing/payments/${id}`, { method: "DELETE" });
      toast.success("Payment removed. Paid-until worked out again.");
      billing.reload();
      platform.reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not remove it");
    } finally {
      setRemoving(null);
    }
  };

  const meta = b ? BILLING_META[b.status] : null;
  const shown = b ? (all ? b.payments : b.payments.slice(0, 4)) : [];

  return (
    <section id="subscription" className="rounded-2xl border border-ink/12 bg-white shadow-xs">
      <header className="flex items-center justify-between gap-3 border-b border-ink/6 px-6 py-4">
        <h2 className="flex items-center gap-2 text-sm font-bold text-ink">
          <CreditCard className="h-4 w-4 text-ink/50" /> Subscription
        </h2>
        {meta && <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${meta.cls}`}>{meta.label}</span>}
      </header>

      {!b ? (
        <div className="p-6">
          {billing.error ? (
            <p className="text-sm text-rose-700">
              {billing.error}{" "}
              <button type="button" onClick={billing.reload} className="font-semibold underline">
                Try again
              </button>
            </p>
          ) : (
            <div className="h-24 animate-pulse rounded-xl bg-ink/6" />
          )}
        </div>
      ) : (
        <div className="space-y-5 p-6">
          {b.plan ? (
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-xs text-ink/50">Plan</dt>
                <dd className="font-semibold text-ink">{PLAN_LABEL[b.plan] ?? b.plan}</dd>
              </div>
              <div>
                <dt className="text-xs text-ink/50">A month</dt>
                <dd className="font-semibold text-ink">{b.plan === "TRIAL" ? "Free" : rwf(b.monthlyPrice)}</dd>
              </div>
              <div>
                <dt className="text-xs text-ink/50">{b.plan === "TRIAL" && !b.payments.length ? "Trial ends" : "Paid until"}</dt>
                <dd className={`font-semibold ${b.status === "OVERDUE" ? "text-rose-600" : "text-ink"}`}>{dayLabel(b.paidUntil)}</dd>
              </div>
              <div>
                <dt className="text-xs text-ink/50">Paid so far</dt>
                <dd className="font-semibold text-ink">{rwf(b.totalPaid)}</dd>
              </div>
            </dl>
          ) : (
            <p className="text-sm text-ink/60">No plan chosen yet. Choose one to start keeping track of what this company pays.</p>
          )}
          {b.note && <p className="rounded-xl bg-ivory px-3 py-2 text-xs text-ink/70">{b.note}</p>}

          <div className="flex flex-wrap gap-2">
            {b.plan && (
              <Link href={`/admin/tabs/companies/${companyId}/payment`} className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-ink px-3.5 text-sm font-semibold text-white hover:bg-ink-soft">
                <Plus className="h-4 w-4" /> Record payment
              </Link>
            )}
            <Link href={`/admin/tabs/companies/${companyId}/plan`} className="inline-flex h-9 items-center rounded-xl bg-white px-3.5 text-sm font-semibold text-ink ring-1 ring-inset ring-ink/15 hover:bg-ivory">
              {b.plan ? "Change plan" : "Choose a plan"}
            </Link>
          </div>

          {b.payments.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold text-ink/55">Payments</p>
              <ul className="divide-y divide-ink/6 rounded-xl border border-ink/8">
                {shown.map((p) => (
                  <li key={p.id} className="flex items-center gap-3 px-3 py-2.5 text-sm">
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold text-ink">
                        {rwf(p.amount)} <span className="text-xs font-normal text-ink/50">· {METHODS.find((m) => m.value === p.method)?.label ?? p.method}</span>
                      </span>
                      <span className="block truncate text-xs text-ink/55">
                        {p.months} month{p.months === 1 ? "" : "s"}: {dayLabel(p.coversFrom)} to {dayLabel(p.coversTo)}
                        {p.note ? ` · ${p.note}` : ""}
                      </span>
                      <span className="block text-[11px] text-ink/40">
                        Paid {dayLabel(p.paidOn)}
                        {p.recordedByName ? ` · recorded by ${p.recordedByName}` : ""}
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => remove(p.id)}
                      disabled={removing !== null}
                      aria-label="Remove this payment"
                      title="Remove this payment"
                      className="rounded-lg p-1.5 text-ink/35 transition-colors hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
                    >
                      {removing === p.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </button>
                  </li>
                ))}
              </ul>
              {b.payments.length > 4 && (
                <button type="button" onClick={() => setAll((v) => !v)} className="mt-2 text-xs font-semibold text-ink/60 hover:text-ink">
                  {all ? "Show fewer" : `Show all ${b.payments.length}`}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
