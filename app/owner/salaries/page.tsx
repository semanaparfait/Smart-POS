"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Check, ChevronDown, ChevronLeft, ChevronRight, HandCoins, Plus, Trash2, Undo2, Users, X } from "lucide-react";
import { ownerRequest, useOwnerData } from "@/stores/owner/api";
import { Avatar, Badge, Card, EmptyState, ErrorState, PageHeader, SearchInput, Skeleton, rwf } from "@/app/owner/components/ui";
import { Button, LinkButton } from "@/app/owner/components/forms";
import { SALARY_METHODS, debtKindLabel, debtMethodLabel } from "@/app/owner/finance/labels";
import { SALARIES, monthKeyOf, monthName, payLine, shiftMonth, type DebtPayment, type Worker } from "@/app/owner/salaries/payroll";

const PAYMENT_STATUS: Record<DebtPayment["status"], { label: string; tone: "lime" | "success" | "danger" }> = {
  PENDING: { label: "Waiting for approval", tone: "lime" },
  APPROVED: { label: "Approved", tone: "success" },
  REJECTED: { label: "Rejected", tone: "danger" },
};

// Every change here returns the whole list again, as in the app.
function useAct(onSaved: (w: Worker[]) => void) {
  const [busy, setBusy] = useState<string | null>(null);
  const act = async (key: string, path: string, init: RequestInit, done: string) => {
    setBusy(key);
    try {
      const result = await ownerRequest<Worker[] | null>(path, init);
      toast.success(done);
      onSaved(Array.isArray(result) ? result : await ownerRequest<Worker[]>("/staff-debts"));
      return true;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update");
      return false;
    } finally {
      setBusy(null);
    }
  };
  return { busy, act };
}

// Pay one month's salary: what they owe can be taken off; a month is paid once.
function SalaryPanel({ worker, onSaved }: { worker: Worker; onSaved: (w: Worker[]) => void }) {
  const { busy, act } = useAct(onSaved);
  const [month, setMonth] = useState(monthKeyOf(new Date()));
  const paid = worker.salaryPayments.find((p) => p.month === month);
  const thisMonth = monthKeyOf(new Date());
  const suggested = Math.min(worker.owed, worker.salary);

  return (
    <div className="space-y-4 rounded-xl bg-white p-4 ring-1 ring-inset ring-ink/10">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-ink">Salary</p>
        <div className="flex items-center gap-1">
          <Button small tone="quiet" icon={ChevronLeft} aria-label="Previous month" onClick={() => setMonth((m) => shiftMonth(m, -1))} />
          <span className="w-36 text-center text-sm font-semibold text-ink">{monthName(month)}</span>
          <Button small tone="quiet" icon={ChevronRight} aria-label="Next month" disabled={month >= thisMonth} onClick={() => setMonth((m) => shiftMonth(m, 1))} />
        </div>
      </div>
      {paid ? (
        <div className="flex flex-wrap items-center gap-3 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <span className="flex-1">
            Paid {rwf(paid.amount)} · {SALARY_METHODS.find((m) => m.value === paid.method)?.label ?? ""} · {paid.paidOn}
            {paid.deducted ? ` · ${rwf(paid.deducted)} taken off for debts` : ""}
            {paid.paidBy ? ` · ${paid.paidBy.name}` : ""}
          </span>
          <Button small tone="quiet" icon={Undo2} busy={busy === "undo"} onClick={() => act("undo", `/staff-debts/salaries/${paid.id}`, { method: "DELETE" }, `Salary payment undone: ${monthName(month)}`)}>
            Undo
          </Button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          <p className="flex-1 text-sm text-ink/70">
            Not paid yet · {rwf(worker.salary)}
            {suggested ? `, ${rwf(suggested)} can come off for debts` : ""}
          </p>
          <LinkButton icon={Check} href={`${SALARIES}/${worker.employeeId}/pay?month=${month}`}>
            Pay {monthName(month)}
          </LinkButton>
        </div>
      )}
    </div>
  );
}

