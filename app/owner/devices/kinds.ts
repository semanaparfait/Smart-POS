import { Bike, ChefHat, Store, Tv, type LucideIcon } from "lucide-react";
import type { Device, DeviceKind } from "@/app/owner/types";

export const DEVICES = "/owner/devices";

export const KINDS: Record<DeviceKind, { label: string; icon: LucideIcon; text: string }> = {
  POS_TERMINAL: { label: "Till", icon: Store, text: "Sells, takes payments" },
  KITCHEN_DISPLAY: { label: "Kitchen display", icon: ChefHat, text: "Shows orders to prepare" },
  CUSTOMER_DISPLAY: { label: "Customer display", icon: Tv, text: "Shows the customer their bill" },
  RIDER_PHONE: { label: "Rider phone", icon: Bike, text: "A rider's deliveries" },
};

export type DeviceState = "active" | "pending" | "disabled" | "rejected";

export const deviceState = (d: Device): DeviceState => {
  const s = (d.registrationStatus || "").toUpperCase();
  if (s === "REGISTERED" || s === "ACTIVE" || s === "ENABLED") return "active";
  if (s === "DISABLED") return "disabled";
  if (s === "REJECTED") return "rejected";
  return "pending";
};

export const STATE_META: Record<DeviceState, { label: string; cls: string; hint: string; bar: string }> = {
  active: { label: "Active", cls: "bg-lime text-ink", hint: "Approved and selling", bar: "bg-ink" },
  pending: { label: "Pending", cls: "bg-white text-ink ring-1 ring-inset ring-ink/15", hint: "Waiting for your approval", bar: "bg-lime" },
  disabled: { label: "Disabled", cls: "bg-ivory text-ink/55 ring-1 ring-inset ring-ink/10", hint: "Blocked from selling", bar: "bg-ink/25" },
  rejected: { label: "Rejected", cls: "bg-rose-50 text-rose-700", hint: "Access denied", bar: "bg-rose-500" },
};

export const kindOf = (d: Device): DeviceKind => d.type ?? "POS_TERMINAL";
