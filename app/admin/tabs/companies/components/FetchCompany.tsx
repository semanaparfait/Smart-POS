"use client";

import React, { useMemo } from "react";
import useCompaniesStore from "@/stores/companies/companystore";
import {
  MapPin,
  Hotel,
  Wine,
  Utensils,
  Coffee,
  ShoppingBag,
  Pill,
  Store,
  Building2,
  ExternalLink,
  Edit2,
} from "lucide-react";
import Link from "next/link";

interface FetchCompanyProps {
  search?: string;
  status?: string;
  industry?: string;
}

const INDUSTRY_CONFIG: Record<
  string,
  { label: string; icon: React.ElementType; color: string; cover: string }
> = {
  HOTEL: {
    label: "Hotel",
    icon: Hotel,
    color: "text-blue-600 bg-blue-50",
    cover:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&auto=format&fit=crop&q=80",
  },
  BAR: {
    label: "Bar",
    icon: Wine,
    color: "text-amber-600 bg-amber-50",
    cover:
      "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400&auto=format&fit=crop&q=80",
  },
  RESTAURANT: {
    label: "Restaurant",
    icon: Utensils,
    color: "text-rose-600 bg-rose-50",
    cover:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&auto=format&fit=crop&q=80",
  },
  CAFE: {
    label: "Cafe",
    icon: Coffee,
    color: "text-purple-600 bg-purple-50",
    cover:
      "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&auto=format&fit=crop&q=80",
  },
  SUPERMARKET: {
    label: "Supermarket",
    icon: ShoppingBag,
    color: "text-emerald-600 bg-emerald-50",
    cover:
      "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=400&auto=format&fit=crop&q=80",
  },
  PHARMACY: {
    label: "Pharmacy",
    icon: Pill,
    color: "text-cyan-600 bg-cyan-50",
    cover:
      "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&auto=format&fit=crop&q=80",
  },
  SHOP: {
    label: "Shop",
    icon: Store,
    color: "text-indigo-600 bg-indigo-50",
    cover:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&auto=format&fit=crop&q=80",
  },
};

export default function FetchCompany({
  search = "",
  status = "",
  industry = "",
}: FetchCompanyProps) {
  const companies = useCompaniesStore((state: any) => state.companies) || [];
  const fetchCompanies = useCompaniesStore(
    (state: any) => state.fetchCompanies,
  );
  const fetchSingleCompany = useCompaniesStore(
    (state: any) => state.fetchSingleCompany,
  );

  React.useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  // Client-side filtering across text search, status, and industry
  const filteredCompanies = useMemo(() => {
    return companies.filter((company: any) => {
      const matchesSearch =
        !search ||
        company.name?.toLowerCase().includes(search.toLowerCase()) ||
        company.email?.toLowerCase().includes(search.toLowerCase()) ||
        company.location?.toLowerCase().includes(search.toLowerCase()) ||
        company.code?.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        !status || company.status?.toLowerCase() === status.toLowerCase();

      const matchesIndustry =
        !industry || company.type?.toLowerCase() === industry.toLowerCase();

      return matchesSearch && matchesStatus && matchesIndustry;
    });
  }, [companies, search, status, industry]);

  if (filteredCompanies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
          <Building2 className="h-6 w-6" />
        </div>
        <h3 className="mt-3 text-sm font-semibold text-gray-900">
          No companies found
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Try adjusting your search query or filter options.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 p-4 sm:grid-cols-2 lg:grid-cols-3">
      {filteredCompanies.map((company: any, index: number) => {
        const industryConfig = INDUSTRY_CONFIG[company.type] || {
          label: company.type || "Business",
          icon: Building2,
          color: "text-gray-600 bg-gray-100",
          cover:
            "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&auto=format&fit=crop&q=80",
        };

        const IconComponent = industryConfig.icon;

        return (
          <div
            key={company.id || index}
            className="group flex flex-col justify-between overflow-hidden rounded-xl border border-gray-100 bg-white p-5 shadow-xs transition-all duration-200 hover:shadow-md hover:border-gray-200"
          >
            <div>
              {/* Header: Logo, Name, ID & Status Badge */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {company.logo ? (
                    <img
                      src={company.logo}
                      alt={company.name}
                      className="h-12 w-12 shrink-0 rounded-xl object-cover border border-gray-100 shadow-2xs"
                    />
                  ) : (
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-base font-bold text-emerald-700 uppercase border border-emerald-100">
                      {company.name ? company.name.charAt(0) : "C"}
                    </div>
                  )}

                  <div className="min-w-0">
                    <h2 className="text-base font-semibold text-gray-900 truncate">
                      {company.name}
                    </h2>
                    <p className="text-xs text-gray-400 font-mono">
                      {company.code ||
                        `COMP-${String(index + 1).padStart(3, "0")}`}
                    </p>
                  </div>
                </div>

                <span className="inline-flex shrink-0 items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                  {company.status || "Active"}
                </span>
              </div>

              {/* Business Category and Cover Photo */}
              <div className="mt-4 flex items-center justify-between gap-3 rounded-lg bg-gray-50/70 p-3 border border-gray-100/80">
                <div className="flex flex-col gap-1.5 min-w-0">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-gray-700">
                    <div className={`p-1 rounded-md ${industryConfig.color}`}>
                      <IconComponent className="h-3.5 w-3.5" />
                    </div>
                    <span className="capitalize">{industryConfig.label}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-gray-500 truncate">
                    <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                    <span className="truncate">
                      {company.location || "Not specified"}
                    </span>
                  </div>
                </div>

                <img
                  src={industryConfig.cover}
                  alt={industryConfig.label}
                  className="h-12 w-14 rounded-lg object-cover border border-gray-200 shadow-2xs shrink-0"
                />
              </div>

              {/* Metrics Grid */}
              <div className="mt-4 grid grid-cols-4 gap-2 border-y border-gray-100 py-3 text-center">
                <div>
                  <p className="text-sm font-bold text-gray-900">
                    {company.branchesCount ?? 3}
                  </p>
                  <p className="text-[11px] text-gray-400">Branches</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">
                    {company.devicesCount ?? 12}
                  </p>
                  <p className="text-[11px] text-gray-400">Devices</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">
                    {company.usersCount ?? 3}
                  </p>
                  <p className="text-[11px] text-gray-400">Users</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-emerald-600">
                    {company.revenueFormatted ?? "50M"}
                  </p>
                  <p className="text-[11px] text-gray-400">RWF (30d)</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            {/* Actions */}
            <div className="mt-4 flex items-center gap-2">
              <button
                type="button"
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50 hover:text-gray-900"
              >
                <Edit2 className="h-3.5 w-3.5" />
                Edit
              </button>

              {/* Dynamic Link to the single company detail page */}
              <Link
                href={`/admin/tabs/companies/${company.id}`}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white shadow-2xs transition-colors hover:bg-emerald-700 active:bg-emerald-800"
              >
                <span>View Details</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
