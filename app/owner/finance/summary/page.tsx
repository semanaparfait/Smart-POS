"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { AlertCircle, CalendarDays, CheckCheck, CheckCircle2, ChevronDown, ChevronRight, Clock, Download, Flag, Info, ShieldCheck, Wallet, type LucideIcon } from "lucide-react";
import useAuthStore from "@/stores/auth/authstore";
import { useOwnerData } from "@/stores/owner/api";
import type { Order } from "@/app/owner/types";
import { ErrorState, PageHeader, Skeleton, Tabs, dayKey, formatDate, rwf, toNumber } from "@/app/owner/components/ui";
import { Button, TextInput } from "@/app/owner/components/forms";
import { COUNTED, buildWorkerDays, type Method, type ServicePayment, type TillExpense } from "@/app/owner/finance/workerDays";
import { downloadCsv, shiftDays, signedRwf } from "@/app/owner/finance/money";

type Period = "today" | "yesterday" | "week" | "month" | "custom";
type CheckState = "verified" | "flagged" | "awaiting";
const MAX_DAYS = 92;

interface Check {
  date: string;
  worker: { id: string };
  status: "VERIFIED" | "FLAGGED";
  counted: Partial<Record<Method, number>>;
  difference: string | number;
  note: string | null;
  decidedAt: string;
  decidedByName: string;
}

// One worker's money for one day: what they should hand in, and what was counted.
interface Row {
  day: string;
  name: string;
  expected: number;
  byMethod: Record<Method, number>;
  check: CheckState;
  counted: number | null;
  difference: number | null;
  record?: Check;
}

const CHECK_META: Record<CheckState, { label: string; cls: string }> = {
  verified: { label: "Checked", cls: "bg-ink text-lime" },
  flagged: { label: "Flagged", cls: "bg-rose-50 text-rose-700" },
  awaiting: { label: "Not checked", cls: "bg-lime/40 text-ink" },
};

// The days a period covers, oldest first.
const daysOf = (period: Period, from: string, to: string): string[] => {
  const today = new Date();
  let first: Date;
  let last = today;
  if (period === "today") first = today;
  else if (period === "yesterday") first = last = shiftDays(today, -1);
  else if (period === "week") first = shiftDays(today, -6);
  else if (period === "month") first = new Date(today.getFullYear(), today.getMonth(), 1);
  else {
    if (!from || !to) return [];
    const [a, b] = from <= to ? [from, to] : [to, from];
    first = new Date(`${a}T00:00:00`);
    last = new Date(`${b}T00:00:00`);
  }
  const days: string[] = [];
  for (let d = new Date(first); dayKey(d) <= dayKey(last) && days.length < MAX_DAYS; d = shiftDays(d, 1)) days.push(dayKey(d));
  return days;
};

const sum = (values: number[]) => values.reduce((a, b) => a + b, 0);
// Green only when the count matches what those checked days should have brought.
const countTone = (counted: number, expectedOfChecked: number, anyChecked: boolean) =>
  !anyChecked ? "text-ink/45" : counted < expectedOfChecked ? "text-rose-600" : counted === expectedOfChecked ? "text-emerald-700" : "text-ink";
const dayLabel = (day: string) => {
  const today = dayKey(new Date());
  const yesterday = dayKey(shiftDays(new Date(), -1));
  return day === today ? "Today" : day === yesterday ? "Yesterday" : formatDate(`${day}T12:00:00`);
};

function Sentence({ icon: Icon, tone = "text-ink", children }: { icon: LucideIcon; tone?: string; children: React.ReactNode }) {
  return (
    <p className="flex items-start gap-2.5 text-sm text-ink">
      <Icon className={`mt-0.5 h-4.5 w-4.5 shrink-0 ${tone}`} />
      <span>{children}</span>
    </p>
  );
}