function WorkerCard({ worker, onSaved }: { worker: Worker; onSaved: (w: Worker[]) => void }) {
  const { busy, act } = useAct(onSaved);
  const [open, setOpen] = useState(false);
  const paidThisMonth = worker.salaryPayments.some((p) => p.month === monthKeyOf(new Date()));

  return (
    <div className={`overflow-hidden rounded-2xl border border-ink/10 bg-white ${worker.active ? "" : "opacity-60"}`}>
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex w-full items-center gap-4 px-5 py-4 text-left hover:bg-ivory/60">
        <Avatar name={worker.name} size={42} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-ink">{worker.name}</p>
          <p className="text-xs text-ink/55">
            {payLine(worker)}
            {worker.waiting > 0 ? ` · ${rwf(worker.waiting)} waiting for approval` : ""}
          </p>
          <div className="mt-1">{paidThisMonth ? <Badge tone="success">Paid this month</Badge> : <Badge tone="lime">Not paid this month</Badge>}</div>
        </div>
        <div className="text-right">
          <p className={`text-base font-extrabold ${worker.owed ? "text-rose-600" : "text-ink"}`}>{rwf(worker.owed)}</p>
          <p className="text-[11px] text-ink/45">owes · {rwf(worker.toPay)} to pay</p>
        </div>
        <ChevronDown className={`h-4.5 w-4.5 text-ink/35 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="space-y-4 border-t border-ink/6 bg-ivory/50 p-4">
          {worker.salary > 0 && <SalaryPanel worker={worker} onSaved={onSaved} />}
          {worker.owed > 0 && (
            <div className="flex flex-wrap items-center gap-3 rounded-xl bg-white p-4 ring-1 ring-inset ring-ink/10">
              <p className="flex-1 text-sm text-ink">
                <span className="font-bold">Owes {rwf(worker.owed)}.</span> Record money they gave back, or take it from the salary.
              </p>
              <LinkButton tone="outline" icon={HandCoins} href={`${SALARIES}/${worker.employeeId}/paid-back`}>
                Paid back
              </LinkButton>
            </div>
          )}
          <div className="rounded-xl bg-white p-4 ring-1 ring-inset ring-ink/10">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-bold text-ink">What they owe</p>
              <LinkButton small tone="outline" icon={Plus} href={`${SALARIES}/charge?worker=${worker.employeeId}`}>
                Charge
              </LinkButton>
            </div>
            {worker.debts.length === 0 ? (
              <p className="text-xs text-ink/55">Nothing charged.</p>
            ) : (
              <ul className="divide-y divide-ink/6">
                {worker.debts.map((d) => (
                  <li key={d.id} className="flex items-center gap-3 py-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-ink">
                        {debtKindLabel(d.kind)} · {rwf(d.amount)}
                      </p>
                      <p className="text-xs text-ink/55">
                        {d.date}
                        {d.note ? ` · ${d.note}` : ""}
                        {d.chargedBy ? ` · by ${d.chargedBy.name}` : ""}
                      </p>
                    </div>
                    <Button small tone="quiet" icon={Trash2} busy={busy === d.id} onClick={() => act(d.id, `/staff-debts/${d.id}`, { method: "DELETE" }, "Debt removed")}>
                      Delete
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {worker.salaryPayments.length > 0 && (
            <div className="rounded-xl bg-white p-4 ring-1 ring-inset ring-ink/10">
              <p className="mb-2 text-sm font-bold text-ink">Salaries paid</p>
              <ul className="divide-y divide-ink/6">
                {worker.salaryPayments.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                    <span>
                      <span className="font-semibold text-ink">{monthName(p.month)}</span>
                      <span className="block text-xs text-ink/55">
                        {p.paidOn} · {SALARY_METHODS.find((m) => m.value === p.method)?.label ?? ""}
                        {p.deducted ? ` · ${rwf(p.deducted)} taken off for debts` : ""}
                        {p.note ? ` · ${p.note}` : ""}
                      </span>
                    </span>
                    <span className="font-bold text-ink">{rwf(p.amount)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {worker.payments.length > 0 && (
            <div className="rounded-xl bg-white p-4 ring-1 ring-inset ring-ink/10">
              <p className="mb-2 text-sm font-bold text-ink">Paid back</p>
              <ul className="divide-y divide-ink/6">
                {worker.payments.map((p) => (
                  <li key={p.id} className="flex items-center gap-3 py-2">
                    {p.proofUrl && (
                      <a href={p.proofUrl} target="_blank" rel="noopener noreferrer" className="h-8 w-8 shrink-0 overflow-hidden rounded-lg ring-1 ring-ink/10">
                        {/* eslint-disable-next-line @next/next/no-img-element -- the proof photo in the API's storage */}
                        <img src={p.proofUrl} alt="Proof" className="h-full w-full object-cover" />
                      </a>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-ink">{rwf(p.amount)}</p>
                      <p className="text-xs text-ink/55">
                        {debtMethodLabel(p.method)} · {p.createdAt.slice(0, 10)}
                        {p.reviewedBy ? ` · ${p.status === "REJECTED" ? "Rejected by" : "Approved by"} ${p.reviewedBy.name}` : ""}
                        {p.reviewNote ? `: ${p.reviewNote}` : ""}
                      </p>
                    </div>
                    <Badge tone={PAYMENT_STATUS[p.status].tone}>{PAYMENT_STATUS[p.status].label}</Badge>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// A worker's payment waiting for approval.
function PendingPayment({ worker, payment, onSaved }: { worker: Worker; payment: DebtPayment; onSaved: (w: Worker[]) => void }) {
  const { busy, act } = useAct(onSaved);
  return (
    <li className="px-5 py-4">
      <div className="flex flex-wrap items-center gap-3">
        {payment.proofUrl && (
          <a href={payment.proofUrl} target="_blank" rel="noopener noreferrer" className="h-11 w-11 shrink-0 overflow-hidden rounded-xl ring-1 ring-ink/10">
            {/* eslint-disable-next-line @next/next/no-img-element -- the proof photo in the API's storage */}
            <img src={payment.proofUrl} alt="Proof" className="h-full w-full object-cover" />
          </a>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-ink">
            {worker.name} · {rwf(payment.amount)}
          </p>
          <p className="text-xs text-ink/55">
            {debtMethodLabel(payment.method)} · {payment.createdAt.slice(0, 10)}
            {payment.note ? ` · ${payment.note}` : ""}
          </p>
        </div>
        <LinkButton small tone="outline" icon={X} href={`${SALARIES}/payments/${payment.id}/reject`}>
          Reject
        </LinkButton>
        <Button small icon={Check} busy={busy === "approve"} onClick={() => act("approve", `/staff-debts/payments/${payment.id}/approve`, { method: "PATCH" }, `Payment approved: ${worker.name} · ${rwf(payment.amount)}`)}>
          Received, approve
        </Button>
      </div>
    </li>
  );
}

// Each worker's salary, what they owe the company, and what is left to pay them.
export default function OwnerSalaries() {
  const loaded = useOwnerData<Worker[]>("/staff-debts");
  const [saved, setSaved] = useState<Worker[] | null>(null);
  const [search, setSearch] = useState("");
  // The latest list: what an action returned, else what was loaded.
  const workers = saved ?? loaded.data ?? [];

  if (loaded.error && !loaded.data) return <ErrorState message={loaded.error} onRetry={loaded.reload} />;

  const thisMonth = monthKeyOf(new Date());
  const pending = workers.flatMap((w) => w.payments.filter((p) => p.status === "PENDING").map((p) => ({ worker: w, payment: p })));
  const paidThisMonth = workers.filter((w) => w.salaryPayments.some((p) => p.month === thisMonth));
  const totals = workers.reduce((acc, w) => ({ salaries: acc.salaries + w.salary, owed: acc.owed + w.owed, toPay: acc.toPay + w.toPay }), { salaries: 0, owed: 0, toPay: 0 });
  const query = search.trim().toLowerCase();
  const shown = workers.filter((w) => !query || w.name.toLowerCase().includes(query));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Finance"
        title="Salaries & debts"
        description="What each worker owes the company comes off their salary. When they pay it back and it is approved, it goes back to their salary."
        actions={
          <LinkButton icon={HandCoins} href={`${SALARIES}/charge`}>
            Charge a worker
          </LinkButton>
        }
      />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {[
          { label: "Salaries a month", value: rwf(totals.salaries) },
          { label: "Owed by workers", value: rwf(totals.owed), tone: totals.owed ? "text-rose-600" : "text-ink" },
          { label: "To pay this month", value: rwf(totals.toPay), hint: "Salaries minus what is owed", tone: "text-emerald-700" },
          {
            label: "Paid this month",
            value: `${paidThisMonth.length} / ${workers.filter((w) => w.salary > 0).length}`,
            hint: rwf(paidThisMonth.reduce((s, w) => s + (w.salaryPayments.find((p) => p.month === thisMonth)?.amount ?? 0), 0)),
          },
          { label: "Waiting for approval", value: String(pending.length) },
        ].map((k) => (
          <div key={k.label} className="rounded-2xl border border-ink/10 bg-white p-5">
            <p className="text-xs font-semibold text-ink/55">{k.label}</p>
            <p className={`mt-2 truncate text-xl font-extrabold ${k.tone ?? "text-ink"}`}>{k.value}</p>
            {k.hint && <p className="mt-1 text-xs text-ink/50">{k.hint}</p>}
          </div>
        ))}
      </div>

      {pending.length > 0 && (
        <Card title={`Payments waiting for approval · ${pending.length}`} description="Approve only when the money really reached you. Then it goes back to their salary.">
          <ul className="divide-y divide-ink/6">
            {pending.map(({ worker, payment }) => (
              <PendingPayment key={payment.id} worker={worker} payment={payment} onSaved={setSaved} />
            ))}
          </ul>
        </Card>
      )}

      <SearchInput value={search} onChange={setSearch} placeholder="Search workers" />

      {loaded.loading && !loaded.data ? (
        <div className="space-y-3">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
      ) : shown.length === 0 ? (
        <Card>
          <EmptyState icon={Users} title={workers.length ? "No workers match" : "No salaries yet"} text={workers.length ? "Try another name." : "Set each worker's monthly salary in Workers."} />
        </Card>
      ) : (
        <div className="space-y-3">
          {shown.map((w) => (
            <WorkerCard key={w.employeeId} worker={w} onSaved={setSaved} />
          ))}
        </div>
      )}
    </div>
  );
}
