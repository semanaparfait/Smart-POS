"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { CalendarPlus, Minus, Play, Plus, Ticket } from "lucide-react";
import { ownerRequest, useOwnerData } from "@/stores/owner/api";
import { rwf, toNumber } from "@/app/owner/components/ui";
import { BackButton, Button, Choices, Field, FormPage, FormPageState, FormSection, MoneyInput, TextArea, TextInput, todayKey } from "@/app/owner/components/forms";
import { Tabs } from "@/app/owner/components/ui";
import {
  BOOKINGS,
  DEFAULT_HOLD_MS,
  METHODS,
  UNIT_STATUS,
  bookedQuantity,
  dateKey,
  dayRange,
  isTimed,
  kindMeta,
  priceMeta,
  timeOf,
  type Booking,
  type BookingMode,
  type Method,
  type Service,
} from "@/app/owner/services/services";

const HOUR_MS = 3_600_000;
// Rooms: arrive in the afternoon, leave the next late morning.
const CHECK_IN_TIME = "14:00";
const CHECK_OUT_HOURS_EARLY = 3;

const atTime = (day: string, time: string) => {
  if (!/^\d{1,2}:\d{2}$/.test(time)) return null;
  const d = new Date(`${day}T${time.padStart(5, "0")}:00`);
  return Number.isNaN(d.getTime()) ? null : d;
};

// More than ten minutes ago.
const isPast = (d: Date) => d.getTime() < Date.now() - 10 * 60_000;

// Unfinished bookings of this unit that overlap the chosen time.
function clashFor(bookings: Booking[], unitId: string, start: Date, end: Date | null, now: boolean) {
  const until = (b: { start: number; end: number | null; active: boolean }) => b.end ?? (b.active ? Infinity : b.start + DEFAULT_HOLD_MS);
  const mine = { start: start.getTime(), end: until({ start: start.getTime(), end: end?.getTime() ?? null, active: now }) };
  return bookings.find(
    (b) =>
      b.unit?.id === unitId &&
      (b.status === "RESERVED" || b.status === "ACTIVE") &&
      new Date(b.startAt).getTime() < mine.end &&
      until({ start: new Date(b.startAt).getTime(), end: b.endAt ? new Date(b.endAt).getTime() : null, active: b.status === "ACTIVE" }) > mine.start,
  );
}

function Stepper({ value, min = 1, max, onChange, suffix }: { value: number; min?: number; max?: number; onChange: (v: number) => void; suffix?: string }) {
  return (
    <div className="inline-flex items-center gap-1 rounded-xl bg-white p-1 ring-1 ring-inset ring-ink/12">
      <Button small tone="quiet" icon={Minus} aria-label="Less" disabled={value <= min} onClick={() => onChange(Math.max(min, value - 1))} />
      <span className="min-w-20 text-center text-sm font-bold text-ink">
        {value}
        {suffix ? ` ${suffix}` : ""}
      </span>
      <Button small tone="quiet" icon={Plus} aria-label="More" disabled={max !== undefined && value >= max} onClick={() => onChange(max !== undefined ? Math.min(max, value + 1) : value + 1)} />
    </div>
  );
}

