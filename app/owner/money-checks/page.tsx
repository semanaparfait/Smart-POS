"use client";

import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { ArrowRight, BadgeCheck, BedDouble, ChevronDown, ChevronLeft, ChevronRight, CircleAlert, Clock, Flag, HandCoins, Receipt, RotateCcw, Scale, Wallet } from "lucide-react";
import useAuthStore from "@/stores/auth/authstore";
import { ordersSince, ownerRequest, useOwnerData } from "@/stores/owner/api";
import type { Order } from "@/app/owner/types";
import { Avatar, Badge, Card, EmptyState, ErrorState, PageHeader, Skeleton, StatCard, Tabs, dayKey, formatDate, rwf, toNumber } from "@/app/owner/components/ui";
import { Button, MoneyInput, TextArea, TextInput, todayKey } from "@/app/owner/components/forms";
import { COUNTED, buildWorkerDays, paidAt, type Method, type ServicePayment, type TillExpense, type WorkerDay } from "@/app/owner/finance/workerDays";
import { orderNumber } from "@/app/owner/finance/money";
import { PAYMENT_LABELS } from "@/app/owner/sales";

type Status = "VERIFIED" | "FLAGGED";

interface Check {
  date: string;
  worker: { id: string };
  status: Status;
  counted: Partial<Record<Method, number>>;
  expected: Partial<Record<Method, number>>;
  difference: string | number;
  note: string | null;
  decidedAt: string;
  decidedByName: string;
}

const signed = (value: number) => (value === 0 ? "0 RWF" : `${value > 0 ? "+" : "−"}${rwf(Math.abs(value))}`);

const shiftDay = (date: string, by: number) => {
  const d = new Date(`${date}T12:00:00`);
  d.setDate(d.getDate() + by);
  return dayKey(d);
};

// The shortage charged for a count, so it is charged once and removed if the count is reopened.
const shortageSource = (date: string, userId: string) => `count:${date}:${userId}`;

// What the table leaves out or already took off, in plain words.
function Notices({ day }: { day: WorkerDay }) {
  const waiting = day.servicePayments.filter((p) => p.receipt === "PENDING").length;
  const missing = day.servicePayments.filter((p) => p.receipt === "MISSING").length;
  const unrecorded = day.unrecorded.reduce((s, o) => s + toNumber(o.total), 0);
  const pending = day.pending.reduce((s, o) => s + toNumber(o.total), 0);
  const notes: { text: React.ReactNode; tone?: "danger" }[] = [];
  if (day.paidOut.length)
    notes.push({
      text: `Paid out of the till for expenses: ${rwf(day.paidOut.reduce((s, e) => s + toNumber(e.amount), 0))} (${day.paidOut
        .map((e) => `${e.title}${e.status === "PENDING" ? " · waiting for approval" : ""}`)
        .join(", ")}). Already taken off what should be received.`,
    });
  if (day.servicePayments.length)
    notes.push({
      text: `Includes service money: ${rwf(day.services)} (${day.servicePayments.length}). ${waiting ? `${waiting} waiting, confirmed when you verify.` : "All confirmed."}${
        missing ? ` ${missing} reported as not received.` : ""
      }`,
      tone: missing ? "danger" : undefined,
    });
  if (day.credits.length)
    notes.push({
      text: (
        <>
          <span className="font-semibold">Given on credit (not counted): {rwf(day.expected.CREDIT)}</span>
          {day.credits.map(({ order, payment }, i) => (
            <span key={i} className="block">
              {payment.creditOwnerName || "Unknown"}
              {payment.creditOwnerPhone ? ` · ${payment.creditOwnerPhone}` : ""} · {orderNumber(order)} · {rwf(payment.amount)}
            </span>
          ))}
        </>
      ),
    });
  if (day.unrecorded.length)
    notes.push({
      text: `${day.unrecorded.length} paid order${day.unrecorded.length === 1 ? " has" : "s have"} no payment details (${rwf(unrecorded)}) and ${day.unrecorded.length === 1 ? "is" : "are"} not in the table.`,
    });
  if (day.pending.length)
    notes.push({ text: `${day.pending.length} order${day.pending.length === 1 ? " is" : "s are"} still waiting for payment (${rwf(pending)}).` });
  if (!notes.length) return null;
  return (
    <div className="space-y-2 border-t border-ink/6 px-5 py-3">
      {notes.map((n, i) => (
        <p key={i} className={`rounded-xl px-3 py-2 text-xs ${n.tone === "danger" ? "bg-rose-50 text-rose-700" : "bg-ivory text-ink/70"}`}>
          {n.text}
        </p>
      ))}
    </div>
  );
}

