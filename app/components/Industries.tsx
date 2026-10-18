"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Bed,
  Building2,
  Check,
  Pill,
  ShoppingCart,
  Store,
  Utensils,
  Wine,
  type LucideIcon,
} from "lucide-react";

type Industry = {
  id: string;
  name: string;
  short: string; // used in "Get SmartPOS for your …"
  icon: LucideIcon;
  headline: string;
  summary: string;
  tools: string[];
  workflow: string[];
};

// Tools listed here are limited to features SmartPOS presents in the Features section.
const industries: Industry[] = [
  {
    id: "restaurants",
    name: "Restaurants",
    short: "restaurant",
    icon: Utensils,
    headline: "From the first order to the final bill.",
    summary:
      "Take orders at the table, send them straight to the kitchen and close every bill without the paper chase.",
    tools: [
      "Table & floor management",
      "Kitchen display system (KDS)",
      "Fast, flexible checkout",
      "Ingredient stock & low-stock alerts",
    ],
    workflow: ["Seat", "Order", "Kitchen", "Pay"],
  },
  {
    id: "bars",
    name: "Bars",
    short: "bar",
    icon: Wine,
    headline: "Busy nights, accurate tabs.",
    summary:
      "Keep tabs open per table, serve quickly at peak hours and know exactly what was poured and sold.",
    tools: [
      "Open tabs per table or guest",
      "Quick checkout at the counter",
      "Drink stock tracking & alerts",
      "Staff roles and shift tracking",
    ],
    workflow: ["Open tab", "Serve", "Track stock", "Close"],
  },
  {
    id: "hotels",
    name: "Hotels & Motels",
    short: "hotel",
    icon: Bed,
    headline: "Every outlet in one picture.",
    summary:
      "Run the restaurant, bar and other service points of your property from one system and one set of reports.",
    tools: [
      "Restaurant & bar ordering",
      "Employee roles, payroll & attendance",
      "Expense control across departments",
      "Reports across all service points",
    ],
    workflow: ["Order", "Serve", "Bill", "Report"],
  },
  {
    id: "supermarkets",
    name: "Supermarkets",
    short: "supermarket",
    icon: ShoppingCart,
    headline: "Fast tills. Full shelves.",
    summary:
      "Move long queues quickly and keep thousands of products under control with clear stock levels.",
    tools: [
      "Fast checkout for high volume",
      "Inventory tracking across products",
      "Low-stock alerts before shelves empty",
      "Daily sales & product reports",
    ],
    workflow: ["Scan", "Pay", "Restock", "Review"],
  },
  {
    id: "pharmacies",
    name: "Pharmacies",
    short: "pharmacy",
    icon: Pill,
    headline: "Know every item on every shelf.",
    summary:
      "Keep precise stock records, serve customers quickly and see which products move and which need reordering.",
    tools: [
      "Precise inventory tracking",
      "Low-stock alerts for key items",
      "Quick counter checkout",
      "Sales and stock reports",
    ],
    workflow: ["Stock", "Sell", "Alert", "Reorder"],
  },
  {
    id: "retail",
    name: "Shops & Retail",
    short: "shop",
    icon: Store,
    headline: "Simple enough for one counter.",
    summary:
      "Start with a single device and a clear view of sales, stock and expenses, then grow from there.",
    tools: [
      "Easy sales & checkout",
      "Stock tracking with alerts",
      "Expense management",
      "Clear daily reports",
    ],
    workflow: ["Sell", "Track", "Spend wisely", "Grow"],
  },
  {
    id: "multi-site",
    name: "Malls & Multi-branch",
    short: "business",
    icon: Building2,
    headline: "Many locations. One clear view.",
    summary:
      "Manage several branches or outlets and compare how each one performs from a single account.",
    tools: [
      "Multiple locations",
      "Central staff & role management",
      "Advanced analytics",
      "Consolidated reporting",
    ],
    workflow: ["Branches", "Staff", "Sales", "Compare"],
  },
];

