"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Check, HandCoins, Pencil, Plus, Receipt, Repeat, Square, Trash2, Undo2, Users, Wallet, X } from "lucide-react";
import { ownerRequest, useOwnerData } from "@/stores/owner/api";
import { Badge, Card, EmptyState, ErrorState, PageHeader, SearchInput, Skeleton, StatCard, Tabs, rwf, toNumber } from "@/app/owner/components/ui";
import { Button, LinkButton, todayKey } from "@/app/owner/components/forms";
import { PAID_FROM, REPAID_WITH, categoryLabel, repeatOf, type RepaidWith } from "@/app/owner/finance/labels";
import { chargeBody, isRunning, monthlyAmount, owedBack, type Expense } from "@/app/owner/finance/money";
import { EXPENSES } from "@/app/owner/expenses/ExpenseForm";

interface Salaries {
  monthly: number;
  workers: { id: string; name: string; salary: number }[];
}
type List = "running" | "once" | "stopped" | "rejected" | "all";
const counts = (e: Expense) => !e.status || e.status === "APPROVED";

// Runs one change and reports it, so every button works the same way.
function useAct(onDone: () => void) {
  const [busy, setBusy] = useState<string | null>(null);
  const act = async (key: string, path: string, init: RequestInit, done: string) => {
    setBusy(key);
    try {
      await ownerRequest(path, init);
      toast.success(done);
      onDone();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not update";
      if (/already charged/i.test(message)) toast("Already charged to the worker", { icon: "✓" });
      else toast.error(message);
      return false;
    } finally {
      setBusy(null);
    }
  };
  return { busy, act };
}