// Book a service: start it now, reserve it ahead, or sell a ticket on the spot.
function NewBookingForm({ services, bookings, startService, startUnit }: { services: Service[]; bookings: Booking[]; startService: string; startUnit: string }) {
  const router = useRouter();
  const offered = useMemo(() => services.filter((s) => s.active), [services]);
  // Opened from a service or a unit: start with it and its usual settings.
  const first = offered.find((s) => s.id === startService) ?? (offered.length === 1 ? offered[0] : undefined);
  const [serviceId, setServiceId] = useState(first?.id ?? "");
  const [unitId, setUnitId] = useState(() => (first?.units.some((u) => u.id === startUnit) ? startUnit : first?.units.length === 1 ? first.units[0].id : ""));
  const [mode, setMode] = useState<BookingMode>(first?.kind === "TICKET" ? "SELL" : "START");
  const [customer, setCustomer] = useState("");
  const [phone, setPhone] = useState("");
  const [people, setPeople] = useState(1);
  const [sessions, setSessions] = useState(1);
  // Length in the service's own unit; 0 = open, charged by time used.
  const [length, setLength] = useState(first?.priceUnit === "HOUR" ? 0 : 1);
  const [day, setDay] = useState(todayKey());
  const [time, setTime] = useState(timeOf(new Date()));
  const [note, setNote] = useState("");
  const [method, setMethod] = useState<Method | "">("");
  const [amount, setAmount] = useState("");
  const [saving, setSaving] = useState(false);

  const service = offered.find((s) => s.id === serviceId);
  const unitPrice = toNumber(service?.price);
  const price = service ? priceMeta(service.priceUnit) : null;
  const timed = !!service && isTimed(service.priceUnit);
  const isTicket = service?.kind === "TICKET";

  // Sensible defaults for the chosen service.
  const pickService = (id: string) => {
    const s = offered.find((x) => x.id === id);
    setServiceId(id);
    if (!s) return;
    setMode(s.kind === "TICKET" ? "SELL" : "START");
    setLength(s.priceUnit === "HOUR" ? 0 : 1);
    if (!s.units.some((u) => u.id === unitId)) setUnitId(s.units.length === 1 ? s.units[0].id : "");
  };
  const pickMode = (m: BookingMode) => {
    setMode(m);
    if (m === "BOOK" && service?.priceUnit === "NIGHT") setTime(CHECK_IN_TIME);
    if (m !== "BOOK") {
      setDay(todayKey());
      setTime(timeOf(new Date()));
    }
  };

  const startAt = mode === "BOOK" ? atTime(day, time) : new Date();
  const endAt = (() => {
    if (!service || !startAt || !timed || length === 0) return null;
    if (service.priceUnit === "HOUR") return new Date(startAt.getTime() + length * HOUR_MS);
    if (service.priceUnit === "DAY") return new Date(startAt.getTime() + length * 24 * HOUR_MS);
    return new Date(startAt.getTime() + (length * 24 - CHECK_OUT_HOURS_EARLY) * HOUR_MS);
  })();
  const quantity = service && startAt ? bookedQuantity(service.priceUnit, startAt, endAt, people, sessions) : 0;
  const total = Math.round(quantity * unitPrice * 100) / 100;
  const openEnded = timed && length === 0;
  const clash = service && unitId && startAt ? clashFor(bookings, unitId, startAt, endAt, mode !== "BOOK") : undefined;
  const suggested = mode === "BOOK" ? toNumber(service?.deposit) : openEnded ? 0 : total;
  const pickMethod = (m: Method | "") => {
    setMethod(m);
    if (m && !amount && suggested > 0) setAmount(String(suggested));
  };

  const save = async () => {
    if (!service) return toast.error("Choose a service");
    if (service.units.length && !unitId) return toast.error("Choose which one");
    if (!startAt) return toast.error("Enter a time like 14:30");
    if (mode === "BOOK" && isPast(startAt)) return toast.error("That time has passed. Use Start now instead");
    if (clash) return toast.error(`Already booked at that time: ${clash.customerName} · ${clash.code}`);
    const paying = method && Number(amount) > 0 ? { method, amount: Number(amount) } : undefined;
    if (mode === "SELL" && !paying) return toast.error("Choose how they pay");
    setSaving(true);
    try {
      const booking = await ownerRequest<Booking>("/bookings", {
        method: "POST",
        body: JSON.stringify({
          serviceId: service.id,
          ...(unitId ? { unitId } : {}),
          mode,
          ...(customer.trim() ? { customerName: customer.trim() } : {}),
          ...(phone.trim() ? { customerPhone: phone.trim() } : {}),
          people,
          ...(service.priceUnit === "SESSION" ? { sessions } : {}),
          ...(mode === "BOOK" ? { startAt: startAt.toISOString() } : {}),
          ...(endAt ? { endAt: endAt.toISOString() } : {}),
          ...(note.trim() ? { note: note.trim() } : {}),
          ...(paying ? { payment: paying } : {}),
        }),
      });
      toast.success(`${mode === "BOOK" ? "Booked" : mode === "SELL" ? "Sold" : "Started"}: ${booking.service.name}${booking.unit ? ` · ${booking.unit.name}` : ""} · ${booking.code}`);
      router.push(BOOKINGS);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save the booking");
      setSaving(false);
    }
  };

  const modes: { value: BookingMode; label: string }[] = isTicket
    ? [
        { value: "SELL", label: "Sell now" },
        { value: "BOOK", label: "Book ahead" },
      ]
    : [{ value: "START", label: "Start now" }, { value: "BOOK", label: "Book ahead" }, ...(!timed ? [{ value: "SELL" as BookingMode, label: "Paid and done" }] : [])];

  return (
    <FormPage
      back={BOOKINGS}
      backLabel="Bookings"
      eyebrow="New booking"
      title={service ? `${service.name} · ${rwf(unitPrice)} ${price!.per}` : "Choose what they want"}
      actions={
        <>
          <BackButton href={BOOKINGS} />
          <Button icon={mode === "BOOK" ? CalendarPlus : mode === "SELL" ? Ticket : Play} busy={saving} onClick={save}>
            {mode === "BOOK" ? "Book" : mode === "SELL" ? "Sell" : "Start"}
          </Button>
        </>
      }
    >
      <FormSection title="Service">
        {offered.length === 0 ? (
          <p className="text-sm text-ink/55">No services yet. Add them under What you offer.</p>
        ) : (
          <Choices value={serviceId} onChange={pickService} options={offered.map((s) => ({ value: s.id, label: s.name }))} />
        )}
        {service && service.units.length > 0 && (
          <div>
            <p className="mb-1.5 text-xs font-semibold text-ink">{kindMeta(service.kind).unitWord}</p>
            <div className="flex flex-wrap gap-2">
              {service.units.map((u) => {
                const on = u.id === unitId;
                const blocked = mode !== "BOOK" && u.status !== "AVAILABLE";
                return (
                  <button
                    key={u.id}
                    type="button"
                    disabled={blocked}
                    onClick={() => setUnitId(u.id)}
                    aria-pressed={on}
                    className={`inline-flex h-10 items-center gap-2 rounded-xl px-3.5 text-sm font-semibold transition-colors disabled:opacity-40 ${
                      on ? "bg-ink text-white" : "bg-white text-ink ring-1 ring-inset ring-ink/12 hover:bg-ivory"
                    }`}
                  >
                    {u.name}
                    {u.status !== "AVAILABLE" && <span className={`rounded-full px-1.5 text-[10px] ${UNIT_STATUS[u.status].cls}`}>{UNIT_STATUS[u.status].label}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </FormSection>

      {service && (
        <>
          <FormSection title="When">
            <Tabs options={modes} value={mode} onChange={pickMode} />
            {mode === "BOOK" && (
              <div className="flex flex-wrap gap-4">
                <Field label={service.priceUnit === "NIGHT" ? "Arrival date" : "Date"}>
                  <TextInput type="date" min={todayKey()} value={day} onChange={(e) => setDay(e.target.value || todayKey())} className="w-44" />
                </Field>
                <Field label="Time">
                  <TextInput type="time" value={time} onChange={(e) => setTime(e.target.value)} className="w-32" />
                </Field>
              </div>
            )}
            {timed && (
              <Field label={`How many ${price!.many}`}>
                <div className="flex flex-wrap items-center gap-2">
                  <Stepper value={length} min={service.priceUnit === "HOUR" ? 0 : 1} onChange={setLength} suffix={length === 1 ? price!.one : price!.many} />
                  {service.priceUnit === "HOUR" && (
                    <Button small tone={length === 0 ? "primary" : "outline"} onClick={() => setLength(0)}>
                      Until they stop
                    </Button>
                  )}
                </div>
                <span className="mt-1 block text-xs text-ink/55">
                  {openEnded ? "Charged by the time used, at checkout." : endAt ? `Until ${dateKey(endAt) === dateKey(startAt ?? new Date()) ? timeOf(endAt) : `${dateKey(endAt)} ${timeOf(endAt)}`}` : ""}
                </span>
              </Field>
            )}
            <div className="flex flex-wrap gap-6">
              <Field label="People">
                <Stepper value={people} max={service.capacity ?? undefined} onChange={setPeople} />
              </Field>
              {service.priceUnit === "SESSION" && (
                <Field label="Sessions">
                  <Stepper value={sessions} onChange={setSessions} />
                </Field>
              )}
            </div>
            {!!service.capacity && <p className="text-xs text-ink/55">Up to {service.capacity} people at once.</p>}
          </FormSection>

          <FormSection title="Customer">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label={mode === "BOOK" ? "Name" : "Name (optional)"}>
                <TextInput value={customer} maxLength={120} onChange={(e) => setCustomer(e.target.value)} />
              </Field>
              <Field label="Phone (optional)">
                <TextInput type="tel" value={phone} maxLength={30} onChange={(e) => setPhone(e.target.value)} />
              </Field>
            </div>
            <Field label="Note (optional)">
              <TextArea value={note} maxLength={1000} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Late arrival, extra bed" />
            </Field>
          </FormSection>

          <FormSection title={mode === "SELL" ? "Payment" : "Payment now"}>
            <div className="rounded-xl bg-ivory px-4 py-3 text-sm">
              {openEnded ? (
                <p className="flex justify-between font-bold text-ink">
                  <span>Price</span>
                  <span>
                    {rwf(unitPrice)} {price!.per}
                  </span>
                </p>
              ) : (
                <p className="flex justify-between font-bold text-ink">
                  <span>
                    {quantity} {quantity === 1 ? price!.one : price!.many} × {rwf(unitPrice)}
                  </span>
                  <span>{rwf(total)}</span>
                </p>
              )}
              {mode === "BOOK" && toNumber(service.deposit) > 0 && (
                <p className="mt-1 flex justify-between text-ink/60">
                  <span>Usual deposit</span>
                  <span>{rwf(service.deposit)}</span>
                </p>
              )}
            </div>
            <Choices value={method} onChange={pickMethod} options={[...(mode !== "SELL" ? [{ value: "" as const, label: "Pay later" }] : []), ...METHODS]} />
            {method && (
              <Field label="Amount">
                <MoneyInput value={amount} onChange={setAmount} />
              </Field>
            )}
            {clash && (
              <p className="rounded-xl bg-rose-50 px-3.5 py-2.5 text-sm text-rose-700">
                Already booked at that time: {clash.customerName} · {timeOf(clash.startAt)} · {clash.code}
              </p>
            )}
          </FormSection>
        </>
      )}
    </FormPage>
  );
}

// Reading the address needs a loading boundary on a page with no id in its path.
export default function NewBookingPage() {
  return (
    <Suspense fallback={<FormPageState back={BOOKINGS} backLabel="Bookings" loading error={null} onRetry={() => {}} />}>
      <NewBookingLoader />
    </Suspense>
  );
}

function NewBookingLoader() {
  const params = useSearchParams();
  const services = useOwnerData<Service[]>("/services");
  const { from, to } = dayRange(todayKey());
  // Today's, plus all reserved and in use: what a new booking could clash with.
  const bookings = useOwnerData<Booking[]>(`/bookings?${new URLSearchParams({ from: from.toISOString(), to: to.toISOString() })}`);
  if (!services.data || !bookings.data)
    return <FormPageState back={BOOKINGS} backLabel="Bookings" loading={services.loading || bookings.loading} error={services.error ?? bookings.error} onRetry={() => (services.reload(), bookings.reload())} />;
  return <NewBookingForm services={services.data} bookings={bookings.data} startService={params.get("service") ?? ""} startUnit={params.get("unit") ?? ""} />;
}
