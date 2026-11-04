// What the Salaries & debts pages read from /staff-debts (the same as the app's).
import type { DebtKind, DebtPaymentMethod, SalaryMethod } from "@/app/owner/finance/labels";
import { rwf } from "@/app/owner/components/ui";

export const SALARIES = "/owner/salaries";

type Person = { id: string; name: string } | null;

export interface Debt {
  id: string;
  kind: DebtKind;
  amount: number;
  date: string;
  note: string | null;
  chargedBy: Person;
}

export interface DebtPayment {
  id: string;
  amount: number;
  method: DebtPaymentMethod;
  status: "PENDING" | "APPROVED" | "REJECTED";
  proofUrl: string | null;
  note: string | null;
  sentBy: Person;
  reviewNote: string | null;
  reviewedBy?: Person;
  createdAt: string;
}

export interface SalaryPayment {
  id: string;
  month: string;
  salary: number;
  deducted: number;
  amount: number;
  method: SalaryMethod;
  paidOn: string;
  note?: string | null;
  paidBy: Person;
}

export interface Worker {
  employeeId: string;
  userId?: string | null;
  name: string;
  active: boolean;
  // For per-delivery pay: this month's deliveries times the rate.
  salary: number;
  payType?: "MONTHLY" | "PER_DELIVERY";
  perDelivery?: number | null;
  deliveries?: number;
  waiting: number;
  owed: number;
  toPay: number;
  debts: Debt[];
  payments: DebtPayment[];
  salaryPayments: SalaryPayment[];
}

// "Salary 120,000 RWF" or "12 deliveries × 1,000 RWF this month".
export const payLine = (w: Worker) =>
  w.payType === "PER_DELIVERY" ? `${w.deliveries ?? 0} deliveries × ${rwf(w.perDelivery)} this month` : `Salary ${rwf(w.salary)}`;

export const monthKeyOf = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
export const shiftMonth = (month: string, by: number) => {
  const [y, m] = month.split("-").map(Number);
  return monthKeyOf(new Date(y, m - 1 + by, 1));
};
export const monthName = (month: string) => {
  const [y, m] = month.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
};
