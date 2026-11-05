"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BedDouble, Bike, ChevronDown, LayoutDashboard, LogOut, Menu, Package, Settings, Trophy, Users, Wallet, X, type LucideIcon } from "lucide-react";
import { LogoMark } from "@/app/components/Logo";
import useAuthStore from "@/stores/auth/authstore";
import { Avatar } from "@/app/owner/components/ui";
import BookingAlerts from "@/app/owner/bookings/BookingAlerts";

type Extra = "services" | "delivery" | "kitchen";
// `ridersOnly`: shown when the company has its own riders.
type SubItem = { label: string; href: string; extra?: Extra; ridersOnly?: boolean };
// A link has an href; a group has children instead, like the app's menu.
type NavItem = { label: string; icon: LucideIcon; href?: string; children?: SubItem[]; extra?: Extra };

// The same menu as the SmartPOS app. Pages of an extra show only when SmartPOS
// turned it on for the company.
const SECTIONS: { title: string; items: NavItem[] }[] = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", href: "/owner", icon: LayoutDashboard },
      { label: "Winner", href: "/owner/winner", icon: Trophy },
    ],
  },
  {
    title: "Management",
    items: [
      {
        label: "Inventory",
        icon: Package,
        children: [
          { label: "Stock levels", href: "/owner/inventory" },
          { label: "Ingredients", href: "/owner/inventory/ingredients" },
          { label: "Usage & losses", href: "/owner/inventory/usage" },
          { label: "Stock count", href: "/owner/inventory/count" },
          { label: "Orders", href: "/owner/orders" },
          { label: "Categories", href: "/owner/products/categories" },
          { label: "Products", href: "/owner/products" },
          { label: "Low stock & expiry", href: "/owner/inventory/low-stock" },
          { label: "Activity logs", href: "/owner/inventory/activity" },
        ],
      },
      {
        label: "Services",
        icon: BedDouble,
        extra: "services",
        children: [
          { label: "Bookings", href: "/owner/bookings" },
          { label: "What you offer", href: "/owner/services" },
        ],
      },
      {
        label: "Deliveries",
        icon: Bike,
        extra: "delivery",
        children: [
          { label: "All deliveries", href: "/owner/deliveries" },
          { label: "Riders", href: "/owner/deliveries/riders", ridersOnly: true },
        ],
      },
      { label: "Workers", href: "/owner/workers", icon: Users },
      {
        label: "Finance",
        icon: Wallet,
        children: [
          { label: "Overview", href: "/owner/finance" },
          { label: "Verification", href: "/owner/money-checks" },
          { label: "Money summary", href: "/owner/finance/summary" },
          { label: "Close the day", href: "/owner/close-day" },
          { label: "Service money", href: "/owner/finance/service-money", extra: "services" },
          { label: "Expenses", href: "/owner/expenses" },
          { label: "Salaries & debts", href: "/owner/salaries" },
          { label: "Credits", href: "/owner/finance/credits" },
        ],
      },
    ],
  },
  {
    title: "System",
    items: [
      {
        label: "Settings",
        icon: Settings,
        children: [
          { label: "Device information", href: "/owner/devices" },
          { label: "Company settings", href: "/owner/settings/details" },
          { label: "Delivery", href: "/owner/settings/delivery", extra: "delivery" },
          { label: "Kitchen", href: "/owner/settings/kitchen", extra: "kitchen" },
          { label: "Profile", href: "/owner/company" },
          { label: "Change password", href: "/owner/settings/password" },
        ],
      },
    ],
  },
];

const LINKS: SubItem[] = SECTIONS.flatMap((s) => s.items.flatMap((i) => (i.children ? i.children : [{ label: i.label, href: i.href! }])));

const matches = (pathname: string, href: string) =>
  href === "/owner" ? pathname === "/owner" : pathname === href || pathname.startsWith(`${href}/`);

// The most specific link for the page, so /owner/products/categories picks
// Categories rather than Products.
const currentLink = (pathname: string) =>
  LINKS.filter((l) => matches(pathname, l.href)).sort((a, b) => b.href.length - a.href.length)[0] ??
  // A product's history lives under Stock levels.
  (pathname.startsWith("/owner/inventory/") ? LINKS.find((l) => l.href === "/owner/inventory") : undefined);

