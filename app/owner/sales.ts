import { dayKey, personName, toNumber } from "@/app/owner/components/ui";
import type { Order } from "@/app/owner/types";

// Sales figures for the owner pages. A sale counts once it is paid (COMPLETED).

export const isPaid = (order: Order) => order.status === "COMPLETED";

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

export const sumOf = (orders: Order[]) => orders.reduce((sum, order) => sum + toNumber(order.total), 0);

export function salesSummary(orders: Order[], now = new Date()) {
  const paid = orders.filter(isPaid);
  const today = startOfDay(now);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  // Last month up to the same day, for a fair comparison.
  const lastMonthSameDay = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate() + 1);

  const between = (from: Date, to?: Date) =>
    paid.filter((order) => {
      const at = new Date(order.createdAt);
      return at >= from && (!to || at < to);
    });

  const todayOrders = between(today);
  const monthOrders = between(monthStart);

  return {
    today: sumOf(todayOrders),
    todayCount: todayOrders.length,
    yesterday: sumOf(between(yesterday, today)),
    month: sumOf(monthOrders),
    monthCount: monthOrders.length,
    lastMonthSoFar: sumOf(between(lastMonthStart, lastMonthSameDay)),
    averageSale: monthOrders.length ? sumOf(monthOrders) / monthOrders.length : 0,
    open: orders.filter((order) => !["COMPLETED", "CANCELLED"].includes(order.status)).length,
    monthOrders,
  };
}

// Paid sales per day for the last `days` days, oldest first.
export function dailySales(orders: Order[], days = 14, now = new Date()) {
  const totals = new Map<string, number>();
  for (const order of orders.filter(isPaid)) {
    const key = dayKey(new Date(order.createdAt));
    totals.set(key, (totals.get(key) ?? 0) + toNumber(order.total));
  }
  return Array.from({ length: days }, (_, i) => {
    const date = startOfDay(now);
    date.setDate(date.getDate() - (days - 1 - i));
    return { date, total: totals.get(dayKey(date)) ?? 0 };
  });
}

export function paymentMix(orders: Order[]) {
  const totals = new Map<string, number>();
  for (const order of orders)
    for (const payment of order.payments ?? [])
      totals.set(payment.method, (totals.get(payment.method) ?? 0) + toNumber(payment.amount));
  return [...totals.entries()].map(([method, total]) => ({ method, total })).sort((a, b) => b.total - a.total);
}

export function topProducts(orders: Order[], limit = 5) {
  const byProduct = new Map<string, { name: string; quantity: number; total: number }>();
  for (const order of orders)
    for (const item of order.items ?? []) {
      const name = item.product?.name ?? "Unknown product";
      const entry = byProduct.get(name) ?? { name, quantity: 0, total: 0 };
      entry.quantity += item.quantity;
      entry.total += toNumber(item.totalPrice);
      byProduct.set(name, entry);
    }
  return [...byProduct.values()].sort((a, b) => b.total - a.total).slice(0, limit);
}

export function topStaff(orders: Order[], limit = 5) {
  const byPerson = new Map<string, { name: string; orders: number; total: number }>();
  for (const order of orders) {
    const name = personName(order.user);
    const entry = byPerson.get(name) ?? { name, orders: 0, total: 0 };
    entry.orders += 1;
    entry.total += toNumber(order.total);
    byPerson.set(name, entry);
  }
  return [...byPerson.values()].sort((a, b) => b.total - a.total).slice(0, limit);
}

export const PAYMENT_LABELS: Record<string, string> = { CASH: "Cash", MOMO: "MoMo", CARD: "Card", CREDIT: "Credit" };

// "+12% vs yesterday"; null when there is nothing to compare with.
export const change = (now: number, before: number) => (before > 0 ? Math.round(((now - before) / before) * 100) : null);
