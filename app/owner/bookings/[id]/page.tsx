"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import { ArrowLeft, BedDouble, Banknote, LogIn, LogOut, Undo2, XCircle } from "lucide-react";
import { ownerRequest, useOwnerData } from "@/stores/owner/api";
import { Card, ErrorState, Skeleton, rwf, toNumber } from "@/app/owner/components/ui";
import { Button, Choices, Field, MoneyInput, TextArea } from "@/app/owner/components/forms";
import { BOOKINGS, BOOKING_STATUS, METHODS, elapsed, isTimed, priceMeta, runningTotal, when, type Booking, type Method } from "@/app/owner/services/services";
import { useNow } from "@/app/owner/bookings/useNow";
import { PAYMENT_LABELS } from "@/app/owner/sales";

const MIN_REASON = 3;
const CANCEL_REASONS = ["Customer did not come", "Customer changed plans", "Booked by mistake", "Problem with the room or item"];
const REFUND_REASONS = ["Cancelled booking", "Service not as promised", "Left early", "Charged by mistake"];

function Row({ label, value, strong, danger }: { label: string; value: string; strong?: boolean; danger?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <span className={`text-sm ${strong ? "font-bold text-ink" : "text-ink/60"}`}>{label}</span>
      <span className={`text-sm ${strong ? "font-extrabold" : "font-semibold"} ${danger ? "text-rose-600" : "text-ink"}`}>{value}</span>
    </div>
  );
}

// A required reason: quick picks plus free text.
function ReasonField({ value, onChange, picks }: { value: string; onChange: (v: string) => void; picks: string[] }) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {picks.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            aria-pressed={value === p}
            className={`h-8 rounded-lg px-3 text-xs font-semibold transition-colors ${value === p ? "bg-ink text-white" : "bg-white text-ink ring-1 ring-inset ring-ink/12 hover:bg-ivory"}`}
          >
            {p}
          </button>
        ))}
      </div>
      <TextArea value={value} maxLength={255} rows={2} onChange={(e) => onChange(e.target.value)} placeholder="Write the reason" />
    </div>
  );
}

