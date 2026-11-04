// The words the app uses for money, so the website says the same.

export type ExpenseCategory =
  | "RENT"
  | "ELECTRICITY"
  | "WATER"
  | "INTERNET"
  | "WAGES"
  | "TRANSPORT"
  | "SUPPLIES"
  | "MAINTENANCE"
  | "TAX"
  | "MARKETING"
  | "OTHER";
export type ExpenseRepeat = "ONCE" | "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
export type ExpenseStatus = "APPROVED" | "PENDING" | "REJECTED";
export type ExpensePaidFrom = "TILL_CASH" | "TILL_MOMO" | "OWN_MONEY" | "OTHER";
export type RepaidWith = "CASH" | "MOMO" | "BANK";

export const EXPENSE_CATEGORIES: { value: ExpenseCategory; label: string }[] = [
  { value: "RENT", label: "Rent" },
  { value: "ELECTRICITY", label: "Electricity" },
  { value: "WATER", label: "Water" },
  { value: "INTERNET", label: "Internet & phone" },
  { value: "WAGES", label: "Other wages" },
  { value: "TRANSPORT", label: "Transport" },
  { value: "SUPPLIES", label: "Supplies" },
  { value: "MAINTENANCE", label: "Repairs" },
  { value: "TAX", label: "Taxes & fees" },
  { value: "MARKETING", label: "Advertising" },
  { value: "OTHER", label: "Other" },
];

export const EXPENSE_REPEATS: { value: ExpenseRepeat; label: string; per: string }[] = [
  { value: "ONCE", label: "One time", per: "" },
  { value: "DAILY", label: "Every day", per: "per day" },
  { value: "WEEKLY", label: "Every week", per: "per week" },
  { value: "MONTHLY", label: "Every month", per: "per month" },
  { value: "YEARLY", label: "Every year", per: "per year" },
];

export const PAID_FROM: Record<ExpensePaidFrom, string> = {
  TILL_CASH: "Cash from the till",
  TILL_MOMO: "MoMo from the till",
  OWN_MONEY: "Worker's own money",
  OTHER: "Other",
};

export const REPAID_WITH: { value: RepaidWith; label: string }[] = [
  { value: "CASH", label: "Cash" },
  { value: "MOMO", label: "MoMo" },
  { value: "BANK", label: "Bank" },
];

export const categoryLabel = (value: string) => EXPENSE_CATEGORIES.find((c) => c.value === value)?.label ?? value;
export const repeatOf = (value: string) => EXPENSE_REPEATS.find((r) => r.value === value) ?? EXPENSE_REPEATS[0];

export type DebtKind = "SHORTAGE" | "ADVANCE" | "GOODS" | "DAMAGE" | "EXPENSE" | "OTHER";
export type DebtPaymentMethod = "CASH" | "MOMO" | "SALARY";
export type SalaryMethod = "CASH" | "MOMO" | "BANK";

export const DEBT_KINDS: { value: DebtKind; label: string }[] = [
  { value: "ADVANCE", label: "Salary advance" },
  { value: "SHORTAGE", label: "Money missing" },
  { value: "GOODS", label: "Goods taken" },
  { value: "DAMAGE", label: "Damage or loss" },
  { value: "EXPENSE", label: "Rejected expense" },
  { value: "OTHER", label: "Other" },
];

export const DEBT_PAYMENT_METHODS: { value: DebtPaymentMethod; label: string }[] = [
  { value: "CASH", label: "Cash" },
  { value: "MOMO", label: "MoMo" },
  { value: "SALARY", label: "From the salary" },
];

export const SALARY_METHODS: { value: SalaryMethod; label: string }[] = [
  { value: "CASH", label: "Cash" },
  { value: "MOMO", label: "MoMo" },
  { value: "BANK", label: "Bank" },
];

export const debtKindLabel = (value: string) => DEBT_KINDS.find((k) => k.value === value)?.label ?? value;
export const debtMethodLabel = (value: string) => DEBT_PAYMENT_METHODS.find((m) => m.value === value)?.label ?? value;
