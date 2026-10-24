"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  GitBranch,
  Monitor,
  Users,
  Package,
  ShoppingCart,
  CreditCard,
  BarChart3,
  ClipboardList,
  Headphones,
  Bell,
  KeyRound,
  ShieldCheck,
  Settings,
  LogOut,
  LifeBuoy,
  ArrowRight,
} from "lucide-react";
import { LogoMark } from "@/app/components/Logo";
import useAuthStore from "@/stores/auth/authstore";

interface MenuItem {
  name: string;
  icon: React.ComponentType<{ className?: string; size?: number; strokeWidth?: number }>;
  href: string;
  badge?: string | number;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

const menuItems: MenuSection[] = [
  {
    title: "Overview",
    items: [{ name: "Dashboard", icon: LayoutDashboard, href: "/admin" }],
  },
  {
    title: "Business",
    items: [
      { name: "Companies", icon: Building2, href: "/admin/tabs/companies" },
      { name: "Branches", icon: GitBranch, href: "/admin/tabs/branches" },
      { name: "Installation Requests", icon: ClipboardList, href: "/admin/tabs/installations", badge: 3 },
    ],
  },
  {
    title: "POS Management",
    items: [
      { name: "POS Devices", icon: Monitor, href: "/admin/tabs/devices" },
      { name: "Activation Keys", icon: KeyRound, href: "/admin/tabs/keys" },
    ],
  },
  {
    title: "Users & Access",
    items: [
      { name: "Users", icon: Users, href: "/admin/tabs/users" },
      { name: "Roles & Permissions", icon: ShieldCheck, href: "/admin/tabs/roles" },
    ],
  },
  {
    title: "Operations",
    items: [
      { name: "Products", icon: Package, href: "/admin/tabs/products" },
      { name: "Orders", icon: ShoppingCart, href: "/admin/tabs/orders" },
      { name: "Payments", icon: CreditCard, href: "/admin/tabs/payments" },
    ],
  },
  {
    title: "Analytics",
    items: [{ name: "Sales Analytics", icon: BarChart3, href: "/admin/tabs/analytics" }],
  },
  {
    title: "System",
    items: [
      { name: "Notifications", icon: Bell, href: "/admin/tabs/notifications", badge: "New" },
      { name: "Support", icon: Headphones, href: "/admin/tabs/support" },
      { name: "Settings", icon: Settings, href: "/admin/tabs/settings" },
    ],
  },
];

/** Text that only appears while the sidebar is expanded */
const reveal =
  "whitespace-nowrap opacity-0 transition-opacity duration-200 group-hover/sidebar:opacity-100 group-focus-within/sidebar:opacity-100";

/** Only visible while the sidebar is collapsed */
const collapsedOnly =
  "transition-opacity duration-200 group-hover/sidebar:opacity-0 group-focus-within/sidebar:opacity-0";

/** The dashboard matches exactly; other items also stay active on their detail pages */
const isActivePath = (pathname: string, href: string) =>
  href === "/admin" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

const initials = (name?: string) =>
  (name ?? "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "SP";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push("/pages/Login");
  };

