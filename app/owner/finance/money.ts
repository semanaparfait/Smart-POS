// The money rules of the Finance pages, the same as the SmartPOS app's
// (config/expenses.ts): repeating costs are spread over the days they cover, so a
// single day's profit carries its share of the month's rent and salaries.
import { dayKey, toNumber } from "@/app/owner/components/ui";
import type { Order } from "@/app/owner/types";
import type { ExpenseCategory, ExpensePaidFrom, ExpenseRepeat, ExpenseStatus } from "@/app/owner/finance/labels";
import { paidAt } from "@/app/owner/finance/workerDays";

export interface Expense {
  id: string;
  title: string;
  category: ExpenseCategory;
  amount: number | string;
  repeat: ExpenseRepeat;
  startDate: string;
  endDate: string | null;
  note: string | null;
  status: ExpenseStatus;
  paidFrom: ExpensePaidFrom | null;
  repaidAt: string | null;
  repaidWith?: "CASH" | "MOMO" | "BANK" | null;
  repaidBy?: { id: string; name: string } | null;
  recordedBy: { id: string; name: string } | null;
  createdAt?: string;
  proofUrl?: string | null;
  reviewNote?: string | null;
  reviewedBy?: { id: string; name: string } | null;
}

// A booking payment, as listed for checking.
export interface CheckedPayment {
  id: string;
  method: "CASH" | "MOMO" | "CARD";
  amount: number | string;
  isRefund: boolean;
  reason: string | null;
  createdAt: string;
  takenBy: { id: string; name: string } | null;
  receipt: "PENDING" | "CONFIRMED" | "MISSING";
  receiptNote: string | null;
  receiptCheckedAt: string | null;
  receiptCheckedBy: { id: string; name: string } | null;
  booking: { id: string; code: string; customerName: string; status: string; service: { id: string; name: string; kind: string }; unit: { id: string; name: string } | null };
}

// Money in is positive, refunds count against it.
export const signedPayment = (p: Pick<CheckedPayment, "isRefund" | "amount">) => (p.isRefund ? -1 : 1) * toNumber(p.amount);

// Approved, paid with a worker's own money, and not paid back yet.
export const owedBack = (e: Expense) => e.status === "APPROVED" && e.paidFrom === "OWN_MONEY" && !e.repaidAt;

// Counts against the profit: recorded by a manager, or approved.
const counts = (e: Expense) => !e.status || e.status === "APPROVED";

const daysInMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
const daysInYear = (d: Date) => (new Date(d.getFullYear(), 1, 29).getMonth() === 1 ? 366 : 365);

// How much of the expense falls on this day.
export function shareOn(e: Expense, day: Date) {
  const key = dayKey(day);
  if (key < e.startDate || (e.endDate && key > e.endDate)) return 0;
  const amount = toNumber(e.amount);
  switch (e.repeat) {
    case "ONCE":
      return key === e.startDate ? amount : 0;
    case "DAILY":
      return amount;
    case "WEEKLY":
      return amount / 7;
    case "MONTHLY":
      return amount / daysInMonth(day);
    case "YEARLY":
      return amount / daysInYear(day);
  }
  return 0;
}

// Costs of the days in [from, to): by category, salaries apart. Salaries can be a
// fixed monthly total, or worked out per month ("2026-11") from what was paid.
export function costsBetween(expenses: Expense[], monthlySalaries: number | ((month: string) => number), from: Date, to: Date) {
  const salaryOf = (day: Date) => (typeof monthlySalaries === "number" ? monthlySalaries : monthlySalaries(dayKey(day).slice(0, 7)));
  const byCategory = new Map<ExpenseCategory, number>();
  let salaries = 0;
  for (let day = new Date(from); day < to; day.setDate(day.getDate() + 1)) {
    salaries += salaryOf(day) / daysInMonth(day);
    for (const e of expenses) {
      if (!counts(e)) continue;
      const share = shareOn(e, day);
      if (share) byCategory.set(e.category, (byCategory.get(e.category) ?? 0) + share);
    }
  }
  const categories = [...byCategory.entries()].map(([category, amount]) => ({ category, amount })).sort((a, b) => b.amount - a.amount);
  return { categories, salaries, total: salaries + categories.reduce((sum, c) => sum + c.amount, 0) };
}

// What one month of a cost comes to, to compare repeating costs.
export const monthlyAmount = (e: Pick<Expense, "amount" | "repeat">) => {
  const amount = toNumber(e.amount);
  return { ONCE: 0, DAILY: amount * 30.44, WEEKLY: (amount * 52) / 12, MONTHLY: amount, YEARLY: amount / 12 }[e.repeat];
};

export const isRunning = (e: Pick<Expense, "repeat" | "startDate" | "endDate">, today = dayKey(new Date())) =>
  e.repeat !== "ONCE" && e.startDate <= today && (!e.endDate || e.endDate >= today);

// Charges money to a worker; it comes off their salary. `source` keeps it to once.
export const chargeBody = (userId: string, kind: string, amount: number, date: string, note: string, source: string) =>
  JSON.stringify({ userId, kind, amount, date, note, source });

// [from, to) covering whole local days, from the first day to the last one.
export const rangeOf = (first: string, last: string) => {
  const [a, b] = first <= last ? [first, last] : [last, first];
  const from = new Date(`${a}T00:00:00`);
  const to = new Date(`${b}T00:00:00`);
  to.setDate(to.getDate() + 1);
  return { from, to };
};

export const shiftDays = (d: Date, days: number) => {
  const next = new Date(d);
  next.setDate(d.getDate() + days);
  return next;
};

export const signedRwf = (value: number) => (value === 0 ? "0 RWF" : `${value > 0 ? "+" : "−"}${Math.round(Math.abs(value)).toLocaleString()} RWF`);

export { paidAt };

// One credit payment on a completed order.
export interface CreditEntry {
  id: string;
  order: Order;
  amount: number;
  takenAt: string;
  customerName: string;
  customerPhone: string;
  takenBy: string;
  servedBy: string;
}

export function creditsOf(orders: Order[]): CreditEntry[] {
  const out: CreditEntry[] = [];
  for (const o of orders) {
    if (o.status !== "COMPLETED") continue;
    (o.payments ?? []).forEach((p, i) => {
      if (String(p.method).toUpperCase() !== "CREDIT") return;
      out.push({
        id: p.id ?? `${o.id}-${i}`,
        order: o,
        amount: toNumber(p.amount),
        takenAt: p.createdAt ?? o.updatedAt ?? o.createdAt,
        customerName: p.creditOwnerName?.trim() || "Unknown customer",
        customerPhone: p.creditOwnerPhone?.trim() || "",
        takenBy: p.takenBy?.trim() || "",
        servedBy: o.user?.employee?.name ?? o.user?.name ?? "Unknown",
      });
    });
  }
  return out;
}

export const daysSince = (value: string) => Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 86_400_000));

// Saves rows as a spreadsheet file (CSV).
export function downloadCsv(fileName: string, rows: (string | number | null | undefined)[][]) {
  const csv = rows.map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(link.href);
}

// "#A1B2C3": the short number the till prints.
export const orderNumber = (o: Pick<Order, "id">) => `#${o.id.replace(/-/g, "").slice(-6).toUpperCase()}`;
