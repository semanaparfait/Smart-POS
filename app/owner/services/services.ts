// What a company can offer as a service, how each is priced, and the price rules.
// The same as the SmartPOS app (config/services.ts), which matches the server's
// pricing, so the price shown while booking is the price charged.
import { toNumber } from "@/app/owner/components/ui";

export type ServiceKind = "ROOM" | "SPACE" | "ACTIVITY" | "TICKET" | "RENTAL" | "OTHER";
export type PriceUnit = "HOUR" | "NIGHT" | "DAY" | "SESSION" | "PERSON" | "FIXED";
export type UnitStatus = "AVAILABLE" | "OCCUPIED" | "CLEANING" | "MAINTENANCE";
export type BookingStatus = "RESERVED" | "ACTIVE" | "COMPLETED" | "CANCELLED";
// BOOK = reserve ahead, START = here now, SELL = ticket paid and done at once.
export type BookingMode = "BOOK" | "START" | "SELL";
export type Method = "CASH" | "MOMO" | "CARD";

export const SERVICES = "/owner/services";
export const BOOKINGS = "/owner/bookings";

export interface ServiceUnit {
  id: string;
  name: string;
  status: UnitStatus;
}

export interface Service {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  kind: ServiceKind;
  priceUnit: PriceUnit;
  price: number | string;
  capacity: number | null;
  deposit: number | string;
  active: boolean;
  units: ServiceUnit[];
}

type Person = { id: string; name: string } | null;

export interface BookingPayment {
  id: string;
  method: Method;
  amount: number | string;
  isRefund: boolean;
  reason: string | null;
  createdAt: string;
  takenBy: Person;
  receipt: "PENDING" | "CONFIRMED" | "MISSING";
  receiptNote: string | null;
  receiptCheckedBy: Person;
}

export interface Booking {
  id: string;
  code: string;
  service: { id: string; name: string; kind: ServiceKind; imageUrl: string | null; priceUnit: PriceUnit };
  unit: { id: string; name: string } | null;
  customerName: string;
  customerPhone: string | null;
  people: number;
  startAt: string;
  endAt: string | null;
  checkedInAt: string | null;
  checkedOutAt: string | null;
  status: BookingStatus;
  priceUnit: PriceUnit;
  unitPrice: number | string;
  quantity: number | string;
  discount: number | string;
  total: number | string;
  note: string | null;
  cancelReason: string | null;
  takenBy: Person;
  payments: BookingPayment[];
  paid: number;
  refunded: number;
  balance: number;
  createdAt: string;
}

export interface Takings {
  total: number;
  refunded: number;
}

export const SERVICE_KINDS: { value: ServiceKind; label: string; hint: string; priceUnit: PriceUnit; unitWord: string; unitExample: string }[] = [
  { value: "ROOM", label: "Rooms", hint: "Hotel and guest rooms", priceUnit: "NIGHT", unitWord: "Room", unitExample: "Room 101" },
  { value: "SPACE", label: "Halls & spaces", hint: "Conference halls, meeting rooms, VIP areas, gardens", priceUnit: "HOUR", unitWord: "Space", unitExample: "Main hall" },
  { value: "ACTIVITY", label: "Activities", hint: "Pool table, gym, karaoke, car wash, salon chair", priceUnit: "HOUR", unitWord: "Station", unitExample: "Table 1" },
  { value: "TICKET", label: "Tickets & entry", hint: "Swimming pool entry, event tickets, entrance fees", priceUnit: "PERSON", unitWord: "Gate", unitExample: "Gate A" },
  { value: "RENTAL", label: "Rentals", hint: "Bikes, cars, tents, sound system, equipment", priceUnit: "DAY", unitWord: "Item", unitExample: "Bike 1" },
  { value: "OTHER", label: "Other", hint: "Laundry, massage, tours, anything else", priceUnit: "SESSION", unitWord: "Unit", unitExample: "Chair 1" },
];

export const PRICE_UNITS: { value: PriceUnit; label: string; per: string; one: string; many: string }[] = [
  { value: "HOUR", label: "Per hour", per: "per hour", one: "hour", many: "hours" },
  { value: "NIGHT", label: "Per night", per: "per night", one: "night", many: "nights" },
  { value: "DAY", label: "Per day", per: "per day", one: "day", many: "days" },
  { value: "SESSION", label: "Per session", per: "per session", one: "session", many: "sessions" },
  { value: "PERSON", label: "Per person", per: "per person", one: "person", many: "people" },
  { value: "FIXED", label: "Fixed price", per: "each", one: "time", many: "times" },
];