  return (
    <aside className="group/sidebar absolute left-0 top-0 z-40 flex h-full w-16 flex-col overflow-x-hidden border-r border-slate-200/80 bg-slate-50 text-slate-600 shadow-sm transition-[width,box-shadow] duration-300 ease-out select-none hover:w-64 hover:shadow-2xl hover:shadow-slate-900/10 focus-within:w-64 focus-within:shadow-2xl focus-within:shadow-slate-900/10">
      {/* Brand */}
      <Link
        href="/admin"
        className="flex h-16 shrink-0 items-center gap-2 border-b border-slate-200/70 bg-white px-3 focus-visible:outline-none"
        title="SmartPOS Admin"
      >
        <LogoMark className="h-10 w-10 shrink-0" title="SmartPOS" />
        <span className={`-ml-1.5 leading-none ${reveal}`}>
          <span className="block text-[17px] font-extrabold tracking-[-0.04em] text-slate-900">SmartPOS</span>
          <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Admin console</span>
        </span>
      </Link>

      {/* Navigation */}
      <nav
        aria-label="Admin"
        className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 mask-[linear-gradient(to_bottom,black_calc(100%-24px),transparent)] [scrollbar-color:var(--color-slate-200)_transparent] scrollbar-thin"
      >
        {menuItems.map((section, index) => (
          <div key={section.title} className={index > 0 ? "mt-4" : undefined}>
            {/* Section heading when expanded, a short divider when collapsed */}
            <div className="relative mb-1 h-5">
              <span className={`absolute left-2.75 top-1/2 h-px w-4.5 bg-slate-200 ${collapsedOnly}`} aria-hidden="true" />
              <p className={`absolute inset-0 flex items-center px-2.75 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400 ${reveal}`}>
                {section.title}
              </p>
            </div>

            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = isActivePath(pathname, item.href);

                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      title={item.name}
                      aria-current={active ? "page" : undefined}
                      className={`group/item relative flex h-10 items-center gap-3 rounded-lg px-2.75 text-[13px] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-1 focus-visible:ring-offset-slate-50 ${
                        active
                          ? "bg-slate-900 font-semibold text-white shadow-md shadow-slate-900/20"
                          : "font-medium text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-sm hover:ring-1 hover:ring-slate-200/80 active:scale-[0.98]"
                      }`}
                    >
                      <Icon
                        size={18}
                        strokeWidth={active ? 2.4 : 2}
                        className={`shrink-0 transition-colors ${
                          active ? "text-white" : "text-slate-400 group-hover/item:text-slate-700"
                        }`}
                      />
                      <span className={`truncate ${reveal}`}>{item.name}</span>

                      {item.badge !== undefined && (
                        <>
                          {/* Collapsed: small dot on the icon */}
                          <span
                            className={`absolute left-[25px] top-2 h-2 w-2 rounded-full ring-2 ${collapsedOnly} ${
                              active ? "bg-white ring-slate-900" : "bg-slate-900 ring-slate-50"
                            }`}
                            aria-hidden="true"
                          />
                          {/* Expanded: full badge */}
                          <span
                            className={`ml-auto rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums ${reveal} ${
                              active
                                ? "bg-white/15 text-white"
                                : typeof item.badge === "number"
                                  ? "bg-slate-900 text-white"
                                  : "bg-slate-200 text-slate-700"
                            }`}
                          >
                            {item.badge}
                          </span>
                        </>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}

        {/* Help card — expanded sidebar only */}
        <div className="mt-6 hidden overflow-hidden rounded-xl bg-slate-900 p-4 text-white group-hover/sidebar:block group-focus-within/sidebar:block">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
            <LifeBuoy size={16} className="text-white" />
          </span>
          <p className="mt-3 text-[13px] font-bold">Need a hand?</p>
          <p className="mt-1 text-[11px] leading-relaxed text-white/60">
            Get help with installations, devices and accounts.
          </p>
          <Link
            href="/admin/tabs/support"
            className="mt-3 flex h-8 items-center justify-center gap-1.5 rounded-lg bg-white text-[12px] font-semibold text-slate-900 transition-colors hover:bg-slate-100"
          >
            Open support <ArrowRight size={13} />
          </Link>
        </div>
      </nav>

      {/* Signed-in user & logout */}
      <div className="shrink-0 border-t border-slate-200/70 bg-white p-2">
        <div className="flex items-center gap-2.5 rounded-xl p-1 ring-1 ring-transparent transition-colors group-hover/sidebar:bg-slate-50 group-hover/sidebar:ring-slate-200/80 group-focus-within/sidebar:bg-slate-50 group-focus-within/sidebar:ring-slate-200/80">
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-xs font-bold tracking-wide text-white"
            title={user?.name ?? "Signed in"}
          >
            {initials(user?.name)}
          </span>
          <span className={`min-w-0 flex-1 ${reveal}`}>
            <span className="block truncate text-[13px] font-semibold text-slate-900">{user?.name ?? "Administrator"}</span>
            <span className="block truncate text-[11px] text-slate-500">{user?.email ?? ""}</span>
            {user?.role && (
              <span className="mt-1 inline-block rounded bg-slate-200/70 px-1.5 py-px text-[9px] font-bold uppercase tracking-wider text-slate-600">
                {user.role.replace(/_/g, " ")}
              </span>
            )}
          </span>
          <button
            type="button"
            onClick={handleLogout}
            title="Log out"
            aria-label="Log out"
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-200 ${reveal}`}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
