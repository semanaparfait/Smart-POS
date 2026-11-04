"use client";

import { createContext, useContext, useEffect } from "react";
import { useOwnerData } from "@/stores/owner/api";

// What GET /companies/platform-overview gives: totals across every company.
export interface PlatformCompany {
  id: string;
  name: string;
  code: string;
  logo: string | null;
  type: string;
  location: string;
  createdAt: string;
  active: boolean;
  plan: string | null;
  monthlyPrice: number;
  paidUntil: string | null;
  billing: BillingStatus;
  salesToday: number;
  ordersToday: number;
  salesMonth: number;
  ordersMonth: number;
  lastOrderAt: string | null;
  users: number;
  activeUsers: number;
  devices: number;
  onlineDevices: number;
  waitingDevices: number;
}

export interface PlatformOverview {
  totals: {
    companies: number;
    activeCompanies: number;
    newThisMonth: number;
    salesToday: number;
    ordersToday: number;
    salesMonth: number;
    salesLastMonth: number;
    users: number;
    activeUsers: number;
    devices: number;
    onlineDevices: number;
    waitingDevices: number;
    monthlyRevenue: number;
    collectedThisMonth: number;
    overdue: number;
    dueSoon: number;
    newRequests: number;
  };
  salesByDay: { day: string; total: number; orders: number }[];
  companies: PlatformCompany[];
}

export type BillingStatus = "NOT_SET" | "PAID" | "DUE_SOON" | "OVERDUE";

export const PLAN_LABEL: Record<string, string> = { TRIAL: "Free trial", STARTER: "Starter", BUSINESS: "Business", ENTERPRISE: "Enterprise" };

export const BILLING_META: Record<BillingStatus, { label: string; cls: string }> = {
  NOT_SET: { label: "No plan", cls: "bg-ivory text-ink/60 ring-ink/10" },
  PAID: { label: "Paid", cls: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  DUE_SOON: { label: "Due soon", cls: "bg-lime/50 text-ink ring-lime" },
  OVERDUE: { label: "Overdue", cls: "bg-rose-50 text-rose-700 ring-rose-200" },
};

// Same rule as the server: overdue after the last paid day, due soon within a week.
export function billingOf(plan: string | null | undefined, paidUntil: string | null | undefined, today: string): BillingStatus {
  if (!plan) return "NOT_SET";
  if (!paidUntil || paidUntil < today) return "OVERDUE";
  const soon = new Date(`${today}T12:00:00`);
  soon.setDate(soon.getDate() + 7);
  const key = `${soon.getFullYear()}-${String(soon.getMonth() + 1).padStart(2, "0")}-${String(soon.getDate()).padStart(2, "0")}`;
  return paidUntil < key ? "DUE_SOON" : "PAID";
}

type State = { data: PlatformOverview | null; loading: boolean; error: string | null; reload: () => void };

const PlatformContext = createContext<State>({ data: null, loading: true, error: null, reload: () => {} });

// Loads the overview once for the whole admin area (sidebar, top bar and
// dashboard) and refreshes it every minute.
export function PlatformProvider({ children }: { children: React.ReactNode }) {
  const state = useOwnerData<PlatformOverview>("/companies/platform-overview");
  const { reload } = state;
  useEffect(() => {
    const timer = setInterval(reload, 60_000);
    return () => clearInterval(timer);
  }, [reload]);
  return <PlatformContext.Provider value={state}>{children}</PlatformContext.Provider>;
}

export const usePlatform = () => useContext(PlatformContext);

// Companies that need the super admin's eye.
export function attentionOf(data: PlatformOverview | null, now: number) {
  const list = data?.companies ?? [];
  const week = 7 * 86_400_000;
  return {
    waitingDevices: list.filter((c) => c.waitingDevices > 0),
    terminated: list.filter((c) => !c.active),
    quiet: list.filter((c) => c.active && (!c.lastOrderAt || now - new Date(c.lastOrderAt).getTime() > week) && now - new Date(c.createdAt).getTime() > week),
    noDevices: list.filter((c) => c.active && c.devices === 0),
    overdue: list.filter((c) => c.active && c.billing === "OVERDUE"),
    dueSoon: list.filter((c) => c.active && c.billing === "DUE_SOON"),
  };
}
