"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import useCompaniesStore from "@/stores/companies/companystore";
import { CompanyKind, type CompanyType } from "@/stores/companies/companyTypes";
import {
  ArrowLeft,
  Building2,
  CalendarPlus,
  LayoutGrid,
  List,
  MapPin,
  Plus,
  RotateCw,
  Search,
  Shapes,
  X,
} from "lucide-react";
import FetchCompany, { CompanySkeleton, industryOf } from "@/app/admin/tabs/companies/components/FetchCompany";
import AddCompany from "@/app/admin/tabs/companies/components/AddCompany";

type SortKey = "newest" | "oldest" | "name";
type LoadState = "loading" | "ready" | "error";

const time = (c: CompanyType) => new Date(c.createdAt).getTime() || 0;

export default function CompaniesPage() {
  const [activeView, setActiveView] = useState<"companies" | "add">("companies");
  const [layout, setLayout] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [industry, setIndustry] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");
  const [loadState, setLoadState] = useState<LoadState>("loading");

  const companies = useCompaniesStore((state) => state.companies);
  const fetchCompanies = useCompaniesStore((state) => state.fetchCompanies);

  const request = useCallback(
    () =>
      fetchCompanies()
        .then(() => setLoadState("ready"))
        .catch(() => setLoadState("error")),
    [fetchCompanies],
  );

  // Initial state is already "loading"
  useEffect(() => {
    request();
  }, [request]);

  const load = () => {
    setLoadState("loading");
    request();
  };

  // Figures computed from the data the API returns
  const stats = useMemo(() => {
    const now = new Date();
    const thisMonth = companies.filter((c) => {
      const d = new Date(c.createdAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
    const industries = new Set(companies.map((c) => c.type?.toUpperCase()).filter(Boolean)).size;
    const locations = new Set(companies.map((c) => c.location?.trim().toLowerCase()).filter(Boolean)).size;

    return [
      { label: "Total companies", value: companies.length, icon: Building2 },
      { label: "New this month", value: thisMonth, icon: CalendarPlus },
      { label: "Industries", value: industries, icon: Shapes },
      { label: "Locations", value: locations, icon: MapPin },
    ];
  }, [companies]);

  // Industry chips: every industry the backend supports, plus any other type found in the data
  const industryChips = useMemo(() => {
    const counts = new Map<string, number>();
    companies.forEach((c) => {
      const key = c.type?.toUpperCase();
      if (key) counts.set(key, (counts.get(key) ?? 0) + 1);
    });
    const keys = new Set<string>([...Object.values(CompanyKind), ...counts.keys()]);
    return [...keys].map((key) => ({ key, label: industryOf(key).label, count: counts.get(key) ?? 0 }));
  }, [companies]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = companies.filter((c) => {
      const matchesSearch =
        !q ||
        [c.name, c.email, c.location, c.code, c.phone_number && String(c.phone_number)].some((field) =>
          field?.toString().toLowerCase().includes(q),
        );
      const matchesIndustry = !industry || c.type?.toUpperCase() === industry;
      return matchesSearch && matchesIndustry;
    });

    return filtered.sort((a, b) =>
      sort === "name" ? (a.name ?? "").localeCompare(b.name ?? "") : sort === "newest" ? time(b) - time(a) : time(a) - time(b),
    );
  }, [companies, search, industry, sort]);

  const hasFilters = Boolean(search || industry);
  const clearFilters = () => {
    setSearch("");
    setIndustry("");
  };

  if (activeView === "add") {
    return (
      <main className="space-y-6">
        <header className="flex flex-col gap-4 border-b border-slate-200/80 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-[-0.02em] text-slate-900">Register company</h1>
            <p className="mt-1 text-sm text-slate-500">Add a new business to the SmartPOS platform.</p>
          </div>
          <button
            type="button"
            onClick={() => setActiveView("companies")}
            className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 ring-1 ring-inset ring-slate-200 transition-colors hover:bg-slate-50 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to companies
          </button>
        </header>
        <AddCompany
          onSuccess={() => {
            setActiveView("companies");
            load();
          }}
          onCancel={() => setActiveView("companies")}
        />
      </main>
    );
  }

  return (
    <main className="space-y-6">
      {/* Header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-[-0.02em] text-slate-900">Companies</h1>
          <p className="mt-1 text-sm text-slate-500">All businesses registered on SmartPOS.</p>
        </div>
        <button
          type="button"
          onClick={() => setActiveView("add")}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-slate-900/15 transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
        >
          <Plus className="h-4 w-4" />
          Add company
        </button>
      </header>

      {/* Summary */}
      <section className="grid grid-cols-2 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }, i) => (
          <div
            key={label}
            className={`flex items-center justify-between gap-3 p-5 ${i % 2 === 1 ? "border-l border-slate-100" : ""} ${
              i >= 2 ? "border-t border-slate-100 lg:border-t-0" : ""
            } ${i === 2 ? "lg:border-l" : ""}`}
          >
            <div>
              <p className="text-xs font-semibold text-slate-500">{label}</p>
              <p className="mt-1 text-2xl font-bold tracking-[-0.02em] text-slate-900 tabular-nums">
                {loadState === "loading" ? <span className="inline-block h-7 w-10 animate-pulse rounded bg-slate-100 align-middle" /> : value}
              </p>
            </div>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
              <Icon className="h-5 w-5" />
            </span>
          </div>
        ))}
      </section>

      {/* Toolbar */}
      <section className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, code, email, phone or location..."
              aria-label="Search companies"
              className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="sr-only" htmlFor="company-sort">Sort companies</label>
            <select
              id="company-sort"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="h-10 cursor-pointer rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition hover:border-slate-300 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="name">Name A–Z</option>
            </select>

            <div className="flex h-10 items-center rounded-lg bg-slate-100 p-1" role="group" aria-label="Layout">
              {([
                { key: "grid", icon: LayoutGrid, label: "Grid view" },
                { key: "list", icon: List, label: "List view" },
              ] as const).map(({ key, icon: Icon, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setLayout(key)}
                  aria-pressed={layout === key}
                  aria-label={label}
                  title={label}
                  className={`flex h-8 w-9 items-center justify-center rounded-md transition-all ${
                    layout === key ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-700"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Industry chips */}
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by industry">
          {[{ key: "", label: "All", count: companies.length }, ...industryChips].map((chip) => {
            const active = industry === chip.key;
            return (
              <button
                key={chip.key || "all"}
                type="button"
                onClick={() => setIndustry(chip.key)}
                aria-pressed={active}
                className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors ${
                  active
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-white text-slate-600 ring-1 ring-inset ring-slate-200 hover:text-slate-900 hover:ring-slate-300"
                }`}
              >
                {chip.label}
                <span
                  className={`rounded-full px-1.5 text-[11px] tabular-nums ${
                    active ? "bg-white/15 text-white" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {chip.count}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Results */}
      <section aria-live="polite">
        {loadState === "ready" && companies.length > 0 && (
          <div className="mb-3 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing <span className="font-semibold text-slate-900">{visible.length}</span> of {companies.length}{" "}
              {companies.length === 1 ? "company" : "companies"}
            </span>
            {hasFilters && (
              <button type="button" onClick={clearFilters} className="inline-flex items-center gap-1 font-semibold text-slate-600 hover:text-slate-900">
                <X className="h-3.5 w-3.5" />
                Clear filters
              </button>
            )}
          </div>
        )}

        {loadState === "loading" && <CompanySkeleton />}

        {loadState === "error" && (
          <EmptyState
            title="Couldn't load companies"
            text="Check your connection or sign in again, then try once more."
            action={
              <button
                type="button"
                onClick={load}
                className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                <RotateCw className="h-4 w-4" />
                Try again
              </button>
            }
          />
        )}

        {loadState === "ready" && companies.length === 0 && (
          <EmptyState
            title="No companies yet"
            text="Register the first business to start managing it on SmartPOS."
            action={
              <button
                type="button"
                onClick={() => setActiveView("add")}
                className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                <Plus className="h-4 w-4" />
                Add company
              </button>
            }
          />
        )}

        {loadState === "ready" && companies.length > 0 && visible.length === 0 && (
          <EmptyState
            title="No matching companies"
            text="Try a different search or industry."
            action={
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-inset ring-slate-200 hover:bg-slate-50"
              >
                <X className="h-4 w-4" />
                Clear filters
              </button>
            }
          />
        )}

        {loadState === "ready" && visible.length > 0 && <FetchCompany companies={visible} view={layout} />}
      </section>
    </main>
  );
}

function EmptyState({ title, text, action }: { title: string; text: string; action: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
        <Building2 className="h-6 w-6" />
      </span>
      <h2 className="mt-4 text-sm font-bold text-slate-900">{title}</h2>
      <p className="mt-1 max-w-sm text-sm text-slate-500">{text}</p>
      <div className="mt-5">{action}</div>
    </div>
  );
}