type OrderFilter = "ALL" | "COMPLETED" | "PENDING" | "CANCELLED";

// Every order the worker made that day, to look into a difference.
function WorkerOrders({ day }: { day: WorkerDay }) {
  const [filter, setFilter] = useState<OrderFilter>("ALL");
  const [openId, setOpenId] = useState<string | null>(null);
  const list = day.orders.filter((o) => filter === "ALL" || o.status === filter);
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-4 gap-2 text-center">
        {[
          ["Paid", rwf(day.sales)],
          ["Orders", String(day.orders.length)],
          ["Pending", String(day.pending.length)],
          ["Cancelled", String(day.cancelled.length)],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl bg-white px-2 py-2 ring-1 ring-inset ring-ink/8">
            <p className="text-[11px] text-ink/50">{label}</p>
            <p className="text-sm font-bold text-ink">{value}</p>
          </div>
        ))}
      </div>
      <Tabs
        options={[
          { value: "ALL", label: "All", count: day.orders.length },
          { value: "COMPLETED", label: "Paid", count: day.completed.length },
          { value: "PENDING", label: "Pending", count: day.pending.length },
          { value: "CANCELLED", label: "Cancelled", count: day.cancelled.length },
        ]}
        value={filter}
        onChange={setFilter}
      />
      {list.length === 0 ? (
        <p className="text-xs text-ink/55">No orders in this filter.</p>
      ) : (
        <ul className="divide-y divide-ink/6 rounded-xl bg-white ring-1 ring-inset ring-ink/10">
          {list.map((o) => {
            const open = openId === o.id;
            const count = (o.items ?? []).reduce((s, i) => s + i.quantity, 0);
            const payments = o.payments ?? [];
            return (
              <li key={o.id}>
                <button type="button" onClick={() => setOpenId(open ? null : o.id)} aria-expanded={open} className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-ivory/60">
                  <span className="w-12 text-xs text-ink/50">{new Date(o.status === "COMPLETED" ? paidAt(o) : o.createdAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</span>
                  <span className="min-w-0 flex-1 truncate text-ink/80">
                    {count} item{count === 1 ? "" : "s"} · {(o.items ?? []).map((i) => `${i.quantity}× ${i.product?.name ?? "Item"}`).join(", ")}
                  </span>
                  <span className="font-semibold text-ink">{rwf(o.total)}</span>
                  <Badge tone={o.status === "COMPLETED" ? "ink" : o.status === "CANCELLED" ? "danger" : "lime"}>
                    {o.status === "COMPLETED" ? "Paid" : o.status === "CANCELLED" ? "Cancelled" : "Pending"}
                  </Badge>
                  <ChevronDown className={`h-4 w-4 text-ink/35 transition-transform ${open ? "rotate-180" : ""}`} />
                </button>
                {open && (
                  <div className="space-y-2 border-t border-ink/6 bg-ivory/40 px-4 py-3 text-xs">
                    {(o.items ?? []).map((item) => (
                      <p key={item.id} className="flex justify-between text-ink/75">
                        <span>
                          {item.quantity} × {item.product?.name ?? "Item"}
                        </span>
                        <span>{rwf(item.totalPrice)}</span>
                      </p>
                    ))}
                    <div className="border-t border-ink/8 pt-2">
                      {payments.length === 0 ? (
                        <p className="text-ink/55">{o.status === "PENDING" ? "Not paid yet." : o.status === "CANCELLED" ? "Cancelled before payment." : "No payment details recorded."}</p>
                      ) : (
                        payments.map((p, i) => (
                          <p key={p.id ?? i} className="flex justify-between text-ink/75">
                            <span>
                              {PAYMENT_LABELS[String(p.method).toUpperCase()] ?? p.method}
                              {String(p.method).toUpperCase() === "CREDIT"
                                ? ` · ${[p.creditOwnerName, p.creditOwnerPhone, p.takenBy && `taken by ${p.takenBy}`].filter(Boolean).join(" · ") || "No credit details"}`
                                : ""}
                            </span>
                            <span className="font-semibold">{rwf(p.amount)}</span>
                          </p>
                        ))
                      )}
                    </div>
                    <Link href={`/owner/orders/${o.id}`} className="inline-flex items-center gap-1 font-bold text-ink hover:underline">
                      Open full order <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function WorkerCheck({
  day,
  date,
  check,
  checkerName,
  onChanged,
}: {
  day: WorkerDay;
  date: string;
  check?: Check;
  checkerName: string;
  onChanged: () => void;
}) {
  const [drafts, setDrafts] = useState<Partial<Record<Method, string>>>({});
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [details, setDetails] = useState(false);

  const methods = COUNTED.filter((m) => day.expected[m] !== 0 || drafts[m]);
  const countedOf = (m: Method) => (drafts[m] === undefined || drafts[m] === "" ? null : toNumber(drafts[m]));
  const expectedTotal = COUNTED.reduce((sum, m) => sum + day.expected[m], 0);
  const countedTotal = COUNTED.reduce((sum, m) => sum + (countedOf(m) ?? 0), 0);
  const allEntered = methods.every((m) => countedOf(m) !== null);
  const difference = countedTotal - expectedTotal;
  const waitingServices = day.servicePayments.filter((p) => p.receipt === "PENDING");

  const save = async (status: Status) => {
    if (status === "VERIFIED" && !allEntered) return toast.error('Enter what you received for each method, or tap "Same as recorded"');
    if (status === "FLAGGED" && !note.trim()) return toast.error('Add a note first, e.g. "5,000 RWF missing from cash"');
    setBusy(status);
    try {
      await ownerRequest("/money-checks", {
        method: "PUT",
        body: JSON.stringify({
          date,
          userId: day.user.id,
          status,
          counted: Object.fromEntries(methods.map((m) => [m, countedOf(m) ?? 0])),
          expected: day.expected,
          difference,
          note: note.trim() || undefined,
          decidedAt: new Date().toISOString(),
          decidedBy: checkerName,
        }),
      });
      // The count covered booking money too, so it is confirmed as received.
      if (status === "VERIFIED" && waitingServices.length) {
        await ownerRequest("/booking-payments/confirm", { method: "PATCH", body: JSON.stringify({ ids: waitingServices.map((p) => p.id) }) }).catch(
          (err: unknown) => toast.error(err instanceof Error ? err.message : "Booking money not confirmed"),
        );
      }
      toast.success(
        status === "FLAGGED"
          ? `${day.user.name}: flagged for follow-up`
          : difference === 0
            ? `${day.user.name}: ${rwf(countedTotal)} received`
            : `${day.user.name}: verified, ${difference < 0 ? "short" : "over"} by ${rwf(Math.abs(difference))}`,
      );
      onChanged();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Check not saved");
    } finally {
      setBusy(null);
    }
  };

  const reopen = async () => {
    setBusy("reopen");
    try {
      await ownerRequest(`/money-checks/${date}/${day.user.id}`, { method: "DELETE" });
      // A shortage charged for this count is no longer known to be missing.
      if (check && toNumber(check.difference) < 0)
        await ownerRequest(`/staff-debts/by-source?source=${encodeURIComponent(shortageSource(date, day.user.id))}`, { method: "DELETE" }).catch(() => {});
      setDrafts({});
      setNote("");
      toast.success("Opened again: enter the amounts");
      onChanged();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not reopen");
    } finally {
      setBusy(null);
    }
  };

  const chargeShortage = async () => {
    if (!check) return;
    setBusy("charge");
    try {
      await ownerRequest("/staff-debts", {
        method: "POST",
        body: JSON.stringify({
          userId: day.user.id,
          kind: "SHORTAGE",
          amount: Math.abs(toNumber(check.difference)),
          date,
          note: check.note || `Money missing in the count of ${formatDate(date)}`,
          source: shortageSource(date, day.user.id),
        }),
      });
      toast.success(`${rwf(Math.abs(toNumber(check.difference)))} charged to ${day.user.name}; it comes off the salary`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not charge";
      if (/already charged/i.test(message)) toast("Already charged to the worker", { icon: "✓" });
      else toast.error(message);
    } finally {
      setBusy(null);
    }
  };

  const accent = check?.status === "FLAGGED" ? "bg-rose-500" : check ? "bg-ink" : "bg-lime";

  return (
    <div className="overflow-hidden rounded-2xl border border-ink/10 bg-white">
      <div className={`h-1 ${accent}`} />
      <div className="flex flex-wrap items-center gap-3 px-5 py-4">
        <Avatar name={day.user.name} size={42} />
        <div className="min-w-0 flex-1">
          <p className="font-bold text-ink">{day.user.name}</p>
          <p className="text-xs text-ink/55">
            {day.completed.length} paid · {rwf(day.sales)}
            {day.pending.length ? ` · ${day.pending.length} pending` : ""}
            {day.servicePayments.length ? ` · Services ${rwf(day.services)}` : ""}
          </p>
        </div>
        {check?.status === "VERIFIED" && <Badge tone="ink">Verified</Badge>}
        {check?.status === "FLAGGED" && <Badge tone="danger">Flagged</Badge>}
        {!check && <Badge tone="lime">To check</Badge>}
        <div className="text-right">
          <p className="text-[11px] text-ink/45">Should hand in</p>
          <p className="text-lg font-extrabold text-ink">{rwf(expectedTotal)}</p>
        </div>
      </div>

      <div className="border-t border-ink/6 px-5 py-4">
        {check ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {COUNTED.filter((m) => check.counted[m] !== undefined || (check.expected[m] ?? 0) !== 0).map((m) => (
                <div key={m} className="rounded-xl bg-ivory px-3 py-2.5">
                  <p className="text-[11px] text-ink/50">{PAYMENT_LABELS[m]}</p>
                  <p className="text-sm font-bold text-ink">{rwf(check.counted[m] ?? 0)}</p>
                  <p className="text-[11px] text-ink/45">of {rwf(check.expected[m] ?? 0)}</p>
                </div>
              ))}
              <div className={`rounded-xl px-3 py-2.5 ${toNumber(check.difference) < 0 ? "bg-rose-50" : "bg-emerald-50"}`}>
                <p className="text-[11px] text-ink/50">Difference</p>
                <p className={`text-sm font-bold ${toNumber(check.difference) < 0 ? "text-rose-600" : "text-emerald-700"}`}>{signed(toNumber(check.difference))}</p>
              </div>
            </div>
            {check.note && <p className="rounded-xl bg-ivory px-3 py-2 text-sm italic text-ink/70">“{check.note}”</p>}
            <div className="flex flex-wrap items-center gap-2">
              <p className="flex-1 text-xs text-ink/50">
                By {check.decidedByName} · {formatDate(check.decidedAt, true)}
              </p>
              {toNumber(check.difference) < 0 && (
                <Button small tone="danger" icon={HandCoins} busy={busy === "charge"} onClick={chargeShortage}>
                  Charge {rwf(Math.abs(toNumber(check.difference)))} to salary
                </Button>
              )}
              <Button small tone="outline" icon={RotateCcw} busy={busy === "reopen"} onClick={reopen}>
                Check again
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {methods.length === 0 ? (
              <p className="text-sm text-ink/55">No money to count for this day.</p>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {methods.map((m) => {
                  const counted = countedOf(m);
                  const off = counted === null ? null : counted - day.expected[m];
                  return (
                    <div key={m}>
                      <div className="mb-1.5 flex items-baseline justify-between text-xs">
                        <span className="font-semibold text-ink">{PAYMENT_LABELS[m]}</span>
                        <span className="text-ink/50">recorded {rwf(day.expected[m])}</span>
                      </div>
                      <MoneyInput value={drafts[m] ?? ""} onChange={(v) => setDrafts((d) => ({ ...d, [m]: v }))} placeholder="Received" />
                      {off !== null && off !== 0 && (
                        <p className={`mt-1 text-[11px] font-semibold ${off < 0 ? "text-rose-600" : "text-ink"}`}>{signed(off)}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {allEntered && methods.length > 0 && difference !== 0 && (
              <p className="flex items-center gap-2 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">
                <CircleAlert className="h-4 w-4" />
                {difference < 0 ? "Short" : "Over"} by {rwf(Math.abs(difference))}. Verify anyway, or flag it with a note.
              </p>
            )}

            <TextArea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="Note (needed to flag), e.g. 5,000 RWF missing from cash" />

            <div className="flex flex-wrap gap-2">
              {methods.length > 0 && (
                <Button tone="outline" small onClick={() => setDrafts(Object.fromEntries(methods.map((m) => [m, String(day.expected[m])])))}>
                  Same as recorded
                </Button>
              )}
              <div className="flex-1" />
              <Button small tone="danger" icon={Flag} busy={busy === "FLAGGED"} onClick={() => save("FLAGGED")}>
                Flag
              </Button>
              <Button small icon={BadgeCheck} busy={busy === "VERIFIED"} onClick={() => save("VERIFIED")}>
                {difference !== 0 && allEntered && methods.length ? "Verify anyway" : "Verify"}
              </Button>
            </div>
          </div>
        )}
      </div>

      <Notices day={day} />

      <button type="button" onClick={() => setDetails((v) => !v)} className="flex w-full items-center justify-center gap-1.5 border-t border-ink/6 py-2.5 text-xs font-semibold text-ink/55 hover:bg-ivory/60 hover:text-ink">
        {details ? "Hide" : "See"} {day.user.name}&apos;s orders on this day
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${details ? "rotate-180" : ""}`} />
      </button>

      {details && (
        <div className="space-y-4 border-t border-ink/6 bg-ivory/40 px-5 py-4 text-sm">
          <WorkerOrders day={day} />
          {day.servicePayments.length > 0 && (
            <div>
              <p className="mb-1 text-xs font-bold text-ink/50">Booking money</p>
              {day.servicePayments.map((p) => (
                <p key={p.id} className="text-xs text-ink/70">
                  {p.booking.service.name} · {p.booking.customerName} · {PAYMENT_LABELS[p.method]} {p.isRefund ? "−" : ""}
                  {rwf(p.amount)}
                </p>
              ))}
            </div>
          )}
          {day.paidOut.length > 0 && (
            <div>
              <p className="mb-1 text-xs font-bold text-ink/50">Paid out of the till</p>
              {day.paidOut.map((e) => (
                <p key={e.id} className="text-xs text-ink/70">
                  {e.title} · −{rwf(e.amount)}
                  {e.status === "PENDING" ? " (waiting for approval)" : ""}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function OwnerMoneyChecks() {
  const user = useAuthStore((s) => s.user);
  const servicesOn = user?.company?.features?.services !== false;
  const [date, setDate] = useState(todayKey());
  const [filter, setFilter] = useState<"all" | "awaiting" | "verified" | "flagged">("all");

  const from = new Date(`${date}T00:00:00`);
  const to = new Date(`${date}T23:59:59.999`);
  const orders = useOwnerData<Order[]>(ordersSince(date));
  const checks = useOwnerData<Check[]>("/money-checks");
  const expenses = useOwnerData<TillExpense[]>("/expenses");
  const bookingMoney = useOwnerData<ServicePayment[]>(
    servicesOn ? `/booking-payments?${new URLSearchParams({ from: from.toISOString(), to: to.toISOString() })}` : null,
  );

  if (orders.error) return <ErrorState message={orders.error} onRetry={orders.reload} />;

  const days = buildWorkerDays(orders.data ?? [], date, bookingMoney.data ?? [], expenses.data ?? []);
  const checkOf = (userId: string) => (checks.data ?? []).find((c) => c.date === date && c.worker.id === userId);
  const checked = days.filter((d) => checkOf(d.user.id));
  const flagged = checked.filter((d) => checkOf(d.user.id)?.status === "FLAGGED");
  const verified = checked.length - flagged.length;
  const expected = days.reduce((sum, d) => sum + COUNTED.reduce((s, m) => s + d.expected[m], 0), 0);
  const sales = days.reduce((sum, d) => sum + d.sales, 0);
  const services = days.reduce((sum, d) => sum + d.services, 0);
  const credit = days.reduce((sum, d) => sum + d.expected.CREDIT, 0);
  const diff = checked.reduce((sum, d) => sum + toNumber(checkOf(d.user.id)?.difference), 0);
  const statusOf = (userId: string) => (checkOf(userId) ? (checkOf(userId)!.status === "FLAGGED" ? "flagged" : "verified") : "awaiting");
  const visible = days.filter((d) => filter === "all" || statusOf(d.user.id) === filter);
  const isToday = date === todayKey();
  const loading = orders.loading || checks.loading;

  const refresh = () => {
    checks.reload();
    bookingMoney.reload();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Finance"
        title="Verification"
        description="Compare the money each worker recorded in the app with the money you actually received."
        actions={
          <Button tone="outline" icon={RotateCcw} onClick={() => (orders.reload(), refresh(), expenses.reload())}>
            Refresh
          </Button>
        }
      />

      <ol className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {["Count the cash and check MoMo and card for each worker.", "Type the amounts under Received.", "Verify if it matches, or Flag it with a note."].map((text, i) => (
          <li key={text} className="flex items-start gap-3 rounded-2xl border border-ink/10 bg-white p-4 text-sm text-ink/75">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-lime text-xs font-bold text-ink">{i + 1}</span>
            {text}
          </li>
        ))}
      </ol>

      <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-ink/10 bg-white p-4">
        <div className="flex items-center gap-1 rounded-xl bg-ivory p-1">
          <Button small tone="quiet" icon={ChevronLeft} onClick={() => setDate((d) => shiftDay(d, -1))} aria-label="Previous day" />
          <TextInput type="date" value={date} max={todayKey()} onChange={(e) => e.target.value && setDate(e.target.value)} className="h-8 w-40 border-0 bg-transparent text-center font-semibold focus:ring-0" />
          <Button small tone="quiet" icon={ChevronRight} disabled={isToday} onClick={() => setDate((d) => shiftDay(d, 1))} aria-label="Next day" />
        </div>
        {!isToday && (
          <Button small tone="outline" onClick={() => setDate(todayKey())}>
            Go to today
          </Button>
        )}
        <div className="min-w-60 flex-1">
          <div className="flex justify-between text-xs">
            <span className="font-semibold text-ink">
              {checked.length} of {days.length} worker{days.length === 1 ? "" : "s"} checked
            </span>
            <span className="text-ink/55">{days.length ? Math.round((checked.length / days.length) * 100) : 0}%</span>
          </div>
          <div className="mt-1.5 flex h-2 overflow-hidden rounded-full bg-ivory">
            <div className="bg-ink" style={{ flex: verified }} />
            <div className="bg-rose-500" style={{ flex: flagged.length }} />
            <div style={{ flex: days.length - checked.length || (days.length ? 0 : 1) }} />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          <StatCard label="Total sales" value={rwf(sales)} icon={Receipt} hint={`${days.length} worker${days.length === 1 ? "" : "s"} sold on ${formatDate(date)}`} />
          {servicesOn && <StatCard label="Services" value={rwf(services)} icon={BedDouble} hint="Bookings, after refunds" />}
          <StatCard tone="dark" label="Should be received" value={rwf(expected)} icon={Wallet} hint="Cash, MoMo and card" />
          <StatCard
            label="Difference found"
            value={signed(diff)}
            icon={Scale}
            hint={checked.length ? (diff < 0 ? "Money missing" : diff > 0 ? "Extra money" : "Everything matches") : "Nothing checked yet"}
          />
          <StatCard label="Given on credit" value={rwf(credit)} icon={Clock} hint="Still to be paid by customers" />
        </div>
      )}

      <Tabs
        options={[
          { value: "all", label: "All workers", count: days.length },
          { value: "awaiting", label: "To check", count: days.length - checked.length },
          { value: "verified", label: "Verified", count: verified },
          { value: "flagged", label: "Flagged", count: flagged.length },
        ]}
        value={filter}
        onChange={setFilter}
      />

      {loading ? (
        <Skeleton className="h-72" />
      ) : visible.length === 0 ? (
        <Card>
          <EmptyState icon={Scale} title={days.length === 0 ? "No sales on this day" : "No workers in this filter"} text={days.length === 0 ? "Workers appear here once they make a sale." : "Choose another filter above."} />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {visible.map((d) => (
            <WorkerCheck key={`${date}-${d.user.id}-${checkOf(d.user.id)?.decidedAt ?? "open"}`} day={d} date={date} check={checkOf(d.user.id)} checkerName={user?.name ?? "Owner"} onChanged={refresh} />
          ))}
        </div>
      )}
    </div>
  );
}
