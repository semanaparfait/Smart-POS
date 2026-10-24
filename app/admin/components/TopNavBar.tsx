"use client";

import {
  Bell,
  BellOff,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  LogOut,
  Search,
  Settings,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import useAuthStore from "@/stores/auth/authstore";

/** Readable names for admin URL segments */
const SECTION_NAMES: Record<string, string> = {
  companies: "Companies",
  branches: "Branches",
  installations: "Installation Requests",
  devices: "POS Devices",
  keys: "Activation Keys",
  users: "Users",
  roles: "Roles & Permissions",
  products: "Products",
  orders: "Orders",
  payments: "Payments",
  analytics: "Sales Analytics",
  notifications: "Notifications",
  support: "Support",
  settings: "Settings",
  employees: "Employees",
};

type Crumb = { label: string; href?: string };

/** "/admin/tabs/users/123" → Admin › Users › Details */
function getBreadcrumbs(pathname: string): Crumb[] {
  const [, , tabs, section, detail] = pathname.split("/");
  if (tabs !== "tabs" || !section) return [{ label: "Dashboard" }];

  const sectionLabel = SECTION_NAMES[section] ?? section.charAt(0).toUpperCase() + section.slice(1);
  return detail
    ? [{ label: sectionLabel, href: `/admin/tabs/${section}` }, { label: "Details" }]
    : [{ label: sectionLabel }];
}

const initials = (name?: string) =>
  (name ?? "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "SP";

const formatRole = (role?: string) => (role ? role.replace(/_/g, " ").toLowerCase() : "");

/** Closes a popover on outside click or Escape */
function useDismiss(ref: React.RefObject<HTMLElement | null>, open: boolean, close: () => void) {
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [ref, open, close]);
}

const popover =
  "absolute right-0 top-[calc(100%+10px)] z-50 origin-top-right overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-2xl shadow-slate-900/10";

export default function TopNavBar() {
  const { user, fetchMe, logout } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();
  const crumbs = getBreadcrumbs(pathname);
  const title = crumbs[crumbs.length - 1].label;

  const searchRef = useRef<HTMLInputElement>(null);
  const bellRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const [bellOpen, setBellOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);

  useDismiss(bellRef, bellOpen, () => setBellOpen(false));
  useDismiss(userRef, userOpen, () => setUserOpen(false));

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  // Ctrl+K / ⌘K focuses the search box
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/pages/Login");
  };

  const iconButton =
    "relative flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 ring-1 ring-inset ring-slate-200 transition-all hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400";

  return (
    <header className="relative z-50 flex h-16 w-full shrink-0 items-center gap-6 border-b border-slate-200/80 bg-white/90 px-6 backdrop-blur-md">
      {/* Page title with breadcrumb */}
      <div className="hidden min-w-0 shrink-0 md:block">
        <nav aria-label="Breadcrumb">
          <ol className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
            <li>
              <Link href="/admin" className="transition-colors hover:text-slate-700">
                Admin
              </Link>
            </li>
            {crumbs.map((crumb) => (
              <li key={crumb.label} className="flex items-center gap-1">
                <ChevronRight size={11} className="text-slate-300" aria-hidden="true" />
                {crumb.href ? (
                  <Link href={crumb.href} className="transition-colors hover:text-slate-700">
                    {crumb.label}
                  </Link>
                ) : (
                  <span aria-current="page" className="text-slate-500">
                    {crumb.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
        <p className="mt-0.5 truncate text-[17px] font-bold leading-tight tracking-[-0.02em] text-slate-900">{title}</p>
      </div>

      {/* Search */}
      <div className="group relative ml-auto w-full max-w-md">
        <Search
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-slate-700"
        />
        <input
          ref={searchRef}
          type="search"
          placeholder="Search companies, users, devices..."
          aria-label="Search"
          className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-16 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100"
        />
        <kbd className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 rounded-md border border-slate-200 bg-white px-1.5 py-0.5 font-sans text-[10px] font-semibold text-slate-400 shadow-xs sm:block">
          Ctrl K
        </kbd>
      </div>

      <div className="flex shrink-0 items-center gap-2.5">
        {/* Today */}
        <span className="hidden h-10 items-center gap-2 rounded-lg px-3 text-xs font-semibold text-slate-500 ring-1 ring-inset ring-slate-200 xl:flex">
          <CalendarDays size={15} className="text-slate-400" aria-hidden="true" />
          {/* The date can differ between server and browser time zones */}
          <span suppressHydrationWarning>
            {new Date().toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
          </span>
        </span>

        {/* Notifications */}
        <div ref={bellRef} className="relative">
          <button
            type="button"
            aria-label="Notifications"
            aria-expanded={bellOpen}
            aria-haspopup="dialog"
            onClick={() => {
              setBellOpen((v) => !v);
              setUserOpen(false);
            }}
            className={`${iconButton} ${bellOpen ? "bg-slate-50 text-slate-900 ring-slate-300" : ""}`}
          >
            <Bell size={18} />
          </button>

          {bellOpen && (
            <div role="dialog" aria-label="Notifications" className={`${popover} w-80`}>
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                <p className="text-sm font-bold text-slate-900">Notifications</p>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  0 new
                </span>
              </div>
              <div className="flex flex-col items-center px-6 py-9 text-center">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                  <BellOff size={20} />
                </span>
                <p className="mt-3 text-sm font-semibold text-slate-900">You&apos;re all caught up</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">
                  New installation requests and system alerts will appear here.
                </p>
              </div>
              <Link
                href="/admin/tabs/notifications"
                onClick={() => setBellOpen(false)}
                className="block border-t border-slate-100 bg-slate-50/70 px-4 py-2.5 text-center text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
              >
                View all notifications
              </Link>
            </div>
          )}
        </div>

        <span className="mx-1 h-8 w-px bg-slate-200" aria-hidden="true" />

        {/* User menu */}
        <div ref={userRef} className="relative">
          <button
            type="button"
            aria-haspopup="menu"
            aria-expanded={userOpen}
            onClick={() => {
              setUserOpen((v) => !v);
              setBellOpen(false);
            }}
            className={`flex items-center gap-3 rounded-xl py-1 pl-1 pr-2.5 text-left transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 ${
              userOpen ? "bg-slate-50" : ""
            }`}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-xs font-bold tracking-wide text-white">
              {initials(user?.name)}
            </span>
            <span className="hidden min-w-0 leading-tight sm:block">
              <span className="block max-w-40 truncate text-sm font-semibold text-slate-900">{user?.name ?? "Not signed in"}</span>
              <span className={`block max-w-40 truncate text-xs text-slate-500 ${user?.role ? "capitalize" : ""}`}>
                {user?.role ? formatRole(user.role) : user?.email ?? "Please log in"}
              </span>
            </span>
            <ChevronDown
              size={15}
              className={`hidden text-slate-400 transition-transform duration-200 sm:block ${userOpen ? "rotate-180" : ""}`}
              aria-hidden="true"
            />
          </button>

          {userOpen && (
            <div role="menu" className={`${popover} w-64`}>
              <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50/70 px-4 py-3.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-xs font-bold text-white">
                  {initials(user?.name)}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-slate-900">{user?.name ?? "Not signed in"}</span>
                  <span className="block truncate text-xs text-slate-500">{user?.email ?? "Please log in"}</span>
                </span>
              </div>

              <div className="p-1.5">
                {[
                  { label: "My profile", icon: UserRound, href: "/admin/tabs/settings" },
                  { label: "Settings", icon: Settings, href: "/admin/tabs/settings" },
                ].map(({ label, icon: Icon, href }) => (
                  <Link
                    key={label}
                    href={href}
                    role="menuitem"
                    onClick={() => setUserOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                  >
                    <Icon size={16} className="text-slate-400" />
                    {label}
                  </Link>
                ))}
              </div>

              <div className="border-t border-slate-100 p-1.5">
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50"
                >
                  <LogOut size={16} />
                  Log out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
