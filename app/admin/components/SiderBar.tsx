"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Building2, Inbox, LayoutDashboard, LogOut, Monitor, Users, type LucideIcon } from "lucide-react";
import { LogoMark } from "@/app/components/Logo";
import useAuthStore from "@/stores/auth/authstore";
import { usePlatform } from "@/app/admin/components/Platform";

interface Item {
  name: string;
  icon: LucideIcon;
  href: string;
  hint: string;
}

const MENU: { title: string; items: Item[] }[] = [
  { title: "Overview", items: [{ name: "Dashboard", icon: LayoutDashboard, href: "/admin", hint: "The whole platform today" }] },
  {
    title: "Manage",
    items: [
      { name: "Companies", icon: Building2, href: "/admin/tabs/companies", hint: "Businesses on SmartPOS" },
      { name: "Users", icon: Users, href: "/admin/tabs/users", hint: "Owners and staff accounts" },
      { name: "Devices", icon: Monitor, href: "/admin/tabs/devices", hint: "Tills, screens and phones" },
    ],
  },
  { title: "Support", items: [{ name: "Inbox", icon: Inbox, href: "/admin/tabs/inbox", hint: "Requests, messages, password help" }] },
];

// The dashboard matches exactly; the others stay active on their detail pages.
const isActive = (pathname: string, href: string) => (href === "/admin" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`));

const initials = (name?: string) =>
  (name ?? "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "SP";

// Labels show from large screens; smaller screens keep the icons only.
export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { data } = usePlatform();
  const badges: Record<string, number> = {
    "/admin/tabs/devices": data?.totals.waitingDevices ?? 0,
    "/admin/tabs/inbox": data?.totals.newRequests ?? 0,
  };

  const handleLogout = () => {
    logout();
    router.push("/pages/Login");
  };

  return (
    <aside className="flex h-full w-16 shrink-0 flex-col bg-ink text-white/70 lg:w-60">
      <Link href="/admin" className="flex h-16 shrink-0 items-center gap-2.5 border-b border-white/10 px-3 lg:px-4" title="SmartPOS Admin">
        <LogoMark tone="dark" className="h-10 w-10 shrink-0" title="SmartPOS" />
        <span className="hidden leading-none lg:block">
          <span className="block text-[17px] font-bold tracking-[-0.03em] text-white">SmartPOS</span>
          <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.16em] text-lime">Admin console</span>
        </span>
      </Link>

      <nav aria-label="Admin" className="flex-1 overflow-y-auto px-2.5 py-5 lg:px-3">
        {MENU.map((section, i) => (
          <div key={section.title} className={i ? "mt-6" : undefined}>
            <p className="mb-2 hidden px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/35 lg:block">{section.title}</p>
            <span className="mx-auto mb-2 block h-px w-6 bg-white/15 lg:hidden" aria-hidden="true" />
            <ul className="space-y-1">
              {section.items.map(({ name, icon: Icon, href, hint }) => {
                const active = isActive(pathname, href);
                const badge = badges[href] ?? 0;
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      title={`${name}: ${hint}`}
                      aria-current={active ? "page" : undefined}
                      className={`relative flex h-11 items-center justify-center gap-3 rounded-xl px-3 text-[13px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime lg:justify-start ${
                        active ? "bg-lime font-semibold text-ink" : "font-medium text-white/70 hover:bg-white/[0.07] hover:text-white"
                      }`}
                    >
                      <Icon size={18} strokeWidth={2} className={`shrink-0 ${active ? "text-ink" : "text-white/50"}`} />
                      <span className="hidden min-w-0 flex-1 truncate lg:block">{name}</span>
                      {badge > 0 && (
                        <>
                          <span className={`hidden rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums lg:inline ${active ? "bg-ink text-lime" : "bg-lime text-ink"}`}>{badge}</span>
                          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-lime ring-2 ring-ink lg:hidden" aria-hidden="true" />
                        </>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}

        {data && (
          <div className="mt-8 hidden rounded-xl bg-white/[0.05] p-4 ring-1 ring-inset ring-white/10 lg:block">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/35">Right now</p>
            <dl className="mt-3 space-y-2 text-xs">
              <div className="flex justify-between">
                <dt className="text-white/55">Devices online</dt>
                <dd className="font-semibold text-white tabular-nums">
                  {data.totals.onlineDevices} / {data.totals.devices}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-white/55">Orders today</dt>
                <dd className="font-semibold text-white tabular-nums">{data.totals.ordersToday.toLocaleString()}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-white/55">Active companies</dt>
                <dd className="font-semibold text-white tabular-nums">
                  {data.totals.activeCompanies} / {data.totals.companies}
                </dd>
              </div>
            </dl>
          </div>
        )}
      </nav>

      <div className="shrink-0 border-t border-white/10 p-2.5 lg:p-3">
        <div className="flex items-center gap-2.5 lg:rounded-xl lg:bg-white/[0.05] lg:p-2">
          <Link href="/admin/tabs/profile" title="My profile" className="hidden min-w-0 flex-1 items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime lg:flex">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-lime text-xs font-bold text-ink">{initials(user?.name)}</span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-semibold text-white">{user?.name ?? "Administrator"}</span>
              <span className="block truncate text-[11px] text-white/45">My profile</span>
            </span>
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            title="Log out"
            aria-label="Log out"
            className="mx-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white/50 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime lg:mx-0"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