function BookingView({ booking, onSaved }: { booking: Booking; onSaved: (b: Booking) => void }) {
  const now = useNow(booking.status === "ACTIVE");
  const [method, setMethod] = useState<Method | "">("");
  const [amount, setAmount] = useState("");
  const [discount, setDiscount] = useState("");
  // The cancel or refund form, open instead of the normal actions.
  const [panel, setPanel] = useState<"cancel" | "refund" | null>(null);
  const [reason, setReason] = useState("");
  const [refundMethod, setRefundMethod] = useState<Method>("CASH");
  const [refundAmount, setRefundAmount] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const price = priceMeta(booking.priceUnit);
  const live = runningTotal(booking, now);
  const due = Math.max(0, live.total - Number(discount || 0));
  const owed = Math.round((due - booking.paid) * 100) / 100;
  const open = booking.status === "RESERVED" || booking.status === "ACTIVE";
  const canPay = booking.status !== "CANCELLED" && (booking.status === "ACTIVE" || booking.balance > 0 || booking.status === "RESERVED");
  const refundable = booking.paid > 0;

  // Fills the amount with what is still owed when a method is chosen.
  const pickMethod = (value: Method | "") => {
    setMethod(value);
    if (value && !amount && owed > 0) setAmount(String(owed));
  };
  const openPanel = (which: "cancel" | "refund") => {
    setPanel(which);
    setReason("");
    if (which === "refund") {
      // The method it was paid with, and everything paid, to start from.
      const last = [...booking.payments].reverse().find((p) => !p.isRefund);
      setRefundMethod(last?.method ?? "CASH");
      setRefundAmount(String(booking.paid));
    }
  };
  const run = async (key: string, path: string, init: RequestInit, done: string) => {
    setBusy(key);
    try {
      const updated = await ownerRequest<Booking>(path, init);
      toast.success(`${done}: ${updated.customerName} · ${updated.code}`);
      setMethod("");
      setAmount("");
      setPanel(null);
      setReason("");
      onSaved(updated);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update the booking");
    } finally {
      setBusy(null);
    }
  };
  const payment = method && Number(amount) > 0 ? { method, amount: Number(amount) } : undefined;
  const json = (method: string, body: unknown): RequestInit => ({ method, body: JSON.stringify(body) });

  const cancel = () => {
    if (reason.trim().length < MIN_REASON) return toast.error("Say why it is cancelled");
    run("cancel", `/bookings/${booking.id}/cancel`, json("PATCH", { reason: reason.trim() }), "Booking cancelled");
  };
  const refund = () => {
    const value = Number(refundAmount);
    if (!(value > 0)) return toast.error("Enter how much to give back");
    if (value > booking.paid) return toast.error(`Only ${rwf(booking.paid)} was paid`);
    if (reason.trim().length < MIN_REASON) return toast.error("Say why the money is given back");
    run("refund", `/bookings/${booking.id}/refunds`, json("POST", { method: refundMethod, amount: value, reason: reason.trim() }), "Refund recorded");
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href={BOOKINGS} className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink/55 hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Bookings
      </Link>
      <div className="flex items-center gap-4">
        <span className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl bg-ivory ring-1 ring-ink/10">
          {booking.service.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- the API's storage
            <img loading="lazy" decoding="async" src={booking.service.imageUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <BedDouble className="h-5 w-5 text-ink/40" />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-ink/45">Booking {booking.code}</p>
          <h1 className="truncate text-2xl font-extrabold tracking-[-0.02em] text-ink">
            {booking.service.name}
            {booking.unit ? ` · ${booking.unit.name}` : ""}
          </h1>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${BOOKING_STATUS[booking.status].cls}`}>{BOOKING_STATUS[booking.status].label}</span>
      </div>

      <Card>
        <div className="p-5">
          <Row label="Customer" value={booking.customerName} strong />
          {booking.customerPhone && <Row label="Phone" value={booking.customerPhone} />}
          <Row label="People" value={String(booking.people)} />
          <Row label={booking.status === "RESERVED" ? "Expected" : "Started"} value={when(booking.checkedInAt ?? booking.startAt)} />
          {booking.endAt && open && <Row label="Until" value={when(booking.endAt)} />}
          {booking.checkedOutAt && <Row label="Finished" value={when(booking.checkedOutAt)} />}
          {booking.status === "ACTIVE" && booking.checkedInAt && <Row label="Time so far" value={elapsed(booking.checkedInAt, now)} strong />}
          {booking.takenBy && <Row label="Booked by" value={booking.takenBy.name} />}
          {booking.note && <p className="mt-2 rounded-xl bg-ivory px-3 py-2 text-sm text-ink/70">{booking.note}</p>}
          {booking.cancelReason && (
            <p className="mt-2 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">
              <span className="font-semibold">Why it was cancelled:</span> {booking.cancelReason}
            </p>
          )}
        </div>
      </Card>

      <Card title="Money">
        <div className="p-5">
          {live.quantity > 0 ? (
            <Row label={`${live.quantity} ${live.quantity === 1 ? price.one : price.many} × ${rwf(booking.unitPrice)}`} value={rwf(live.quantity * toNumber(booking.unitPrice))} />
          ) : (
            <Row label="Price" value={`${rwf(booking.unitPrice)} ${price.per}`} />
          )}
          {toNumber(booking.discount) > 0 && <Row label="Discount" value={`− ${rwf(booking.discount)}`} />}
          {booking.status === "ACTIVE" && Number(discount) > 0 && <Row label="Discount" value={`− ${rwf(discount)}`} />}
          {booking.status !== "CANCELLED" && <Row label={booking.status === "ACTIVE" ? "Total if they leave now" : "Total"} value={rwf(due)} strong />}
          <Row label="Paid" value={rwf(booking.paid)} />
          {booking.refunded > 0 && <Row label="Refunded" value={rwf(booking.refunded)} />}
          {booking.status !== "CANCELLED" && <Row label={owed < 0 ? "Give back" : "Still owed"} value={rwf(Math.abs(owed))} strong danger={owed > 0} />}
          {booking.status === "CANCELLED" && booking.paid > 0 && <Row label="Kept, not refunded" value={rwf(booking.paid)} strong />}
          {booking.status === "ACTIVE" && isTimed(booking.priceUnit) && <p className="mt-2 text-xs text-ink/50">The total grows with the time used until they check out.</p>}
        </div>
        {booking.payments.length > 0 && (
          <ul className="divide-y divide-ink/6 border-t border-ink/6">
            {booking.payments.map((p) => (
              <li key={p.id} className="px-5 py-3">
                <div className="flex justify-between text-sm">
                  <span className={p.isRefund ? "text-rose-600" : "text-ink"}>
                    {p.isRefund ? "Refund · " : ""}
                    {PAYMENT_LABELS[p.method] ?? p.method} · <span className="text-ink/55">{when(p.createdAt)}</span>
                    {p.takenBy ? <span className="text-ink/55"> · {p.takenBy.name}</span> : null}
                  </span>
                  <span className={`font-bold ${p.isRefund ? "text-rose-600" : "text-ink"}`}>
                    {p.isRefund ? "− " : ""}
                    {rwf(p.amount)}
                  </span>
                </div>
                {p.isRefund && p.reason && <p className="text-xs text-ink/55">{p.reason}</p>}
                {p.receipt !== "PENDING" && (
                  <p className={`text-xs ${p.receipt === "MISSING" ? "text-rose-600" : "text-emerald-700"}`}>
                    {p.receipt === "CONFIRMED" ? "Received, confirmed by" : "Not received, reported by"} {p.receiptCheckedBy?.name ?? "—"}
                    {p.receipt === "MISSING" && p.receiptNote ? `: ${p.receiptNote}` : ""}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>

      {panel ? (
        <Card title={panel === "cancel" ? "Cancel the booking" : `Refund, up to ${rwf(booking.paid)}`}>
          <div className="space-y-4 p-5">
            {panel === "cancel" ? (
              <p className="text-sm text-ink/65">
                {booking.status === "ACTIVE" ? "It stops now and the place is freed. Money paid stays recorded until you refund it." : "Money paid stays recorded until you refund it."}
              </p>
            ) : (
              <>
                <Choices value={refundMethod} onChange={setRefundMethod} options={METHODS} />
                <MoneyInput value={refundAmount} onChange={setRefundAmount} placeholder="Amount" />
              </>
            )}
            <Field label="Why (required)">
              <ReasonField value={reason} onChange={setReason} picks={panel === "cancel" ? CANCEL_REASONS : REFUND_REASONS} />
            </Field>
            <div className="flex justify-end gap-2">
              <Button tone="outline" icon={ArrowLeft} onClick={() => setPanel(null)}>
                Back
              </Button>
              {panel === "cancel" ? (
                <Button tone="danger" icon={XCircle} busy={busy === "cancel"} onClick={cancel}>
                  Cancel booking
                </Button>
              ) : (
                <Button tone="danger" icon={Undo2} busy={busy === "refund"} onClick={refund}>
                  Refund {Number(refundAmount) > 0 ? rwf(refundAmount) : ""}
                </Button>
              )}
            </div>
          </div>
        </Card>
      ) : (
        <Card>
          <div className="space-y-4 p-5">
            {booking.status === "ACTIVE" && (
              <Field label="Discount (optional)">
                <MoneyInput value={discount} onChange={setDiscount} />
              </Field>
            )}
            {canPay && (
              <Field label={booking.status === "ACTIVE" ? "Payment at checkout" : "Take a payment"}>
                <Choices value={method} onChange={pickMethod} options={[...(booking.status === "ACTIVE" ? [{ value: "" as const, label: "No payment now" }] : []), ...METHODS]} />
                {method && (
                  <div className="mt-2">
                    <MoneyInput value={amount} onChange={setAmount} placeholder="Amount" />
                  </div>
                )}
              </Field>
            )}
            <div className="flex flex-wrap justify-end gap-2">
              {open && (
                <Button tone="outline" icon={XCircle} onClick={() => openPanel("cancel")}>
                  Cancel booking
                </Button>
              )}
              {refundable && (
                <Button tone="outline" icon={Undo2} onClick={() => openPanel("refund")}>
                  Refund
                </Button>
              )}
              {booking.status === "RESERVED" && (
                <>
                  {payment && (
                    <Button tone="outline" icon={Banknote} busy={busy === "pay"} onClick={() => run("pay", `/bookings/${booking.id}/payments`, json("POST", payment), "Payment taken")}>
                      Take payment
                    </Button>
                  )}
                  <Button icon={LogIn} busy={busy === "in"} onClick={() => run("in", `/bookings/${booking.id}/check-in`, { method: "PATCH" }, "Checked in")}>
                    Check in
                  </Button>
                </>
              )}
              {booking.status === "ACTIVE" && (
                <Button
                  icon={LogOut}
                  busy={busy === "out"}
                  onClick={() =>
                    run(
                      "out",
                      `/bookings/${booking.id}/check-out`,
                      json("PATCH", { ...(Number(discount) > 0 ? { discount: Number(discount) } : {}), ...(payment ? { payment } : {}) }),
                      "Checked out",
                    )
                  }
                >
                  {payment ? `Check out and take ${rwf(payment.amount)}` : "Check out"}
                </Button>
              )}
              {booking.status === "COMPLETED" && booking.balance > 0 && (
                <Button
                  icon={Banknote}
                  busy={busy === "pay"}
                  onClick={() => (payment ? run("pay", `/bookings/${booking.id}/payments`, json("POST", payment), "Payment taken") : toast.error("Choose how they pay"))}
                >
                  Take payment
                </Button>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

export default function BookingPage() {
  const { id } = useParams<{ id: string }>();
  const { data, loading, error, reload } = useOwnerData<Booking>(`/bookings/${id}`);
  const [saved, setSaved] = useState<Booking | null>(null);
  const booking = saved?.id === id ? saved : data;
  if (error && !booking) return <ErrorState message={error} onRetry={reload} />;
  if (!booking) return <div className="mx-auto max-w-3xl">{loading && <Skeleton className="h-96" />}</div>;
  return <BookingView booking={booking} onSaved={setSaved} />;
}
