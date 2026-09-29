"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  ShieldCheck,
  Settings,
  LogOut,
  ChevronRight,
} from "lucide-react";

interface MenuItem {
  name: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  href?: string;
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
      { name: "Activation Keys", icon: ShieldCheck, href: "/admin/tabs/keys" },
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

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-screen bg-slate-50/50 border-r border-slate-200/80 flex flex-col select-none">
      {/* Brand Header */}
      <div className="h-16 px-5 flex items-center justify-between border-b border-slate-200/70 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-sm shadow-emerald-500/20 text-white font-bold text-base tracking-wider ring-1 ring-black/5">
            S
          </div>
          <div className="leading-tight">
            <h1 className="font-semibold text-sm text-slate-900 tracking-tight">SmartPOS</h1>
            <span className="inline-block text-[10px] font-medium uppercase tracking-wider text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
              Super Admin
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6 [scrollbar-width:thin] [scrollbar-color:theme(colors.slate.200)_transparent]">
        {menuItems.map((section) => (
          <div key={section.title} className="space-y-1">
            <p className="px-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {section.title}
            </p>

            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = item.href ? pathname === item.href : false;

                const buttonContent = (
                  <>
                    <Icon
                      size={17}
                      className={`transition-colors shrink-0 ${
                        isActive
                          ? "text-emerald-600"
                          : "text-slate-400 group-hover:text-slate-600"
                      }`}
                    />
                    <span className="truncate">{item.name}</span>

                    {/* Badge */}
                    {item.badge && (
                      <span
                        className={`ml-auto text-[10px] font-semibold px-1.5 py-0.2 rounded-full ${
                          typeof item.badge === "number"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </>
                );

                const itemClasses = `group w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 relative ${
                  isActive
                    ? "bg-emerald-50/80 text-emerald-900 font-semibold"
                    : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 active:scale-[0.99]"
                }`;

                return item.href ? (
                  <Link key={item.name} href={item.href} className={itemClasses}>
                    {isActive && (
                      <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-emerald-600 rounded-r-full" />
                    )}
                    {buttonContent}
                  </Link>
                ) : (
                  <button key={item.name} type="button" className={itemClasses}>
                    {buttonContent}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer / User Profile & Logout */}
      <div className="p-3 border-t border-slate-200/70 bg-white space-y-1.5">
        <div className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 transition cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-semibold text-slate-700">
            AD
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-slate-800 truncate">Alex Davis</p>
            <p className="text-[11px] text-slate-400 truncate">alex@smartpos.io</p>
          </div>
          <ChevronRight size={14} className="text-slate-400" />
        </div>

        <button
          type="button"
          className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition"
        >
          <LogOut size={15} />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
}