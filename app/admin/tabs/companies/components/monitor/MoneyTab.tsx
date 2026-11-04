"use client";

import { useState } from "react";
import { Banknote, ChevronDown, Receipt, Scale, Wallet } from "lucide-react";
import { useOwnerData } from "@/stores/owner/api";
import type { Order } from "@/app/owner/types";
import { Badge, dayKey, rwf, toNumber } from "@/app/owner/components/ui";
import { categoryLabel } from "@/app/owner/finance/labels";
import { costsBetween, creditsOf, daysSince, paidAt, signedPayment, type CheckedPayment, type Expense } from "@/app/owner/finance/money";
import { payLine, type Worker } from "@/app/owner/salaries/payroll";
import { Choice, Empty, Loading, Panel, Stat, stamp, title } from "./parts";

export interface MoneyCheck {
  date: string;
  worker: { id: string; name?: string };
  status: "VERIFIED" | "FLAGGED";
  counted?: Record<string, number>;
  expected?: Record<string, number>;
  difference: string | number;
  note?: string | null;
  decidedByName: string;
}

const EXPENSE_TONE: Record<string, "success" | "lime" | "danger" | "muted"> = { APPROVED: "success", PENDING: "lime", REJECTED: "danger" };

function WorkerMoney({ w }: { w: Worker }) {
  const [open, setOpen] = useState(false);
  return (
    <li>
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex w-full flex-wrap items-center gap-3 px-4 py-2.5 text-left text-sm hover:bg-ivory/60">
        <span className="min-w-0 flex-1">
          <span className="block truncate font-semibold text-ink">{w.name}</span>
          <span className="block text-xs text-ink/55">{payLine(w)}</span>
        </span>
        <span className={`text-xs font-semibold ${w.owed ? "text-rose-600" : "text-ink/55"}`}>Owes {rwf(w.owed)}</span>
        <span className="whitespace-nowrap text-right text-xs font-semibold text-ink">To pay {rwf(w.toPay)}</span>
        <ChevronDown className={`h-4 w-4 text-ink/35 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="grid gap-3 border-t border-ink/6 bg-ivory/40 px-4 py-3 text-xs text-ink/75 md:grid-cols-3">
          <div>
            <p className="mb-1 font-semibold text-ink">Debts</p>
            {w.debts.map((d) => (
              <p key={d.id}>
                {d.date} · {title(d.kind)} · {rwf(d.amount)}
                {d.note ? ` · ${d.note}` : ""}
              </p>
            ))}
            {!w.debts.length && <p>None.</p>}
          </div>
          <div>
            <p className="mb-1 font-semibold text-ink">Paid back</p>
            {w.payments.map((p) => (
              <p key={p.id}>
                {stamp(p.createdAt)} · {title(p.method)} · {rwf(p.amount)} · {title(p.status)}
              </p>
            ))}
            {!w.payments.length && <p>None.</p>}
          </div>
          <div>
            <p className="mb-1 font-semibold text-ink">Salaries paid</p>
            {w.salaryPayments.map((s) => (
              <p key={s.id}>
                {s.month} · {rwf(s.amount)}
                {s.deducted ? ` (${rwf(s.deducted)} taken for debts)` : ""} · {title(s.method)}
              </p>
            ))}
            {!w.salaryPayments.length && <p>None.</p>}
          </div>
        </div>
      )}
    </li>
  );
}

type View = "summary" | "expenses" | "salaries" | "checks" | "credits" | "services";

export default function MoneyTab({ companyId, orders, expenses, checks, staff, now, services }: { companyId: string; orders: Order[]; expenses: Expense[]; checks: MoneyCheck[]; staff: Worker[]; now: number; services: boolean }) {
  const [view, setView] = useState<View>("summary");
  const servicePay = useOwnerData<CheckedPayment[]>(services && view === "services" ? `/booking-payments?companyId=${companyId}` : null);

  const today = new Date(now);
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
  const month = dayKey(today).slice(0, 7);
  const salaryTotal = staff.filter((w) => w.active).reduce((s, w) => s + toNumber(w.salary), 0);
  const costs = costsBetween(expenses, salaryTotal, monthStart, tomorrow);
  const paid = orders.filter((o) => o.status === "COMPLETED" && dayKey(new Date(paidAt(o))).startsWith(month));
  const sales = paid.reduce((s, o) => s + toNumber(o.total), 0);
  const goodsCost = paid.reduce((s, o) => s + (o.items ?? []).reduce((t, i) => t + i.quantity * toNumber(i.unitCost ?? i.product?.buyingPrice), 0), 0);
  const credits = creditsOf(orders);
  const creditTotal = credits.reduce((s, c) => s + c.amount, 0);
  const flagged = checks.filter((c) => c.status === "FLAGGED");
  const pendingExpenses = expenses.filter((e) => e.status === "PENDING");

  const views: { value: View; label: string }[] = [
    { value: "summary", label: "This month" },
    { value: "expenses", label: `Expenses · ${expenses.length}` },
    { value: "salaries", label: "Salaries & debts" },
    { value: "checks", label: `Money checks · ${checks.length}` },
    { value: "credits", label: `Credits · ${credits.length}` },
    ...(services ? [{ value: "services" as const, label: "Service money" }] : []),
  ];

  return (
    <div className="space-y-4">
      <Choice value={view} onChange={setView} options={views} />

      {view === "summary" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Stat icon={Banknote} label="Sales this month" value={rwf(sales)} hint={`${paid.length} paid orders`} />
            <Stat icon={Receipt} label="Cost of goods sold" value={rwf(goodsCost)} hint="At buying price" />
            <Stat icon={Wallet} label="Running costs so far" value={rwf(costs.total)} hint={`Salaries ${rwf(costs.salaries)}`} />
            <Stat icon={Scale} label="Profit so far" value={rwf(sales - goodsCost - costs.total)} tone={sales - goodsCost - costs.total < 0 ? "text-rose-600" : undefined} hint="Sales minus goods and costs" />
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Panel heading="Costs by kind, this month">
              {costs.categories.map((c) => (
                <li key={c.category} className="flex justify-between px-4 py-2 text-sm">
                  <span className="text-ink/70">{categoryLabel(c.category)}</span>
                  <span className="font-semibold text-ink">{rwf(c.amount)}</span>
                </li>
              ))}
              <li className="flex justify-between px-4 py-2 text-sm">
                <span className="text-ink/70">Salaries</span>
                <span className="font-semibold text-ink">{rwf(costs.salaries)}</span>
              </li>
            </Panel>
            <Panel heading="Needs attention">
              <li className="flex justify-between px-4 py-2 text-sm">
                <span className="text-ink/70">Expenses waiting for a decision</span>
                <span className="font-semibold text-ink">{pendingExpenses.length}</span>
              </li>
              <li className="flex justify-between px-4 py-2 text-sm">
                <span className="text-ink/70">Flagged money checks</span>
                <span className={`font-semibold ${flagged.length ? "text-rose-600" : "text-ink"}`}>{flagged.length}</span>
              </li>
              <li className="flex justify-between px-4 py-2 text-sm">
                <span className="text-ink/70">Owed by customers (credit)</span>
                <span className={`font-semibold ${creditTotal ? "text-rose-600" : "text-ink"}`}>{rwf(creditTotal)}</span>
              </li>
              <li className="flex justify-between px-4 py-2 text-sm">
                <span className="text-ink/70">Owed by workers</span>
                <span className="font-semibold text-ink">{rwf(staff.reduce((s, w) => s + toNumber(w.owed), 0))}</span>
              </li>
            </Panel>
          </div>
        </div>
      )}

      {view === "expenses" && (
        <Panel heading={`Expenses · ${rwf(expenses.filter((e) => e.status !== "REJECTED").reduce((s, e) => s + toNumber(e.amount), 0))} recorded`} scroll>
          {expenses.map((e) => (
            <li key={e.id} className="flex flex-wrap items-center gap-3 px-4 py-2.5 text-sm">
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold text-ink">{e.title}</span>
                <span className="block truncate text-xs text-ink/55">
                  {categoryLabel(e.category)} · {title(e.repeat)} from {e.startDate}
                  {e.endDate ? ` to ${e.endDate}` : ""} · by {e.recordedBy?.name ?? "—"}
                  {e.paidFrom === "OWN_MONEY" ? (e.repaidAt ? " · paid back" : " · from own money, not paid back") : ""}
                  {e.reviewNote ? ` · “${e.reviewNote}”` : ""}
                </span>
              </span>
              {e.proofUrl && (
                <a href={e.proofUrl} target="_blank" rel="noreferrer" className="text-xs font-semibold text-ink underline">
                  Proof
                </a>
              )}
              <Badge tone={EXPENSE_TONE[e.status] ?? "muted"}>{title(e.status)}</Badge>
              <span className="w-28 text-right font-bold text-ink">{rwf(e.amount)}</span>
            </li>
          ))}
          {!expenses.length && <Empty text="No expenses." />}
        </Panel>
      )}

      {view === "salaries" && (
        <Panel heading={`Salaries & debts · ${staff.length} workers`}>
          {staff.map((w) => (
            <WorkerMoney key={w.employeeId} w={w} />
          ))}
          {!staff.length && <Empty text="No salaries." />}
        </Panel>
      )}

      {view === "checks" && (
        <Panel heading={`Money checks · ${flagged.length} flagged`} scroll>
          {[...checks]
            .sort((a, b) => b.date.localeCompare(a.date))
            .map((c, i) => (
              <li key={`${c.date}-${c.worker.id}-${i}`} className="flex flex-wrap items-center gap-3 px-4 py-2.5 text-sm">
                <span className="w-24 text-xs text-ink/55">{c.date}</span>
                <span className="min-w-0 flex-1 truncate text-xs text-ink/70">
                  {c.worker.name ?? "Worker"} · checked by {c.decidedByName}
                  {c.note ? ` · “${c.note}”` : ""}
                </span>
                <span className={`text-xs font-semibold ${toNumber(c.difference) < 0 ? "text-rose-600" : "text-ink"}`}>{toNumber(c.difference) === 0 ? "Matched" : rwf(c.difference)}</span>
                <Badge tone={c.status === "FLAGGED" ? "danger" : "ink"}>{c.status === "FLAGGED" ? "Flagged" : "Verified"}</Badge>
              </li>
            ))}
          {!checks.length && <Empty text="No checks yet." />}
        </Panel>
      )}

      {view === "credits" && (
        <Panel heading={`Sold on credit · ${rwf(creditTotal)}`} scroll>
          {[...credits]
            .sort((a, b) => b.takenAt.localeCompare(a.takenAt))
            .map((c) => (
              <li key={c.id} className="flex flex-wrap items-center gap-3 px-4 py-2.5 text-sm">
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold text-ink">
                    {c.customerName}
                    {c.customerPhone ? ` · ${c.customerPhone}` : ""}
                  </span>
                  <span className="block truncate text-xs text-ink/55">
                    {stamp(c.takenAt)} · {daysSince(c.takenAt)} days ago · served by {c.servedBy}
                    {c.takenBy ? ` · taken by ${c.takenBy}` : ""}
                  </span>
                </span>
                <span className="font-bold text-rose-600">{rwf(c.amount)}</span>
              </li>
            ))}
          {!credits.length && <Empty text="Nothing sold on credit." />}
        </Panel>
      )}

      {view === "services" && (
        <Loading {...servicePay}>
          {(rows) => (
            <Panel heading={`Service money · ${rwf(rows.reduce((s, p) => s + signedPayment(p), 0))}`} scroll>
              {rows.map((p) => (
                <li key={p.id} className="flex flex-wrap items-center gap-3 px-4 py-2.5 text-sm">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold text-ink">
                      {p.booking.customerName} · {p.booking.service.name}
                      {p.booking.unit ? ` · ${p.booking.unit.name}` : ""}
                    </span>
                    <span className="block truncate text-xs text-ink/55">
                      {stamp(p.createdAt)} · {title(p.method)} · taken by {p.takenBy?.name ?? "—"}
                      {p.isRefund ? " · refund" : ""}
                      {p.receiptNote ? ` · “${p.receiptNote}”` : ""}
                    </span>
                  </span>
                  <Badge tone={p.receipt === "CONFIRMED" ? "success" : p.receipt === "MISSING" ? "danger" : "lime"}>{p.receipt === "CONFIRMED" ? "Money in" : p.receipt === "MISSING" ? "Missing" : "Not checked"}</Badge>
                  <span className={`w-28 text-right font-bold ${p.isRefund ? "text-rose-600" : "text-ink"}`}>{rwf(signedPayment(p))}</span>
                </li>
              ))}
              {!rows.length && <Empty text="No service payments." />}
            </Panel>
          )}
        </Loading>
      )}
    </div>
  );
}