export default function Industries() {
  const [activeIndex, setActiveIndex] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const active = industries[activeIndex];
  const ActiveIcon = active.icon;

  // Arrow keys / Home / End move between tabs (WAI-ARIA tabs pattern)
  const onTabKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    const last = industries.length - 1;
    const keyMap: Record<string, number> = {
      ArrowDown: activeIndex === last ? 0 : activeIndex + 1,
      ArrowRight: activeIndex === last ? 0 : activeIndex + 1,
      ArrowUp: activeIndex === 0 ? last : activeIndex - 1,
      ArrowLeft: activeIndex === 0 ? last : activeIndex - 1,
      Home: 0,
      End: last,
    };
    const next = keyMap[e.key];
    if (next === undefined) return;
    e.preventDefault();
    setActiveIndex(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <section
      id="industries"
      aria-labelledby="industries-heading"
      className="scroll-mt-20 px-6 bg-white py-20 lg:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ===== Header ===== */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.28em] text-ink/60 sm:text-xs">
              <span
                className="h-2 w-2 bg-lime ring-1 ring-ink/20"
                aria-hidden="true"
              />
              Industries
            </p>
            <h2
              id="industries-heading"
              className="mt-5 text-[clamp(2rem,4vw,3.25rem)] font-extrabold leading-[1.05] tracking-[-0.03em] text-ink"
            >
              Built around the way
              <br className="hidden sm:block" /> your business runs.
            </h2>
          </div>
          <p className="max-w-md text-base leading-relaxed text-ink/70 sm:text-lg lg:col-span-5 lg:justify-self-end">
            From small shops to large restaurants, SmartPOS fits your needs.
            Choose your business to see what it covers.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 border-t border-ink/15 pt-10 lg:mt-14 lg:grid-cols-12 lg:gap-10">
          {/* ===== Industry list (tabs) ===== */}
          <div
            role="tablist"
            aria-label="Industries"
            aria-orientation="vertical"
            className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:-mx-6 sm:px-6 lg:col-span-5 lg:mx-0 lg:flex-col lg:gap-0 lg:overflow-visible lg:px-0 lg:pb-0"
          >
            {industries.map((industry, i) => {
              const Icon = industry.icon;
              const selected = i === activeIndex;
              return (
                <button
                  key={industry.id}
                  ref={(el) => {
                    tabRefs.current[i] = el;
                  }}
                  type="button"
                  role="tab"
                  id={`industry-tab-${industry.id}`}
                  aria-selected={selected}
                  aria-controls="industry-panel"
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setActiveIndex(i)}
                  onKeyDown={onTabKeyDown}
                  className={`group relative flex shrink-0 items-center gap-3 rounded-full px-4 py-2.5 text-left text-sm font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-lime/60
                    lg:rounded-none lg:border-b lg:border-ink/10 lg:px-0 lg:py-5 lg:text-lg
                    ${
                      selected
                        ? "bg-ink text-white lg:bg-transparent lg:text-ink"
                        : "bg-ivory text-ink/70 hover:text-ink lg:bg-transparent lg:text-ink/45"
                    }`}
                >
                  {/* Active marker (desktop) */}
                  <span
                    aria-hidden="true"
                    className={`absolute -left-4 top-1/2 hidden h-8 w-1 -translate-y-1/2 bg-lime transition-opacity duration-200 lg:block ${
                      selected ? "opacity-100" : "opacity-0"
                    }`}
                  />
                  <span className="hidden w-8 text-xs font-bold tabular-nums text-ink/35 lg:inline">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    className={`hidden h-10 w-10 items-center justify-center rounded-lg transition-colors duration-200 lg:flex ${
                      selected
                        ? "bg-ink text-lime"
                        : "bg-ivory text-ink/50 group-hover:text-ink"
                    }`}
                  >
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span
                    className={`lg:flex-1 ${selected ? "lg:font-extrabold" : ""}`}
                  >
                    {industry.name}
                  </span>
                  <ArrowRight
                    aria-hidden="true"
                    className={`hidden h-5 w-5 transition-all duration-200 lg:block ${
                      selected
                        ? "translate-x-0 text-ink opacity-100"
                        : "-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-40"
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* ===== Detail panel ===== */}
          <div
            role="tabpanel"
            id="industry-panel"
            aria-labelledby={`industry-tab-${active.id}`}
            className="relative overflow-hidden rounded-xl bg-ink text-white lg:col-span-7 lg:row-span-2"
          >
            <div
              key={active.id}
              className="hero-rise flex h-full flex-col p-6 sm:p-10"
            >
              <div className="flex items-start justify-between gap-6">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-lime">
                    For {active.name.toLowerCase()}
                  </p>
                  <h3 className="mt-3 text-2xl font-extrabold leading-tight tracking-[-0.02em] sm:text-[2rem]">
                    {active.headline}
                  </h3>
                </div>
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-lime text-ink">
                  <ActiveIcon className="h-7 w-7" aria-hidden="true" />
                </span>
              </div>

              <p className="mt-5 max-w-xl text-base leading-relaxed text-white/70">
                {active.summary}
              </p>

              <ul className="mt-8 grid grid-cols-1 gap-x-8 border-t border-white/10 sm:grid-cols-2">
                {active.tools.map((tool) => (
                  <li
                    key={tool}
                    className="flex items-center gap-3 border-b border-white/10 py-4 text-sm font-semibold text-white/90"
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-sm bg-lime/15 text-lime">
                      <Check
                        className="h-3.5 w-3.5"
                        strokeWidth={3}
                        aria-hidden="true"
                      />
                    </span>
                    {tool}
                  </li>
                ))}
              </ul>

              {/* Workflow strip */}
              <div className="mt-8">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">
                  A typical day
                </p>
                <ol className="mt-3 flex flex-wrap items-center gap-2 text-xs font-bold">
                  {active.workflow.map((step, i) => (
                    <li key={step} className="flex items-center gap-2">
                      <span className="rounded-md bg-white/5 px-3 py-1.5 text-white/85 ring-1 ring-inset ring-white/10">
                        {step}
                      </span>
                      {i < active.workflow.length - 1 && (
                        <ArrowRight
                          className="h-3.5 w-3.5 text-white/30"
                          aria-hidden="true"
                        />
                      )}
                    </li>
                  ))}
                </ol>
              </div>

              <div className="mt-auto flex flex-col gap-3 pt-10 sm:flex-row sm:items-center sm:justify-between">
                <Link
                  href="/request-installation"
                  className="group inline-flex items-center justify-center gap-2 rounded-md bg-lime px-5 py-3 text-sm font-bold text-ink transition-colors hover:bg-lime-dark focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-lime/40"
                >
                  Get SmartPOS for your {active.short}
                  <ArrowRight
                    className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </Link>
                <a
                  href="#features"
                  className="text-sm font-semibold text-white/60 underline decoration-white/25 underline-offset-4 transition-colors hover:text-white hover:decoration-lime"
                >
                  See all features
                </a>
              </div>
            </div>
          </div>

          {/* ===== "Don't see your business?" tile ===== */}
          <Link
            href="/contact"
            className="group flex min-h-44 flex-col justify-between rounded-xl bg-lime p-6 text-ink transition-colors duration-200 hover:bg-lime-dark focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ink/25 lg:col-span-5"
          >
            <ArrowUpRight
              className="h-6 w-6 self-end transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              aria-hidden="true"
            />
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-lg font-extrabold leading-tight sm:text-xl">Don&apos;t see your business?</p>
                <p className="mt-1 text-sm font-medium text-ink/70">SmartPOS adapts to how you work.</p>
              </div>
              <span className="hidden items-center gap-1.5 text-sm font-bold sm:inline-flex">
                Talk to us <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </span>
            </div>
          </Link>
        </div>
       </div>
    </section>
  );
}
