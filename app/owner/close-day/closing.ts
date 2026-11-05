// Closing the business day: what the server sends and expects.

export type Method = "CASH" | "MOMO" | "CARD" | "CREDIT";

export interface StockRow {
  productId: string;
  name: string;
  unit: string;
  opening: number;
  received: number;
  sold: number;
  wasted: number;
  adjusted: number;
  expected: number;
  counted: number | null;
  difference: number;
  value: number;
  buyingPrice?: number;
}

export interface ClosingMoney {
  expected: Record<Method, number>;
  counted: Record<Exclude<Method, "CREDIT">, number>;
  difference: number;
  sales: number;
  services: number;
  tillExpenses: number;
}

export interface Preview {
  businessDay: string;
  from: string;
  to: string;
  lastClosedAt: string | null;
  openOrders: { id: string; createdAt: string; status: string; total: number; staff: string; customerName: string | null }[];
  money: ClosingMoney;
  orders: { paid: number; paidTotal: number; cancelled: number };
  moneyChecks: { verified: number; flagged: number };
  stock: StockRow[];
}

export interface Closing {
  id: string;
  businessDay: string;
  openedAt: string;
  closedAt: string;
  closedByName: string;
  money: ClosingMoney;
  orders: { paid: number; paidTotal: number; cancelled: number };
  stock: StockRow[];
  note: string | null;
}

export const COUNTED: Exclude<Method, "CREDIT">[] = ["CASH", "MOMO", "CARD"];
export const METHOD_LABEL: Record<Method, string> = { CASH: "Cash", MOMO: "MoMo", CARD: "Card", CREDIT: "Credit (owed)" };

export const when = (iso: string) =>
  new Date(iso).toLocaleString("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

export const qty = (n: number) => (Math.round(n * 1000) / 1000).toLocaleString("en-US");
