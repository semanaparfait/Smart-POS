"use client";

import React, { useMemo, useState, useEffect } from "react";
import useCompaniesStore from "@/stores/companies/companystore";
import {
  BadgeCheck,
  Building2,
  TriangleAlert,
  Clock9,
  Search,
  Plus,
  ListFilter,
  ArrowLeft,
} from "lucide-react";
import FetchCompany from "@/app/admin/tabs/companies/components/FetchCompany";
import AddCompany from "@/app/admin/tabs/companies/components/AddCompany";

const FilterableFetchCompany = FetchCompany as React.ComponentType<{
  search: string;
  status: string;
  industry: string;
}>;

export default function CompaniesPage() {
  const [activeView, setActiveView] = useState<"companies" | "add">("companies");
        const [searchQuery, setSearchQuery] = useState("");
        const [statusFilter, setStatusFilter] = useState("");
        const [industryFilter, setIndustryFilter] = useState("");

  const companies = useCompaniesStore((state) => state.companies) || [];
  const fetchCompanies = useCompaniesStore((state) => state.fetchCompanies);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  // Dynamic status counts derived from store
  const stats = useMemo(() => {
    const total = companies.length;
    const active = companies.filter(
      (c: any) => c.status?.toLowerCase() === "active"
    ).length;
    const pending = companies.filter(
      (c: any) => c.status?.toLowerCase() === "pending"
    ).length;
    const inactive = companies.filter(
      (c: any) => c.status?.toLowerCase() === "inactive"
    ).length;

    return [
      {
        name: "Total Companies",
        count: total,
        icon: Building2,
        color: "text-emerald-600 bg-emerald-50",
      },
      {
        name: "Active Companies",
        count: active,
        icon: BadgeCheck,
        color: "text-blue-600 bg-blue-50",
      },
      {
        name: "Pending Companies",
        count: pending,
        icon: Clock9,
        color: "text-amber-600 bg-amber-50",
      },
      {
        name: "Inactive Companies",
        count: inactive,
        icon: TriangleAlert,
        color: "text-rose-600 bg-rose-50",
      },
    ];
  }, [companies]);

  return (
    <main className="space-y-6">
      {/* Header & View Switcher */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            {activeView === "companies" ? "Companies" : "Register Company"}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {activeView === "companies"
              ? "Manage all registered businesses and store configurations on SmartPOS."
              : "Add a new merchant or business location to the platform."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeView === "add" ? (
            <button
              type="button"
              onClick={() => setActiveView("companies")}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-xs hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to List
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setActiveView("add")}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-emerald-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Company
            </button>
          )}
        </div>
      </div>

      {activeView === "companies" ? (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((item) => (
              <div
                key={item.name}
                className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-xs transition hover:shadow-sm"
              >
                <div className={`rounded-xl p-3 ${item.color}`}>
                  <item.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                    {item.name}
                  </p>
                  <p className="text-2xl font-bold tracking-tight text-gray-900 mt-0.5">
                    {item.count}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Controls: Search & Filters */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-white p-4 rounded-xl border border-gray-100 shadow-xs">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by company name, email, or phone..."
                className="w-full rounded-lg border border-gray-200 bg-gray-50/50 py-2 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs text-gray-400 mr-1 hidden sm:flex">
                <ListFilter className="h-3.5 w-3.5" />
                <span>Filters:</span>
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer"
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="inactive">Inactive</option>
              </select>

              <select
                value={industryFilter}
                onChange={(e) => setIndustryFilter(e.target.value)}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer"
              >
                <option value="">All Industries</option>
                <option value="restaurant">Restaurant</option>
                <option value="bar">Bar</option>
                <option value="hotel">Hotel</option>
                <option value="supermarket">Supermarket</option>
                <option value="pharmacy">Pharmacy</option>
                <option value="shop">Shop</option>
              </select>
            </div>
          </div>

          {/* Table / List View */}
          <div className="rounded-xl border border-gray-100 bg-white shadow-xs overflow-hidden">
            <FilterableFetchCompany
              search={searchQuery}
              status={statusFilter}
              industry={industryFilter}
            />
          </div>
        </>
      ) : (
        /* Create Form View */
        <AddCompany onSuccess={() => setActiveView("companies")} onCancel={() => setActiveView("companies")} />
      )}
    </main>
  );
}