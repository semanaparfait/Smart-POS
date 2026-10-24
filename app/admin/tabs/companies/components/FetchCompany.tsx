"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Building2,
  ChevronRight,
  Coffee,
  Hotel,
  Mail,
  MapPin,
  Phone,
  Pill,
  ShoppingBag,
  Store,
  Utensils,
  Wine,
} from "lucide-react";
import type { CompanyType } from "@/stores/companies/companyTypes";

export const INDUSTRIES: Record<string, { label: string; icon: React.ElementType }> = {
  RESTAURANT: { label: "Restaurant", icon: Utensils },
  BAR: { label: "Bar", icon: Wine },
  HOTEL: { label: "Hotel", icon: Hotel },
  CAFE: { label: "Cafe", icon: Coffee },
  SUPERMARKET: { label: "Supermarket", icon: ShoppingBag },
  PHARMACY: { label: "Pharmacy", icon: Pill },
  SHOP: { label: "Shop", icon: Store },
};

export const industryOf = (type?: string) =>
  INDUSTRIES[type?.toUpperCase() ?? ""] ?? {
    label: type ? type.charAt(0) + type.slice(1).toLowerCase() : "Business",
    icon: Building2,
  };

const formatDate = (value?: string) => {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime())
    ? date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    : "—";
};

const initials = (name?: string) =>
  (name ?? "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "C";

function CompanyAvatar({ company, size = "h-12 w-12 text-sm" }: { company: CompanyType; size?: string }) {
  return company.logo ? (
    // eslint-disable-next-line @next/next/no-img-element -- logos come from arbitrary hosts
    <img
      src={company.logo}
      alt=""
      className={`${size} shrink-0 rounded-xl bg-white object-cover ring-1 ring-slate-200`}
    />
  ) : (
    <span className={`${size} flex shrink-0 items-center justify-center rounded-xl bg-slate-900 font-bold tracking-wide text-white`}>
      {initials(company.name)}
    </span>
  );
}

function IndustryPill({ type }: { type?: string }) {
  const { label, icon: Icon } = industryOf(type);
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
      <Icon className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
      {label}
    </span>
  );
}

const detailsHref = (company: CompanyType) => `/admin/tabs/companies/${company.id}`;

/** Card grid */
function CompanyGrid({ companies }: { companies: CompanyType[] }) {
  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {companies.map((company) => (
        <li key={company.id}>
          <Link
            href={detailsHref(company)}
            className="group flex h-full flex-col rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-900/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            <div className="flex items-start gap-3.5">
              <CompanyAvatar company={company} />
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-[15px] font-bold tracking-[-0.01em] text-slate-900">{company.name}</h3>
                {company.code && (
                  <p className="mt-1 inline-block rounded-md bg-slate-50 px-1.5 py-0.5 font-mono text-[11px] text-slate-500 ring-1 ring-inset ring-slate-200">
                    {company.code}
                  </p>
                )}
              </div>
              <IndustryPill type={company.type} />
            </div>

            <dl className="mt-5 space-y-2.5 border-t border-slate-100 pt-4 text-[13px]">
              {[
                { icon: MapPin, label: "Location", value: company.location },
                { icon: Mail, label: "Email", value: company.email },
                { icon: Phone, label: "Phone", value: company.phone_number ? String(company.phone_number) : "" },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-2.5">
                  <dt className="sr-only">{label}</dt>
                  <Icon className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                  <dd className={`truncate ${value ? "text-slate-600" : "italic text-slate-400"}`}>{value || "Not provided"}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-auto flex items-center justify-between pt-5">
              <span className="text-xs text-slate-400">
                Joined <span className="font-medium text-slate-500">{formatDate(company.createdAt)}</span>
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-900">
                View details
                <ArrowUpRight
                  className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** Compact table */
function CompanyTable({ companies }: { companies: CompanyType[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-slate-200/80 bg-slate-50/80 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
            <tr>
              <th scope="col" className="px-5 py-3">Company</th>
              <th scope="col" className="px-5 py-3">Industry</th>
              <th scope="col" className="px-5 py-3">Location</th>
              <th scope="col" className="px-5 py-3">Contact</th>
              <th scope="col" className="px-5 py-3">Joined</th>
              <th scope="col" className="px-5 py-3"><span className="sr-only">Open</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {companies.map((company) => (
              <tr key={company.id} className="group transition-colors hover:bg-slate-50/70">
                <td className="px-5 py-3.5">
                  <Link href={detailsHref(company)} className="flex items-center gap-3 focus-visible:outline-none">
                    <CompanyAvatar company={company} size="h-9 w-9 text-xs" />
                    <span className="min-w-0">
                      <span className="block truncate font-semibold text-slate-900 group-hover:underline">{company.name}</span>
                      {company.code && <span className="block font-mono text-[11px] text-slate-400">{company.code}</span>}
                    </span>
                  </Link>
                </td>
                <td className="px-5 py-3.5"><IndustryPill type={company.type} /></td>
                <td className="max-w-48 truncate px-5 py-3.5 text-slate-600">{company.location || "—"}</td>
                <td className="px-5 py-3.5">
                  <span className="block max-w-56 truncate text-slate-600">{company.email || "—"}</span>
                  {company.phone_number ? <span className="block text-xs text-slate-400">{company.phone_number}</span> : null}
                </td>
                <td className="whitespace-nowrap px-5 py-3.5 text-slate-500">{formatDate(company.createdAt)}</td>
                <td className="px-5 py-3.5 text-right">
                  <Link
                    href={detailsHref(company)}
                    aria-label={`Open ${company.name}`}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white hover:text-slate-900 hover:ring-1 hover:ring-slate-200"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** Placeholder cards while companies load */
export function CompanySkeleton() {
  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-hidden="true">
      {Array.from({ length: 6 }, (_, i) => (
        <li key={i} className="animate-pulse rounded-2xl border border-slate-200/80 bg-white p-5">
          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-xl bg-slate-100" />
            <div className="flex-1 space-y-2">
              <div className="h-3.5 w-2/3 rounded bg-slate-100" />
              <div className="h-3 w-1/3 rounded bg-slate-100" />
            </div>
          </div>
          <div className="mt-5 space-y-3 border-t border-slate-100 pt-4">
            <div className="h-3 w-3/4 rounded bg-slate-100" />
            <div className="h-3 w-2/3 rounded bg-slate-100" />
            <div className="h-3 w-1/2 rounded bg-slate-100" />
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function FetchCompany({
  companies,
  view,
}: {
  companies: CompanyType[];
  view: "grid" | "list";
}) {
  return view === "grid" ? <CompanyGrid companies={companies} /> : <CompanyTable companies={companies} />;
}