// A worker's expense with its receipt: approve it, or reject it saying why.
function PendingRow({ expense, onDone }: { expense: Expense; onDone: () => void }) {
  const { busy, act } = useAct(onDone);
  return (
    <li className="px-5 py-4">
      <div className="flex flex-wrap items-center gap-3">
        {expense.proofUrl ? (
          <a href={expense.proofUrl} target="_blank" rel="noopener noreferrer" className="h-13 w-13 shrink-0 overflow-hidden rounded-xl bg-ivory ring-1 ring-ink/10">
            {/* eslint-disable-next-line @next/next/no-img-element -- the receipt photo in the API's storage */}
            <img src={expense.proofUrl} alt="Receipt" className="h-full w-full object-cover" />
          </a>
        ) : (
          <span className="flex h-13 w-13 shrink-0 items-center justify-center rounded-xl bg-ivory text-[10px] text-ink/45">No photo</span>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-ink">
            {expense.title} · {rwf(expense.amount)}
          </p>
          <p className="text-xs text-ink/55">
            {expense.recordedBy?.name ?? "—"} · {expense.startDate} · {expense.paidFrom ? PAID_FROM[expense.paidFrom] : "Other"}
            {expense.note ? ` · ${expense.note}` : ""}
          </p>
          {expense.paidFrom === "OWN_MONEY" && <p className="mt-1 text-xs font-semibold text-rose-600">Paid with their own money: pay it back once approved.</p>}
        </div>
        <LinkButton small tone="outline" icon={X} href={`${EXPENSES}/${expense.id}/reject`}>
          Reject
        </LinkButton>
        <Button
          small
          icon={Check}
          busy={busy === "approve"}
          onClick={() =>
            act("approve", `/expenses/${expense.id}/approve`, { method: "PATCH" }, expense.paidFrom === "OWN_MONEY" ? `Expense approved. Pay back ${rwf(expense.amount)} to ${expense.recordedBy?.name ?? ""}` : "Expense approved")
          }
        >
          Approve
        </Button>
      </div>
    </li>
  );
}

function OwedRow({ expense, onDone }: { expense: Expense; onDone: () => void }) {
  const { busy, act } = useAct(onDone);
  return (
    <li className="flex flex-wrap items-center gap-3 px-5 py-3.5">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-ink">
          {expense.recordedBy?.name ?? "—"} · {rwf(expense.amount)}
        </p>
        <p className="text-xs text-ink/55">
          {expense.title} · {expense.startDate}
        </p>
      </div>
      <span className="text-xs text-ink/55">Paid back with</span>
      {REPAID_WITH.map((m) => (
        <Button
          key={m.value}
          small
          tone="outline"
          busy={busy === m.value}
          onClick={() => act(m.value, `/expenses/${expense.id}/repaid`, { method: "PATCH", body: JSON.stringify({ method: m.value as RepaidWith }) }, `Marked as paid back: ${expense.recordedBy?.name ?? ""} · ${rwf(expense.amount)} · ${m.label}`)}
        >
          {m.label}
        </Button>
      ))}
    </li>
  );
}

function ExpenseRow({ expense, today, onDone }: { expense: Expense; today: string; onDone: () => void }) {
  const { busy, act } = useAct(onDone);
  const repeat = repeatOf(expense.repeat);
  const tillExpense = expense.paidFrom === "TILL_CASH" || expense.paidFrom === "TILL_MOMO";
  return (
    <li className="flex flex-col gap-3 px-5 py-4 lg:flex-row lg:items-center">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        {expense.proofUrl ? (
          <a href={expense.proofUrl} target="_blank" rel="noopener noreferrer" className="h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-ivory ring-1 ring-ink/10" title="Receipt">
            {/* eslint-disable-next-line @next/next/no-img-element -- the receipt photo in the API's storage */}
            <img src={expense.proofUrl} alt="Receipt" className="h-full w-full object-cover" />
          </a>
        ) : (
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ivory text-ink/60">
            {expense.repeat === "ONCE" ? <Receipt className="h-4.5 w-4.5" /> : <Repeat className="h-4.5 w-4.5" />}
          </span>
        )}
        <div className="min-w-0">
          <p className="truncate font-semibold text-ink">{expense.title}</p>
          <p className="text-xs text-ink/55">
            {categoryLabel(expense.category)} · {expense.repeat === "ONCE" ? `Paid on ${expense.startDate}` : `${repeat.label}, from ${expense.startDate}${expense.endDate ? ` to ${expense.endDate}` : ""}`}
            {expense.note ? ` · ${expense.note}` : ""}
          </p>
          {expense.reviewedBy && (
            <p className="text-xs text-ink/55">
              Sent by {expense.recordedBy?.name ?? "—"} · {expense.status === "REJECTED" ? "Rejected by" : "Approved by"} {expense.reviewedBy.name}
              {expense.status === "REJECTED" && expense.reviewNote ? `: ${expense.reviewNote}` : ""}
              {expense.status === "APPROVED" && expense.paidFrom ? ` · ${PAID_FROM[expense.paidFrom]}` : ""}
            </p>
          )}
          {expense.status === "APPROVED" && expense.paidFrom === "OWN_MONEY" && (
            <p className={`text-xs font-semibold ${expense.repaidAt ? "text-emerald-700" : "text-rose-600"}`}>
              {expense.repaidAt
                ? `Paid back ${expense.repaidAt.slice(0, 10)} · ${REPAID_WITH.find((m) => m.value === expense.repaidWith)?.label ?? ""}${expense.repaidBy ? ` · ${expense.repaidBy.name}` : ""}`
                : "Not paid back yet"}
            </p>
          )}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 lg:justify-end">
        <p className="mr-2 text-right">
          <span className={`block text-base font-extrabold ${expense.status === "REJECTED" ? "text-ink/40 line-through" : "text-ink"}`}>{rwf(expense.amount)}</span>
          {repeat.per && <span className="block text-[11px] text-ink/50">{repeat.per}</span>}
        </p>
        {expense.status === "REJECTED" && <Badge tone="danger">Rejected</Badge>}
        {expense.status === "REJECTED" && tillExpense && expense.recordedBy && (
          <Button
            small
            tone="danger"
            icon={HandCoins}
            busy={busy === "charge"}
            onClick={() =>
              act(
                "charge",
                "/staff-debts",
                {
                  method: "POST",
                  body: chargeBody(expense.recordedBy!.id, "EXPENSE", toNumber(expense.amount), expense.startDate, `${expense.title}${expense.reviewNote ? ` · ${expense.reviewNote}` : ""}`, `expense:${expense.id}`),
                },
                `${rwf(expense.amount)} charged to ${expense.recordedBy!.name}; it comes off the salary`,
              )
            }
          >
            Charge {expense.recordedBy.name}
          </Button>
        )}
        {expense.repaidAt && (
          <Button small tone="quiet" icon={Undo2} busy={busy === "unrepaid"} onClick={() => act("unrepaid", `/expenses/${expense.id}/not-repaid`, { method: "PATCH" }, "Back to not paid back")}>
            Undo pay back
          </Button>
        )}
        {isRunning(expense, today) && (
          <Button
            small
            tone="quiet"
            icon={Square}
            busy={busy === "stop"}
            onClick={() => act("stop", `/expenses/${expense.id}`, { method: "PATCH", body: JSON.stringify({ endDate: today < expense.startDate ? expense.startDate : today }) }, `Stopped from today: ${expense.title}`)}
          >
            Stop
          </Button>
        )}
        {expense.status !== "REJECTED" && (
          <Link href={`${EXPENSES}/${expense.id}`} className="inline-flex h-8 items-center gap-1.5 rounded-xl px-3 text-xs font-semibold text-ink/60 hover:bg-ivory hover:text-ink">
            <Pencil className="h-4 w-4" /> Edit
          </Link>
        )}
        <Button small tone="quiet" icon={Trash2} busy={busy === "delete"} onClick={() => act("delete", `/expenses/${expense.id}`, { method: "DELETE" }, `Expense deleted: ${expense.title}`)}>
          Delete
        </Button>
      </div>
    </li>
  );
}

// What the company spends to run. Workers' salaries come in by themselves.
export default function OwnerExpenses() {
  const expenses = useOwnerData<Expense[]>("/expenses");
  const salaries = useOwnerData<Salaries>("/expenses/salaries");
  const [list, setList] = useState<List>("running");
  const [search, setSearch] = useState("");
  const reload = expenses.reload;

  const all = useMemo(
    () => [...(expenses.data ?? [])].sort((a, b) => b.startDate.localeCompare(a.startDate) || (b.createdAt ?? "").localeCompare(a.createdAt ?? "")),
    [expenses.data],
  );
  if (expenses.error) return <ErrorState message={expenses.error} onRetry={expenses.reload} />;

  const today = todayKey();
  const thisMonth = today.slice(0, 7);
  const approved = all.filter(counts);
  const pending = all.filter((e) => e.status === "PENDING");
  const owed = all.filter(owedBack);
  const running = approved.filter((e) => isRunning(e, today));
  const monthlyRunning = running.reduce((sum, e) => sum + monthlyAmount(e), 0);
  const onceThisMonth = approved.filter((e) => e.repeat === "ONCE" && e.startDate.startsWith(thisMonth)).reduce((sum, e) => sum + toNumber(e.amount), 0);
  const monthlySalaries = salaries.data?.monthly ?? 0;

  const inList = (e: Expense, l: List) =>
    l === "all"
      ? true
      : l === "rejected"
        ? e.status === "REJECTED"
        : counts(e) && (l === "running" ? running.includes(e) : l === "once" ? e.repeat === "ONCE" : e.repeat !== "ONCE" && !running.includes(e));
  const query = search.trim().toLowerCase();
  const shown = all.filter((e) => inList(e, list) && (!query || [e.title, categoryLabel(e.category), e.recordedBy?.name, e.note].some((v) => v?.toLowerCase().includes(query))));
  const count = (l: List) => all.filter((e) => inList(e, l)).length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Finance"
        title="Expenses"
        description="Rent, bills and everything the company pays to run. They come off the profit in the Overview."
        actions={
          <LinkButton icon={Plus} href={`${EXPENSES}/new`}>
            Add expense
          </LinkButton>
        }
      />

      {expenses.loading && !expenses.data ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Repeating costs" value={rwf(monthlyRunning)} icon={Repeat} hint={`${running.length} · per month`} />
          <StatCard label="Salaries" value={rwf(monthlySalaries)} icon={Users} hint={`${salaries.data?.workers.length ?? 0} workers · per month`} />
          <StatCard label="One-time this month" value={rwf(onceThisMonth)} icon={Receipt} />
          <StatCard tone="dark" label="Fixed costs a month" value={rwf(monthlyRunning + monthlySalaries)} icon={Wallet} hint="What you must earn to break even" />
        </div>
      )}

      {pending.length > 0 && (
        <Card title={`Waiting for approval · ${pending.length}`} description="Sent by workers with a photo of the receipt. Only approved ones lower the profit.">
          <ul className="divide-y divide-ink/6">
            {pending.map((e) => (
              <PendingRow key={e.id} expense={e} onDone={reload} />
            ))}
          </ul>
        </Card>
      )}

      {owed.length > 0 && (
        <Card title={`Owed back to workers · ${rwf(owed.reduce((s, e) => s + toNumber(e.amount), 0))}`} description="They paid these with their own money. Click how you paid them back.">
          <ul className="divide-y divide-ink/6">
            {owed.map((e) => (
              <OwedRow key={e.id} expense={e} onDone={reload} />
            ))}
          </ul>
        </Card>
      )}

      <Card title="Workers" description="Counted by themselves from each worker's monthly salary. Change a salary in Workers.">
        {(salaries.data?.workers ?? []).length === 0 ? (
          <p className="px-5 py-4 text-sm text-ink/55">No worker has a salary set.</p>
        ) : (
          <ul className="divide-y divide-ink/6">
            {salaries.data!.workers.map((w) => (
              <li key={w.id} className="flex items-center justify-between px-5 py-2.5 text-sm">
                <span className="text-ink">{w.name}</span>
                <span className="font-semibold text-ink">{rwf(w.salary)} / month</span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Tabs
          options={[
            { value: "running", label: "Repeating", count: count("running") },
            { value: "once", label: "One time", count: count("once") },
            { value: "stopped", label: "Stopped", count: count("stopped") },
            { value: "rejected", label: "Rejected", count: count("rejected") },
            { value: "all", label: "All", count: all.length },
          ]}
          value={list}
          onChange={setList}
        />
        <SearchInput value={search} onChange={setSearch} placeholder="Name, kind, worker or note" />
      </div>

      <Card>
        {expenses.loading && !expenses.data ? (
          <div className="space-y-2 p-5">
            <Skeleton className="h-14" />
            <Skeleton className="h-14" />
          </div>
        ) : shown.length === 0 ? (
          <EmptyState icon={Receipt} title="No expenses here" text="Add rent, electricity, water and other costs to see your real profit." />
        ) : (
          <ul className="divide-y divide-ink/6">
            {shown.map((e) => (
              <ExpenseRow key={e.id} expense={e} today={today} onDone={reload} />
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
