import { dayKey, toNumber } from "@/app/owner/components/ui";
import type { Order, Payment, Person } from "@/app/owner/types";

// What each worker should hand in for one day. Same rules as the SmartPOS app
// (components/finance/workerDays.ts), so both show the same numbers.

export type Method = "CASH" | "MOMO" | "CARD" | "CREDIT";

// Counted by hand. Credit is money still owed, so it is listed, not counted.
export const COUNTED: Method[] = ["CASH", "MOMO", "CARD"];

export interface ServicePayment {
  id: string;
  method: Exclude<Method, "CREDIT">;
  amount: string | number;
  isRefund: boolean;
  createdAt: string;
  takenBy: { id: string; name: string } | null;
  receipt: "PENDING" | "CONFIRMED" | "MISSING";
  booking: { code: string; customerName: string; service: { name: string } };
}

export interface TillExpense {
  id: string;
  title: string;
  amount: string | number;
  startDate: string;
  status: "APPROVED" | "PENDING" | "REJECTED";
  paidFrom: "TILL_CASH" | "TILL_MOMO" | "OWN_MONEY" | "OTHER" | null;
  recordedBy: { id: string; name: string } | null;
}

export interface WorkerDay {
  user: Person;
  orders: Order[];
  completed: Order[];
  pending: Order[];
  cancelled: Order[];
  expected: Record<Method, number>;
  credits: { order: Order; payment: Payment }[];
  // Paid, but with no payment details.
  unrecorded: Order[];
  sales: number;
  services: number;
  servicePayments: ServicePayment[];
  // Bills paid out of the till; already taken off `expected`.
  paidOut: TillExpense[];
}

const emptyMethods = (): Record<Method, number> => ({ CASH: 0, MOMO: 0, CARD: 0, CREDIT: 0 });

// When the money changed hands: the payment time, else when the order was completed.
export const paidAt = (o: Order) => o.payments?.[0]?.createdAt ?? o.updatedAt ?? o.createdAt;

const FROM_TILL = { TILL_CASH: "CASH", TILL_MOMO: "MOMO" } as const;

export function buildWorkerDays(orders: Order[], date: string, servicePayments: ServicePayment[] = [], expenses: TillExpense[] = []) {
  const byUser = new Map<string, WorkerDay>();
  const get = (user: Person) => {
    let day = byUser.get(user.id);
    if (!day) {
      day = {
        user,
        orders: [],
        completed: [],
        pending: [],
        cancelled: [],
        expected: emptyMethods(),
        credits: [],
        unrecorded: [],
        sales: 0,
        services: 0,
        servicePayments: [],
        paidOut: [],
      };
      byUser.set(user.id, day);
    }
    return day;
  };

  for (const order of orders) {
    if (!order.user) continue;
    if (order.status === "COMPLETED" && dayKey(new Date(paidAt(order))) === date) {
      // Money taken at a customer's door is the rider's to hand in.
      const day = get(order.collectedBy ?? order.user);
      day.orders.push(order);
      day.completed.push(order);
      day.sales += toNumber(order.total);
      const payments = order.payments ?? [];
      if (payments.length === 0) day.unrecorded.push(order);
      for (const payment of payments) {
        const method = String(payment.method).toUpperCase() as Method;
        if (!(method in day.expected)) continue;
        day.expected[method] += toNumber(payment.amount);
        if (method === "CREDIT") day.credits.push({ order, payment });
      }
    } else if (order.status !== "COMPLETED" && dayKey(new Date(order.createdAt)) === date) {
      const day = get(order.user);
      day.orders.push(order);
      if (order.status === "PENDING") day.pending.push(order);
      if (order.status === "CANCELLED") day.cancelled.push(order);
    }
  }

  for (const payment of servicePayments) {
    if (!payment.takenBy) continue;
    const day = get({ id: payment.takenBy.id, name: payment.takenBy.name });
    const amount = (payment.isRefund ? -1 : 1) * toNumber(payment.amount);
    day.services += amount;
    day.expected[payment.method] += amount;
    day.servicePayments.push(payment);
  }

  // Till expenses still waiting count too: the money left the drawer either way.
  for (const expense of expenses) {
    const method = expense.paidFrom === "TILL_CASH" || expense.paidFrom === "TILL_MOMO" ? FROM_TILL[expense.paidFrom] : null;
    if (!method || !expense.recordedBy || expense.status === "REJECTED" || expense.startDate !== date) continue;
    const day = get({ id: expense.recordedBy.id, name: expense.recordedBy.name });
    day.expected[method] -= toNumber(expense.amount);
    day.paidOut.push(expense);
  }

  for (const day of byUser.values()) day.orders.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return [...byUser.values()].sort((a, b) => b.sales + b.services - (a.sales + a.services));
}