// The money workers should hand in, and how much of it was checked.
export default function MoneySummary() {
  const servicesOn = useAuthStore((s) => s.user?.company?.features?.services !== false);
  const [period, setPeriod] = useState<Period>("week");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [openDay, setOpenDay] = useState<string | null>(null);
  const days = useMemo(() => daysOf(period, from, to), [period, from, to]);
  const first = days[0];
  const last = days[days.length - 1];

  const orders = useOwnerData<Order[]>("/orders");
  const checks = useOwnerData<Check[]>("/money-checks");
  const expenses = useOwnerData<TillExpense[]>("/expenses");
  const services = useOwnerData<ServicePayment[]>(
    servicesOn && first
      ? `/booking-payments?${new URLSearchParams({ from: new Date(`${first}T00:00:00`).toISOString(), to: shiftDays(new Date(`${last}T00:00:00`), 1).toISOString() })}`
      : null,
  );

  const rows = useMemo(() => {
    const list: Row[] = [];
    for (const day of days) {
      const dayServices = (services.data ?? []).filter((p) => dayKey(new Date(p.createdAt)) === day);
      for (const w of buildWorkerDays(orders.data ?? [], day, dayServices, expenses.data ?? [])) {
        const record = (checks.data ?? []).find((c) => c.date === day && c.worker.id === w.user.id);
        const expected = sum(COUNTED.map((m) => w.expected[m]));
        if (expected === 0 && !record) continue;
        list.push({
          day,
          name: w.user.employee?.name ?? w.user.name ?? "Unknown",
          expected,
          byMethod: w.expected,
          check: record ? (record.status === "FLAGGED" ? "flagged" : "verified") : "awaiting",
          counted: record ? sum(COUNTED.map((m) => toNumber(record.counted[m]))) : null,
          difference: record ? toNumber(record.difference) : null,
          record,
        });
      }
    }
    return list;
  }, [days, orders.data, services.data, expenses.data, checks.data]);

  if (orders.error) return <ErrorState message={orders.error} onRetry={orders.reload} />;

  const expected = sum(rows.map((r) => r.expected));
  const checkedRows = rows.filter((r) => r.check !== "awaiting");
  const waitingRows = rows.filter((r) => r.check === "awaiting");
  const checkedExpected = sum(checkedRows.map((r) => r.expected));
  const counted = sum(checkedRows.map((r) => r.counted ?? 0));
  const difference = sum(checkedRows.map((r) => r.difference ?? 0));
  const waiting = sum(waitingRows.map((r) => r.expected));
  const flagged = rows.filter((r) => r.check === "flagged").length;
  const share = expected > 0 ? Math.min(1, checkedExpected / expected) : 0;
  const byDay = [...days].reverse().flatMap((day) => {
    const list = rows.filter((r) => r.day === day);
    return list.length ? [{ day, rows: list }] : [];
  });

  const download = () => {
    if (!rows.length) return toast("Nothing to export for these days");
    downloadCsv(`money-${first}${first === last ? "" : `-to-${last}`}.csv`, [
      ["Date", "Worker", "Cash expected", "MoMo expected", "Card expected", "Total expected", "Counted", "Difference", "Status", "Checked by", "Checked at", "Note"],
      ...rows.map((r) => [
        r.day,
        r.name,
        r.byMethod.CASH,
        r.byMethod.MOMO,
        r.byMethod.CARD,
        r.expected,
        r.counted,
        r.difference,
        CHECK_META[r.check].label,
        r.record?.decidedByName,
        r.record ? new Date(r.record.decidedAt).toLocaleString("en-GB") : "",
        r.record?.note,
      ]),
      ["Total", "", "", "", "", expected, counted, difference, "", "", "", ""],
    ]);
    toast.success("Export downloaded");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Finance"
        title="Money summary"
        description="The money workers should hand in, and how much of it you have checked."
        actions={
          <Button icon={Download} onClick={download}>
            Export
          </Button>
        }
      />
      <div className="flex flex-wrap items-end gap-3">
        <Tabs
          options={[
            { value: "today", label: "Today" },
            { value: "yesterday", label: "Yesterday" },
            { value: "week", label: "Last 7 days" },
            { value: "month", label: "This month" },
            { value: "custom", label: "Pick days" },
          ]}
          value={period}
          onChange={setPeriod}
        />
        {period === "custom" && (
          <>
            <TextInput type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="h-10 w-44" aria-label="From" />
            <TextInput type="date" value={to} onChange={(e) => setTo(e.target.value)} className="h-10 w-44" aria-label="To" />
          </>
        )}
      </div>

      {orders.loading && !orders.data ? (
        <Skeleton className="h-64" />
      ) : days.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-ink/10 bg-white py-14 text-center">
          <CalendarDays className="h-7 w-7 text-ink/35" />
          <p className="mt-2 text-sm font-semibold text-ink">Pick the first and last day.</p>
        </div>
      ) : (
        <>
          <div className="space-y-3 rounded-2xl border border-ink/10 bg-white p-5">
            {rows.length === 0 ? (
              <Sentence icon={Info} tone="text-ink/45">
                No money came in on these days.
              </Sentence>
            ) : (
              <>
                <Sentence icon={Wallet}>Workers should hand in {rwf(expected)} in cash, MoMo and card.</Sentence>
                <Sentence icon={CheckCircle2} tone="text-emerald-600">
                  {checkedRows.length === 0 ? "You haven't checked any of it yet." : `You checked ${rwf(checkedExpected)} of it and counted ${rwf(counted)}.`}
                </Sentence>
                {waiting !== 0 && (
                  <Sentence icon={Clock}>
                    {rwf(waiting)} is still waiting to be checked ({waitingRows.length} worker days).
                  </Sentence>
                )}
                {checkedRows.length > 0 && (
                  <Sentence icon={difference < 0 ? AlertCircle : CheckCheck} tone={difference < 0 ? "text-rose-600" : "text-emerald-600"}>
                    {difference === 0
                      ? "What was counted matched what was expected."
                      : difference < 0
                        ? `The counts were ${rwf(-difference)} short.`
                        : `The counts were ${rwf(difference)} over.`}
                  </Sentence>
                )}
                {flagged > 0 && (
                  <Sentence icon={Flag} tone="text-rose-600">
                    {flagged} worker days were flagged for a closer look.
                  </Sentence>
                )}
                <div className="pt-1">
                  <div className="h-2 overflow-hidden rounded-full bg-ivory">
                    <div className="h-full rounded-full bg-ink" style={{ width: `${share * 100}%` }} />
                  </div>
                  <p className="mt-1 text-xs text-ink/55">{Math.round(share * 100)}% checked</p>
                </div>
              </>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Expected", value: rwf(expected), hint: "Cash, MoMo and card, less bills paid from the till", tone: "text-ink" },
              {
                label: "Checked",
                value: rwf(counted),
                hint: `Should be ${rwf(checkedExpected)} · ${checkedRows.length} worker days`,
                tone: countTone(counted, checkedExpected, checkedRows.length > 0),
              },
              { label: "Not checked", value: rwf(waiting), hint: `${waitingRows.length} worker days`, tone: "text-ink" },
              { label: "Difference", value: signedRwf(difference), hint: "Counted minus expected, on checked days", tone: difference < 0 ? "text-rose-600" : "text-ink" },
            ].map((k) => (
              <div key={k.label} className="rounded-2xl border border-ink/10 bg-white p-5">
                <p className="text-xs font-semibold text-ink/55">{k.label}</p>
                <p className={`mt-2 truncate text-2xl font-extrabold ${k.tone}`}>{k.value}</p>
                <p className="mt-1 text-xs text-ink/50">{k.hint}</p>
              </div>
            ))}
          </div>

          {byDay.length > 0 && (
            <div className="overflow-hidden rounded-2xl border border-ink/10 bg-white">
              {byDay.map((d) => {
                const dayExpected = sum(d.rows.map((r) => r.expected));
                const dayChecked = d.rows.filter((r) => r.check !== "awaiting");
                const dayCounted = sum(dayChecked.map((r) => r.counted ?? 0));
                const dayCheckedExpected = sum(dayChecked.map((r) => r.expected));
                const toCheck = d.rows.filter((r) => r.check === "awaiting").length;
                const open = openDay === d.day;
                return (
                  <div key={d.day} className="border-b border-ink/6 last:border-0">
                    <button type="button" onClick={() => setOpenDay(open ? null : d.day)} aria-expanded={open} className="flex w-full items-center gap-3 px-5 py-3.5 text-left hover:bg-ivory/60">
                      {open ? <ChevronDown className="h-4 w-4 text-ink/45" /> : <ChevronRight className="h-4 w-4 text-ink/45" />}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-ink">{dayLabel(d.day)}</p>
                        <p className="text-xs text-ink/55">{toCheck === 0 ? "All checked" : `${toCheck} of ${d.rows.length} workers to check`}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-ink/50">Expected {rwf(dayExpected)}</p>
                        <p className={`text-sm font-bold ${countTone(dayCounted, dayCheckedExpected, dayChecked.length > 0)}`}>{dayChecked.length > 0 ? rwf(dayCounted) : "—"}</p>
                        {dayChecked.length > 0 && dayCounted !== dayCheckedExpected && <p className="text-[11px] text-ink/45">Should be {rwf(dayCheckedExpected)}</p>}
                      </div>
                    </button>
                    {open && (
                      <div className="space-y-2 bg-ivory/50 px-5 py-3">
                        {d.rows.map((r) => (
                          <div key={r.name} className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 ring-1 ring-inset ring-ink/8">
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-ink">{r.name}</p>
                              <p className="text-xs text-ink/55">
                                Expected {rwf(r.expected)} ·{" "}
                                {r.record ? `Counted ${rwf(r.counted ?? 0)} · ${signedRwf(r.difference ?? 0)} · by ${r.record.decidedByName}` : "Waiting for you to count"}
                              </p>
                            </div>
                            <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${CHECK_META[r.check].cls}`}>{CHECK_META[r.check].label}</span>
                          </div>
                        ))}
                        {d.rows.some((r) => r.check === "awaiting") && (
                          <Link href="/owner/money-checks" className="inline-flex items-center gap-1.5 text-xs font-bold text-ink hover:underline">
                            <ShieldCheck className="h-3.5 w-3.5" /> Check this day
                          </Link>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          <p className="text-xs text-ink/50">
            Credit sales are money still owed, so they aren&apos;t counted here. See{" "}
            <Link href="/owner/finance/credits" className="font-semibold text-ink underline">
              Credits
            </Link>
            .
          </p>
        </>
      )}
    </div>
  );
}
