"use client";

import { Bell, BellOff, Building2, CalendarDays, ChevronDown, ChevronRight, CreditCard, Inbox, KeyRound, LogOut, Monitor, Search, TrendingDown, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import useAuthStore from "@/stores/auth/authstore";
import { attentionOf, usePlatform } from "@/app/admin/components/Platform";

/** Readable names for admin URL segments */
const SECTION_NAMES: Record<string, string> = {
  companies: "Companies",
  devices: "Devices",
  users: "Users",
  employees: "Employees",
  inbox: "Inbox",
  profile: "My profile",
};

const DETAIL_NAMES: Record<string, string> = { new: "New", password: "Change password" };
const ACTION_NAMES: Record<string, string> = { edit: "Edit", plan: "Plan", payment: "Record payment" };

type Crumb = { label: string; href?: string };

/** "/admin/tabs/users/123" → Admin › Users › Details */
function getBreadcrumbs(pathname: string): Crumb[] {
  const [, , tabs, section, detail, action] = pathname.split("/");
  if (tabs !== "tabs" || !section) return [{ label: "Dashboard" }];

  const sectionLabel = SECTION_NAMES[section] ?? section.charAt(0).toUpperCase() + section.slice(1);
  if (!detail) return [{ label: sectionLabel }];
  const top = { label: sectionLabel, href: `/admin/tabs/${section}` };
  if (DETAIL_NAMES[detail]) return [top, { label: DETAIL_NAMES[detail] }];
  if (!action) return [top, { label: "Details" }];
  return [top, { label: "Details", href: `/admin/tabs/${section}/${detail}` }, { label: ACTION_NAMES[action] ?? action }];
}

const initials = (name?: string) =>
  (name ?? "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "SP";

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

const popover = "absolute right-0 top-[calc(100%+10px)] z-50 origin-top-right overflow-hidden rounded-xl border border-ink/12 bg-white shadow-2xl shadow-ink/10";

export default function TopNavBar() {
  const { user, fetchMe, logout } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();
  const crumbs = getBreadcrumbs(pathname);
  const { data } = usePlatform();
  const [now] = useState(() => Date.now());

  const searchRef = useRef<HTMLInputElement>(null);
  const searchBox = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const [bellOpen, setBellOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  useDismiss(bellRef, bellOpen, () => setBellOpen(false));
  useDismiss(userRef, userOpen, () => setUserOpen(false));
  useDismiss(searchBox, searchOpen, () => setSearchOpen(false));

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

  const attention = attentionOf(data, now);
  const alerts = [
    ...(data?.totals.newRequests
      ? [{ key: "inbox", icon: Inbox, text: `${data.totals.newRequests} new in the inbox: requests, messages or password help`, href: "/admin/tabs/inbox" }]
      : []),
    ...attention.overdue.map((c) => ({ key: `o-${c.id}`, icon: CreditCard, text: `${c.name}: subscription overdue`, href: `/admin/tabs/companies/${c.id}` })),
    ...attention.waitingDevices.map((c) => ({
      key: `w-${c.id}`,
      icon: Monitor,
      text: `${c.name}: ${c.waitingDevices} device${c.waitingDevices === 1 ? "" : "s"} waiting for approval`,
      href: "/admin/tabs/devices",
    })),
    ...attention.quiet.map((c) => ({ key: `q-${c.id}`, icon: TrendingDown, text: `${c.name}: no sales for over a week`, href: `/admin/tabs/companies/${c.id}` })),
  ];

  const q = query.trim().toLowerCase();
  const matches = q ? (data?.companies ?? []).filter((c) => [c.name, c.code, c.location].some((v) => v?.toLowerCase().includes(q))).slice(0, 6) : [];

  const go = (href: string) => {
    setSearchOpen(false);
    setQuery("");
    router.push(href);
  };

  const handleLogout = () => {
    logout();
    router.push("/pages/Login");
  };

  const iconButton =
    "relative flex h-10 w-10 items-center justify-center rounded-lg text-ink/60 ring-1 ring-inset ring-ink/12 transition-all hover:bg-ivory hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime";

  return (
    <header className="relative z-30 flex h-16 w-full shrink-0 items-center gap-6 border-b border-ink/10 bg-white px-4 sm:px-6 lg:px-8">
      <nav aria-label="Breadcrumb" className="hidden min-w-0 shrink-0 md:block">
        <ol className="flex items-center gap-1.5 text-[13px] font-medium text-ink/45">
          <li>
            <Link href="/admin" className="transition-colors hover:text-ink/80">
              Admin
            </Link>
          </li>
          {crumbs.map((crumb) => (
            <li key={crumb.label} className="flex items-center gap-1.5">
              <ChevronRight size={13} className="text-ink/25" aria-hidden="true" />
              {crumb.href ? (
                <Link href={crumb.href} className="transition-colors hover:text-ink/80">
                  {crumb.label}
                </Link>
              ) : (
                <span aria-current="page" className="font-semibold text-ink">
                  {crumb.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>

      {/* Find a company */}
      <div ref={searchBox} className="group relative ml-auto w-full max-w-md">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink/45 transition-colors group-focus-within:text-ink/80" />
        <input
          ref={searchRef}
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSearchOpen(true);
          }}
          onFocus={() => setSearchOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && matches[0]) go(`/admin/tabs/companies/${matches[0].id}`);
          }}
          placeholder="Find a company by name, code or place"
          aria-label="Find a company"
          className="h-10 w-full rounded-lg border border-ink/12 bg-ivory pl-9 pr-16 text-sm text-ink outline-none transition placeholder:text-ink/45 hover:border-ink/25 focus:border-ink/40 focus:bg-white focus:ring-4 focus:ring-lime/40"
        />
        <kbd className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 rounded-md border border-ink/12 bg-white px-1.5 py-0.5 font-sans text-[10px] font-semibold text-ink/45 shadow-xs sm:block">
          Ctrl K
        </kbd>
        {searchOpen && q && (
          <div className={`${popover} left-0 w-full`}>
            {matches.map((c) => (
              <button key={c.id} type="button" onClick={() => go(`/admin/tabs/companies/${c.id}`)} className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-ivory">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ink text-lime">
                  <Building2 size={15} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-ink">{c.name}</span>
                  <span className="block truncate text-xs text-ink/55">
                    {c.code} · {c.location || "No location"}
                    {c.active ? "" : " · Terminated"}
                  </span>
                </span>
              </button>
            ))}
            {!matches.length && <p className="px-4 py-3 text-sm text-ink/55">No company matches “{query.trim()}”.</p>}
          </div>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2.5">
        <span className="hidden h-10 items-center gap-2 rounded-lg px-3 text-xs font-semibold text-ink/60 ring-1 ring-inset ring-ink/12 xl:flex">
          <CalendarDays size={15} className="text-ink/45" aria-hidden="true" />
          {/* The date can differ between server and browser time zones */}
          <span suppressHydrationWarning>{new Date().toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}</span>
        </span>

        {/* Things to look at */}
        <div ref={bellRef} className="relative">
          <button
            type="button"
            aria-label={`Notifications, ${alerts.length} to look at`}
            aria-expanded={bellOpen}
            aria-haspopup="dialog"
            onClick={() => {
              setBellOpen((v) => !v);
              setUserOpen(false);
            }}
            className={`${iconButton} ${bellOpen ? "bg-ivory text-ink ring-ink/25" : ""}`}
          >
            <Bell size={18} />
            {alerts.length > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-ink px-1 text-[10px] font-semibold text-lime ring-2 ring-white">{alerts.length}</span>
            )}
          </button>

          {bellOpen && (
            <div role="dialog" aria-label="Notifications" className={`${popover} w-96`}>
              <div className="flex items-center justify-between border-b border-ink/6 px-4 py-3">
                <p className="text-sm font-bold text-ink">Notifications</p>
                <span className="rounded-full bg-ink/6 px-2 py-0.5 text-[10px] font-semibold text-ink/60">{alerts.length} to look at</span>
              </div>
              {alerts.length ? (
                <ul className="max-h-80 divide-y divide-ink/6 overflow-y-auto">
                  {alerts.map(({ key, icon: Icon, text, href }) => (
                    <li key={key}>
                      <Link href={href} onClick={() => setBellOpen(false)} className="flex items-start gap-3 px-4 py-3 text-sm text-ink/80 hover:bg-ivory">
                        <Icon size={16} className="mt-0.5 shrink-0 text-ink/50" />
                        {text}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex flex-col items-center px-6 py-9 text-center">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-ink/6 text-ink/45">
                    <BellOff size={20} />
                  </span>
                  <p className="mt-3 text-sm font-semibold text-ink">You&apos;re all caught up</p>
                  <p className="mt-1 text-xs leading-relaxed text-ink/60">Devices waiting for approval and companies that stopped selling show here.</p>
                </div>
              )}
            </div>
          )}
        </div>

        <span className="mx-1 h-8 w-px bg-ink/12" aria-hidden="true" />

        {/* Account */}
        <div ref={userRef} className="relative">
          <button
            type="button"
            aria-haspopup="menu"
            aria-expanded={userOpen}
            onClick={() => {
              setUserOpen((v) => !v);
              setBellOpen(false);
            }}
            className={`flex items-center gap-3 rounded-xl py-1 pl-1 pr-2.5 text-left transition-colors hover:bg-ivory focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime ${userOpen ? "bg-ivory" : ""}`}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ink text-xs font-bold tracking-wide text-lime">{initials(user?.name)}</span>
            <span className="hidden min-w-0 leading-tight sm:block">
              <span className="block max-w-40 truncate text-sm font-semibold text-ink">{user?.name ?? "Not signed in"}</span>
              <span className="block max-w-40 truncate text-xs text-ink/60">Super admin</span>
            </span>
            <ChevronDown size={15} className={`hidden text-ink/45 transition-transform duration-200 sm:block ${userOpen ? "rotate-180" : ""}`} aria-hidden="true" />
          </button>

          {userOpen && (
            <div role="menu" className={`${popover} w-64`}>
              <div className="flex items-center gap-3 border-b border-ink/6 bg-ivory/70 px-4 py-3.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-ink text-xs font-bold text-lime">{initials(user?.name)}</span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-ink">{user?.name ?? "Not signed in"}</span>
                  <span className="block truncate text-xs text-ink/60">{user?.email ?? "Please log in"}</span>
                </span>
              </div>
              <div className="border-b border-ink/6 p-1.5">
                {[
                  { label: "My profile", icon: UserRound, href: "/admin/tabs/profile" },
                  { label: "Change password", icon: KeyRound, href: "/admin/tabs/profile/password" },
                ].map(({ label, icon: Icon, href }) => (
                  <Link
                    key={href}
                    href={href}
                    role="menuitem"
                    onClick={() => setUserOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-ink/70 transition-colors hover:bg-ivory hover:text-ink"
                  >
                    <Icon size={16} className="text-ink/45" />
                    {label}
                  </Link>
                ))}
              </div>
              <div className="p-1.5">
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