// The owner's frame: navigation on the left (a drawer on phones), the company
// and the account on top.
export default function OwnerShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [menuOpen, setMenuOpen] = useState(false);

  const signOut = () => {
    logout();
    router.replace("/pages/Login");
  };

  const company = user?.company;
  const current = currentLink(pathname);
  // A server from before extras existed sends none: everything is on there.
  const extraOn = (extra?: Extra) => !extra || company?.features?.[extra] !== false;
  // Groups open by hand; the one holding this page is always open.
  const [opened, setOpened] = useState<string[]>([]);

  const item = ({ label, href, icon: Icon, children: all }: NavItem) => {
    const children = all?.filter((c) => extraOn(c.extra) && (!c.ridersOnly || !!company?.deliveryRiders));
    if (children) {
      const holdsPage = children.some((c) => c.href === current?.href);
      const open = holdsPage || opened.includes(label);
      return (
        <div key={label}>
          <button
            type="button"
            onClick={() => setOpened((list) => (list.includes(label) ? list.filter((l) => l !== label) : [...list, label]))}
            aria-expanded={open}
            className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
              holdsPage ? "text-white" : "text-white/70 hover:bg-white/8 hover:text-white"
            }`}
          >
            <Icon className={`h-4.5 w-4.5 ${holdsPage ? "text-lime" : "text-white/45 group-hover:text-lime"}`} />
            <span className="flex-1 text-left">{label}</span>
            <ChevronDown className={`h-4 w-4 text-white/40 transition-transform ${open ? "rotate-180" : ""}`} />
          </button>
          {open && (
            <div className="mb-1 ml-5 mt-0.5 flex flex-col gap-0.5 border-l border-white/10 pl-3">
              {children.map((c) => {
                const active = c.href === current?.href;
                return (
                  <Link
                    key={c.href}
                    href={c.href}
                    onClick={() => setMenuOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={`rounded-lg px-3 py-2 text-[13px] font-semibold transition-colors ${active ? "bg-lime text-ink" : "text-white/60 hover:bg-white/8 hover:text-white"}`}
                  >
                    {c.label}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      );
    }
    const active = href === current?.href;
    return (
      <Link
        key={href}
        href={href!}
        // On phones, opening a page closes the drawer.
        onClick={() => setMenuOpen(false)}
        aria-current={active ? "page" : undefined}
        className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
          active ? "bg-lime text-ink" : "text-white/70 hover:bg-white/8 hover:text-white"
        }`}
      >
        <Icon className={`h-4.5 w-4.5 ${active ? "text-ink" : "text-white/45 group-hover:text-lime"}`} />
        {label}
      </Link>
    );
  };

  const nav = (
    <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3">
      {SECTIONS.map((section) => (
        <div key={section.title} className="mb-3">
          <p className="px-3 pb-1.5 pt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white/35">{section.title}</p>
          <div className="flex flex-col gap-0.5">{section.items.filter((i) => extraOn(i.extra)).map(item)}</div>
        </div>
      ))}
    </nav>
  );

  const sidebar = (
    <div className="flex h-full w-64 flex-col bg-ink py-5">
      <Link href="/owner" className="mb-6 flex items-center gap-2.5 px-6">
        <LogoMark tone="dark" className="h-8 w-8" />
        <span className="text-lg font-extrabold tracking-tight text-white">
          Smart<span className="text-lime">POS</span>
        </span>
      </Link>

      {company && (
        <div className="mx-3 mb-5 flex items-center gap-3 rounded-2xl bg-white/6 p-3 ring-1 ring-inset ring-white/10">
          <Avatar name={company.name} src={company.logo} size={38} />
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-white">{company.name}</p>
            <p className="truncate text-[11px] text-white/45">{company.location || "Your business"}</p>
          </div>
        </div>
      )}

      {nav}

      <div className="mx-3 mt-4 rounded-2xl bg-white/6 p-4 ring-1 ring-inset ring-white/10">
        <p className="text-xs font-bold text-white">Selling, kitchen and riders</p>
        <p className="mt-1 text-[11px] leading-4 text-white/50">
          Day-to-day work happens in the SmartPOS app on your tills and phones.
        </p>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-ivory text-ink">
      <aside className="hidden shrink-0 lg:block">{sidebar}</aside>

      {menuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="relative">{sidebar}</div>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
            className="flex-1 bg-ink/50"
          />
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
            className="absolute left-52 top-5 flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center gap-3 border-b border-ink/8 bg-white/80 px-4 backdrop-blur md:px-8">
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setMenuOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-ink ring-1 ring-inset ring-ink/12 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-ink">{current?.label ?? "Owner"}</p>
            <p className="truncate text-xs text-ink/50">{company?.name}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-ink">{user?.name}</p>
              <p className="text-[11px] text-ink/50">Owner</p>
            </div>
            <Avatar name={user?.name} src={user?.picture?.thumbnailUrl ?? user?.picture?.url} size={36} />
            <button
              type="button"
              onClick={signOut}
              className="inline-flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-ink/70 ring-1 ring-inset ring-ink/12 transition-colors hover:bg-ink hover:text-lime"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">{children}</div>
        </main>
        {extraOn("services") && <BookingAlerts />}
      </div>
    </div>
  );
}
