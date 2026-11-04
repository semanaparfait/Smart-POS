"use client";

import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Check, CheckCheck, HandCoins, Undo2, Wallet } from "lucide-react";
import { ownerRequest, useOwnerData } from "@/stores/owner/api";
import { Card, EmptyState, ErrorState, PageHeader, Skeleton, Tabs, rwf } from "@/app/owner/components/ui";
import { Button, LinkButton, TextInput, todayKey } from "@/app/owner/components/forms";
import { rangeOf, signedPayment, type CheckedPayment } from "@/app/owner/finance/money";
import { PAYMENT_LABELS } from "@/app/owner/sales";

type Filter = "PENDING" | "CONFIRMED" | "MISSING" | "all";
const RECEIPT: Record<CheckedPayment["receipt"], { label: string; cls: string }> = {
  PENDING: { label: "Waiting", cls: "bg-lime text-ink" },
  CONFIRMED: { label: "Received", cls: "bg-emerald-50 text-emerald-700" },
  MISSING: { label: "Not received", cls: "bg-rose-50 text-rose-700" },
};
const sum = (list: CheckedPayment[]) => list.reduce((total, p) => total + signedPayment(p), 0);
const timeOf = (iso: string) => new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

function PaymentRow({ payment, busy, onAct }: { payment: CheckedPayment; busy: boolean; onAct: (ids: string[], path: string, init: RequestInit, done: string) => void }) {
  const [charging, setCharging] = useState(false);
  const { booking } = payment;

  const charge = async () => {
    if (!payment.takenBy) return;
    setCharging(true);
    try {
      await ownerRequest("/staff-debts", {
        method: "POST",
        body: JSON.stringify({
          userId: payment.takenBy.id,
          kind: "SHORTAGE",
          amount: Number(payment.amount),
          date: payment.createdAt.slice(0, 10),
          note: `${booking.service.name} · ${booking.code}${payment.receiptNote ? ` · ${payment.receiptNote}` : ""}`,
          source: `service-payment:${payment.id}`,
        }),
      });
      toast.success(`${rwf(payment.amount)} charged to ${payment.takenBy.name}; it comes off the salary`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not charge";
      if (/already charged/i.test(message)) toast("Already charged to the worker", { icon: "✓" });
      else toast.error(message);
    } finally {
      setCharging(false);
    }
  };

  return (
    <div className="border-b border-ink/6 px-5 py-3.5 last:border-0">
      <div className="flex flex-wrap items-center gap-3">
        <span className="w-16 text-xs text-ink/55">{timeOf(payment.createdAt)}</span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-ink">
            {booking.service.name}
            {booking.unit ? ` · ${booking.unit.name}` : ""}
          </p>
          <p className="truncate text-xs text-ink/55">
            {booking.customerName} · {booking.code}
            {payment.isRefund && payment.reason ? ` · Refund: ${payment.reason}` : ""}
          </p>
        </div>
        <span className={`w-28 text-xs font-semibold ${payment.isRefund ? "text-rose-600" : "text-ink/60"}`}>
          {payment.isRefund ? "Refund · " : ""}
          {PAYMENT_LABELS[payment.method] ?? payment.method}
        </span>
        <span className={`w-28 text-right text-sm font-bold ${payment.isRefund ? "text-rose-600" : "text-ink"}`}>
          {payment.isRefund ? "− " : ""}
          {rwf(payment.amount)}
        </span>
        <div className="flex w-64 justify-end gap-1.5">
          {payment.receipt === "PENDING" ? (
            <>
              <LinkButton small tone="outline" href={`/owner/finance/service-money/${payment.id}/missing`}>
                Not received
              </LinkButton>
              <Button small icon={Check} busy={busy} onClick={() => onAct([payment.id], "/booking-payments/confirm", { method: "PATCH", body: JSON.stringify({ ids: [payment.id] }) }, "Confirmed as received")}>
                Received
              </Button>
            </>
          ) : (
            <>
              <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${RECEIPT[payment.receipt].cls}`}>{RECEIPT[payment.receipt].label}</span>
              <Button small tone="quiet" icon={Undo2} busy={busy} onClick={() => onAct([payment.id], `/booking-payments/${payment.id}/reopen`, { method: "PATCH" }, "Back to waiting")}>
                Undo
              </Button>
            </>
          )}
        </div>
      </div>
      <p className="mt-1 pl-19 text-[11px] text-ink/50">
        {payment.isRefund ? "Given back by" : "Taken by"} {payment.takenBy?.name ?? "—"}
        {payment.receiptCheckedBy
          ? ` · ${payment.receipt === "CONFIRMED" ? "Confirmed by" : "Reported by"} ${payment.receiptCheckedBy.name}${
              payment.receiptCheckedAt ? `, ${payment.receiptCheckedAt.slice(0, 10)} ${timeOf(payment.receiptCheckedAt)}` : ""
            }`
          : ""}
      </p>
      {payment.receipt === "MISSING" && (
        <div className="mt-2 flex flex-wrap items-center gap-3 rounded-xl bg-rose-50 px-3.5 py-2.5 text-xs text-rose-700">
          <span className="flex-1">{payment.receiptNote ?? ""}</span>
          {!payment.isRefund && payment.takenBy && (
            <Button small tone="danger" icon={HandCoins} busy={charging} onClick={charge}>
              Charge {payment.takenBy.name}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// Booking money, checked payment by payment: confirm it reached the business, or
// report it missing and say why.
export default function ServiceMoney() {
  const [filter, setFilter] = useState<Filter>("PENDING");
  const [day, setDay] = useState(todayKey());
  const { from, to } = rangeOf(day, day);
  // Waiting money is listed whatever its date, so nothing old is missed.
  const listPath =
    filter === "PENDING"
      ? "/booking-payments?receipt=PENDING"
      : `/booking-payments?${new URLSearchParams({ from: from.toISOString(), to: to.toISOString(), ...(filter === "all" ? {} : { receipt: filter }) })}`;
  const listed = useOwnerData<CheckedPayment[]>(listPath);
  const waiting = useOwnerData<CheckedPayment[]>("/booking-payments?receipt=PENDING");
  const [busy, setBusy] = useState<Set<string>>(new Set());

  const act = async (ids: string[], path: string, init: RequestInit, done: string) => {
    setBusy((set) => new Set([...set, ...ids]));
    try {
      await ownerRequest(path, init);
      toast.success(done);
      listed.reload();
      waiting.reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update");
    } finally {
      setBusy((set) => new Set([...set].filter((id) => !ids.includes(id))));
    }
  };

  const payments = useMemo(() => listed.data ?? [], [listed.data]);
  // Grouped by who took the money, so each worker's takings are checked together.
  const groups = useMemo(() => {
    const map = new Map<string, { name: string; list: CheckedPayment[] }>();
    for (const p of payments) {
      const key = p.takenBy?.id ?? "none";
      if (!map.has(key)) map.set(key, { name: p.takenBy?.name ?? "Unknown", list: [] });
      map.get(key)!.list.push(p);
    }
    return [...map.entries()].sort((a, b) => a[1].name.localeCompare(b[1].name));
  }, [payments]);

  if (listed.error) return <ErrorState message={listed.error} onRetry={listed.reload} />;
  const waitingList = waiting.data ?? [];
  const missing = payments.filter((p) => p.receipt === "MISSING");

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Finance" title="Service money" description="Confirm the money taken for bookings really reached you." />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-ink p-5 text-white">
          <p className="text-xs font-semibold text-white/60">Waiting to confirm</p>
          <p className="mt-2 text-2xl font-extrabold text-lime">
            {rwf(sum(waitingList))} · {waitingList.length}
          </p>
        </div>
        {filter !== "PENDING" && (
          <>
            <div className="rounded-2xl border border-ink/10 bg-white p-5">
              <p className="text-xs font-semibold text-ink/55">Received</p>
              <p className="mt-2 text-2xl font-extrabold text-emerald-700">{rwf(sum(payments.filter((p) => p.receipt === "CONFIRMED")))}</p>
            </div>
            <div className="rounded-2xl border border-ink/10 bg-white p-5">
              <p className="text-xs font-semibold text-ink/55">Not received</p>
              <p className={`mt-2 text-2xl font-extrabold ${missing.length ? "text-rose-600" : "text-ink"}`}>{rwf(sum(missing))}</p>
            </div>
          </>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Tabs
          options={[
            { value: "PENDING", label: "Waiting" },
            { value: "CONFIRMED", label: "Received" },
            { value: "MISSING", label: "Not received" },
            { value: "all", label: "All" },
          ]}
          value={filter}
          onChange={setFilter}
        />
        {filter !== "PENDING" ? (
          <TextInput type="date" value={day} max={todayKey()} onChange={(e) => setDay(e.target.value || todayKey())} className="h-10 w-44" aria-label="Date" />
        ) : (
          <span className="text-xs text-ink/50">All waiting money, whatever the date</span>
        )}
      </div>

      {listed.loading && !listed.data ? (
        <Skeleton className="h-48" />
      ) : groups.length === 0 ? (
        <Card>
          <EmptyState
            icon={filter === "PENDING" ? CheckCheck : Wallet}
            title={filter === "PENDING" ? "Everything is confirmed" : "No payments"}
            text={filter === "PENDING" ? "New booking money will wait here." : "Try another day or filter."}
          />
        </Card>
      ) : (
        groups.map(([key, group]) => {
          const confirmable = group.list.filter((p) => p.receipt === "PENDING");
          return (
            <Card
              key={key}
              title={group.name}
              description={`${group.list.length} ${group.list.length === 1 ? "payment" : "payments"} · ${rwf(sum(group.list))}`}
              action={
                confirmable.length > 1 ? (
                  <Button
                    small
                    icon={CheckCheck}
                    onClick={() =>
                      act(
                        confirmable.map((p) => p.id),
                        "/booking-payments/confirm",
                        { method: "PATCH", body: JSON.stringify({ ids: confirmable.map((p) => p.id) }) },
                        "Confirmed as received",
                      )
                    }
                  >
                    Confirm all · {rwf(sum(confirmable))}
                  </Button>
                ) : undefined
              }
            >
              <div className="overflow-x-auto">
                <div className="min-w-[760px]">
                  {group.list.map((p) => (
                    <PaymentRow key={p.id} payment={p} busy={busy.has(p.id)} onAct={act} />
                  ))}
                </div>
              </div>
            </Card>
          );
        })
      )}
    </div>
  );
}
