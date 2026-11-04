"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { BedDouble, Bike, Check, ChefHat, Copy, FileText, FolderOpen, KeyRound, LayoutGrid, Mail, MapPin, Package, PauseCircle, Pencil, Phone, Store, Users, type LucideIcon } from "lucide-react";
import useAuthStore from "@/stores/auth/authstore";
import { useOwnerData } from "@/stores/owner/api";
import type { Category, Employee, Product, Role } from "@/app/owner/types";
import { Avatar, Badge, Card, PageHeader, StatCard } from "@/app/owner/components/ui";
import { LinkButton } from "@/app/owner/components/forms";

const EXTRAS: { key: "services" | "delivery" | "floorMap" | "kitchen"; label: string; text: string; icon: LucideIcon }[] = [
  { key: "services", label: "Services & bookings", text: "Rooms, halls, games, tickets and rentals.", icon: BedDouble },
  { key: "delivery", label: "Delivery", text: "Delivery orders, riders and rider phones.", icon: Bike },
  { key: "floorMap", label: "Floor map & tables", text: "Your venue's map and the Tables screen.", icon: LayoutGrid },
  { key: "kitchen", label: "Kitchen screen", text: "Kitchen display and kitchen staff.", icon: ChefHat },
];

const INDUSTRIES: Record<string, string> = {
  RESTAURANT: "Restaurant",
  BAR: "Bar",
  HOTEL: "Hotel",
  SUPERMARKET: "Supermarket",
  PHARMACY: "Pharmacy",
  SHOP: "Shop",
};

export default function OwnerCompany() {
  const company = useAuthStore((s) => s.user?.company);
  const [copied, setCopied] = useState(false);
  const employees = useOwnerData<Employee[]>("/employees");
  const roles = useOwnerData<Role[]>("/roles");
  const products = useOwnerData<Product[]>("/products");
  const categories = useOwnerData<Category[]>("/categories");

  if (!company) return null;

  // A server from before extras existed sends none: everything is on there.
  const features = company.features ?? { services: true, delivery: true, floorMap: true, kitchen: true };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(company.code);
      setCopied(true);
      toast.success("Company code copied");
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable */
    }
  };

  const details = [
    { label: "Location", value: company.location, icon: MapPin },
    { label: "Email", value: company.email, icon: Mail },
    { label: "Phone", value: company.phone_number, icon: Phone },
    { label: "Industry", value: INDUSTRIES[company.type] ?? company.type, icon: Store },
    { label: "TIN", value: company.tin || "—", icon: FileText },
    { label: "Longest hold for a sale", value: `${company.maxHoldMinutes ?? 60} min`, icon: PauseCircle },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Settings"
        title="Company profile"
        description="Your business details as customers and staff see them."
        actions={
          <>
            <LinkButton tone="outline" icon={KeyRound} href="/owner/settings/password">
              Change password
            </LinkButton>
            <LinkButton icon={Pencil} href="/owner/settings/details">
              Edit details
            </LinkButton>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard tone="dark" label="Employees" value={(employees.data?.length ?? 0).toLocaleString()} icon={Users} hint={`${roles.data?.length ?? 0} roles`} />
        <StatCard label="Products" value={(products.data?.length ?? 0).toLocaleString()} icon={Package} hint={`${(products.data ?? []).filter((p) => p.active).length} active`} />
        <StatCard label="Categories" value={(categories.data?.length ?? 0).toLocaleString()} icon={FolderOpen} hint="Product groups" />
      </div>

      <section className="overflow-hidden rounded-2xl border border-ink/10 bg-white">
        <div className="relative h-24 bg-ink">
          <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.12)_1px,transparent_1px)] bg-size-[16px_16px]" aria-hidden="true" />
        </div>
        <div className="flex flex-col gap-4 px-6 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-end gap-4">
            <div className="relative z-10 -mt-9 rounded-full bg-white p-1 shadow-md">
              <Avatar name={company.name} src={company.logo} size={72} />
            </div>
            <div className="pb-1">
              <h2 className="text-xl font-extrabold text-ink">{company.name}</h2>
              <p className="text-sm text-ink/55">{INDUSTRIES[company.type] ?? company.type}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={copyCode}
            className="inline-flex items-center gap-2 self-start rounded-xl bg-ivory px-4 py-2.5 text-sm ring-1 ring-inset ring-ink/12 hover:bg-ink/6 sm:self-auto"
          >
            <span className="text-xs text-ink/55">Company code</span>
            <span className="font-mono font-bold tracking-widest text-ink">{company.code}</span>
            {copied ? <Check className="h-4 w-4 text-ink" /> : <Copy className="h-4 w-4 text-ink/45" />}
          </button>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card title="Details" description="Change these in the SmartPOS app under Settings → Company.">
          <dl className="divide-y divide-ink/6">
            {details.map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex items-center gap-3.5 px-5 py-4">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-ivory text-ink/60">
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <dt className="text-xs text-ink/50">{label}</dt>
                  <dd className="truncate text-sm font-semibold text-ink">{value || <span className="italic text-ink/40">Not provided</span>}</dd>
                </div>
              </div>
            ))}
          </dl>
        </Card>

        <Card title="Extras" description="What your plan includes besides selling. Contact SmartPOS to add more.">
          <ul className="divide-y divide-ink/6">
            {EXTRAS.map(({ key, label, text, icon: Icon }) => {
              const on = features[key] === true;
              return (
                <li key={key} className="flex items-center gap-3.5 px-5 py-4">
                  <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${on ? "bg-ink text-lime" : "bg-ivory text-ink/40"}`}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-ink">{label}</p>
                    <p className="text-xs text-ink/55">{text}</p>
                  </div>
                  {on ? <Badge tone="success">Included</Badge> : <Badge>Not included</Badge>}
                </li>
              );
            })}
          </ul>
        </Card>
      </div>

      <Card>
        <div className="flex flex-col gap-2 p-5 text-sm text-ink/65 sm:flex-row sm:items-center sm:gap-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-lime text-ink">
            <Copy className="h-4.5 w-4.5" />
          </span>
          <p>
            <b className="text-ink">Setting up a new till or phone?</b> Open the SmartPOS app on it and enter the company code{" "}
            <span className="font-mono font-bold text-ink">{company.code}</span>. Then approve it under Devices.
          </p>
        </div>
      </Card>
    </div>
  );
}
