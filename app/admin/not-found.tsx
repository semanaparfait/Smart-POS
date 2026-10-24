import Link from "next/link";
import { Building2, Compass, LayoutDashboard, Monitor, Users } from "lucide-react";

const availablePages = [
  { label: "Companies", icon: Building2, href: "/admin/tabs/companies" },
  { label: "POS Devices", icon: Monitor, href: "/admin/tabs/devices" },
  { label: "Users", icon: Users, href: "/admin/tabs/users" },
];

export default function AdminNotFound() {
  return (
    <div className="flex min-h-full items-center justify-center py-10">
      <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
        <div className="relative px-8 pb-8 pt-10 text-center">
          {/* Soft dotted backdrop */}
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(var(--color-slate-200)_1px,transparent_1px)] bg-size-[18px_18px] mask-[linear-gradient(to_bottom,black,transparent_70%)]"
            aria-hidden="true"
          />

          <div className="relative">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg shadow-slate-900/20">
              <Compass size={26} />
            </span>
            <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">Error 404</p>
            <h1 className="mt-2 text-2xl font-bold tracking-[-0.02em] text-slate-900">This page isn&apos;t available</h1>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-slate-500">
              It may not be built yet, or the address is wrong. Pick one of the sections below or head back to the
              dashboard.
            </p>

            <div className="mt-7 flex flex-col justify-center gap-2.5 sm:flex-row">
              <Link
                href="/admin"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
              >
                <LayoutDashboard size={16} />
                Go to dashboard
              </Link>
              <Link
                href="/admin/tabs/companies"
                className="inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-slate-700 ring-1 ring-inset ring-slate-200 transition-colors hover:bg-slate-50 hover:text-slate-900"
              >
                <Building2 size={16} />
                View companies
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 bg-slate-50/70 px-8 py-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Available sections</p>
          <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
            {availablePages.map(({ label, icon: Icon, href }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="flex items-center gap-2.5 rounded-lg bg-white px-3 py-2.5 text-sm font-medium text-slate-700 ring-1 ring-inset ring-slate-200 transition-all hover:-translate-y-0.5 hover:text-slate-900 hover:shadow-sm"
                >
                  <Icon size={16} className="text-slate-400" />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
