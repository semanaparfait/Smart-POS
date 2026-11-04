import { useOwnerData } from "@/stores/owner/api";
import type { BillingStatus } from "@/app/admin/components/Platform";

export interface SubscriptionPayment {
  id: string;
  amount: number;
  months: number;
  method: string;
  paidOn: string;
  coversFrom: string;
  coversTo: string;
  note: string | null;
  recordedByName: string | null;
  createdAt: string;
}

export interface Billing {
  plan: string | null;
  monthlyPrice: number;
  paidUntil: string | null;
  trialEnds: string | null;
  note: string | null;
  status: BillingStatus;
  totalPaid: number;
  payments: SubscriptionPayment[];
}

// The plans on the website's pricing section, with their starting price.
export const PLANS = [
  { value: "TRIAL", label: "Free trial", price: 0, hint: "Free until the day you choose." },
  { value: "STARTER", label: "Starter", price: 100_000, hint: "100,000 RWF a month on the website." },
  { value: "BUSINESS", label: "Business", price: 150_000, hint: "150,000 RWF a month on the website." },
  { value: "ENTERPRISE", label: "Enterprise", price: 0, hint: "A price agreed with the company." },
] as const;

export const METHODS = [
  { value: "MOMO", label: "MoMo" },
  { value: "BANK", label: "Bank" },
  { value: "CASH", label: "Cash" },
  { value: "CARD", label: "Card" },
  { value: "OTHER", label: "Other" },
];

export const useBilling = (companyId: string) => useOwnerData<Billing>(`/companies/${companyId}/billing`);

export const dayLabel = (day: string | null) =>
  day ? new Date(`${day}T12:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—";