export const kindMeta = (kind: ServiceKind) => SERVICE_KINDS.find((k) => k.value === kind) ?? SERVICE_KINDS[SERVICE_KINDS.length - 1];
export const priceMeta = (unit: PriceUnit) => PRICE_UNITS.find((p) => p.value === unit) ?? PRICE_UNITS[PRICE_UNITS.length - 1];
// Priced by how long it is used.
export const isTimed = (unit: PriceUnit) => unit === "HOUR" || unit === "NIGHT" || unit === "DAY";

export const UNIT_STATUS: Record<UnitStatus, { label: string; cls: string }> = {
  AVAILABLE: { label: "Free", cls: "bg-emerald-50 text-emerald-700" },
  OCCUPIED: { label: "In use", cls: "bg-lime text-ink" },
  CLEANING: { label: "Cleaning", cls: "bg-ivory text-ink/60" },
  MAINTENANCE: { label: "Maintenance", cls: "bg-rose-50 text-rose-700" },
};

export const BOOKING_STATUS: Record<BookingStatus, { label: string; cls: string }> = {
  RESERVED: { label: "Reserved", cls: "bg-ink/8 text-ink" },
  ACTIVE: { label: "In use", cls: "bg-lime text-ink" },
  COMPLETED: { label: "Done", cls: "bg-emerald-50 text-emerald-700" },
  CANCELLED: { label: "Cancelled", cls: "bg-ivory text-ink/55" },
};

export const METHODS: { value: Method; label: string }[] = [
  { value: "CASH", label: "Cash" },
  { value: "MOMO", label: "MoMo" },
  { value: "CARD", label: "Card" },
];

const HOUR_MS = 3_600_000;
const DAY_MS = 24 * HOUR_MS;
// A booking ahead with no end holds its unit for an hour (as on the server).
export const DEFAULT_HOLD_MS = HOUR_MS;

// Hours by the started quarter hour; nights rounded to the nearest; days by the
// started 24 hours with an hour of grace. Never less than one.
export function measuredQuantity(unit: PriceUnit, from: Date, to: Date) {
  const span = Math.max(0, to.getTime() - from.getTime());
  if (unit === "HOUR") return Math.max(1, Math.ceil(span / (HOUR_MS / 4))) / 4;
  if (unit === "NIGHT") return Math.max(1, Math.round(span / DAY_MS));
  if (unit === "DAY") return Math.max(1, Math.ceil((span - HOUR_MS) / DAY_MS));
  return 1;
}

// What a new booking is charged for before checkout (0 = by time used).
export function bookedQuantity(unit: PriceUnit, start: Date, end: Date | null, people: number, sessions = 1) {
  if (isTimed(unit)) return end ? measuredQuantity(unit, start, end) : 0;
  if (unit === "PERSON") return people;
  if (unit === "SESSION") return sessions;
  return 1;
}

// What a booking in use would cost if they checked out now.
export function runningTotal(booking: Booking, now = new Date()) {
  const booked = toNumber(booking.quantity);
  const quantity =
    booking.status === "ACTIVE" && isTimed(booking.priceUnit)
      ? Math.max(booked, measuredQuantity(booking.priceUnit, new Date(booking.checkedInAt ?? booking.startAt), now))
      : booked;
  const total = Math.round(quantity * toNumber(booking.unitPrice) * 100) / 100;
  return { quantity, total: booking.status === "ACTIVE" ? total : toNumber(booking.total) };
}

// "1:05" for a running timer, "2 d 3 h" when long.
export function elapsed(from: string | Date, now = new Date()) {
  const minutes = Math.max(0, Math.floor((now.getTime() - new Date(from).getTime()) / 60_000));
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  if (days) return `${days} d ${hours} h`;
  return `${hours}:${String(minutes % 60).padStart(2, "0")}`;
}

const pad = (n: number) => String(n).padStart(2, "0");
export const timeOf = (value: string | Date) => {
  const d = new Date(value);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
export const dateKey = (value: string | Date) => {
  const d = new Date(value);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
export const sameDay = (a: string | Date, b: string | Date) => dateKey(a) === dateKey(b);
export const when = (value: string) => (dateKey(value) === dateKey(new Date()) ? `Today ${timeOf(value)}` : `${dateKey(value)} ${timeOf(value)}`);

export const dayRange = (day: string) => {
  const from = new Date(`${day}T00:00:00`);
  const to = new Date(from);
  to.setDate(to.getDate() + 1);
  return { from, to };
};
