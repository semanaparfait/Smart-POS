"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import useCompaniesStore from "@/stores/companies/companystore";
import { CompanyTypeResponse } from "@/stores/companies/companyTypes";
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Hash,
  ShoppingBag,
  ArrowLeft,
  Copy,
  Check,
  Edit3,
  Store,
  MonitorSmartphone,
  Users,
  CreditCard,
  Clock,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";

export default function CompanyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const fetchSingleCompany = useCompaniesStore(
    (state: any) => state.fetchSingleCompany
  );

  const [company, setCompany] = useState<CompanyTypeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "overview" | "branches" | "devices" | "staff"
  >("overview");
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    if (!id) return;

    let isMounted = true;

    async function loadData() {
      setIsLoading(true);
      setError(null);

      try {
        const data = await fetchSingleCompany(id);
        if (isMounted) {
          if (!data) {
            setError("Company could not be found or you are not authorized.");
          } else {
            setCompany(data);
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err?.message || "Failed to load company details");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [id, fetchSingleCompany]);

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  };

  // Loading Skeleton State
  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse p-6">
        <div className="h-6 w-36 bg-gray-200 rounded-md" />
        <div className="h-44 bg-gray-200 rounded-2xl" />
        <div className="h-10 bg-gray-200 rounded-lg w-1/2" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-64 bg-gray-200 rounded-xl" />
          <div className="h-64 bg-gray-200 rounded-xl" />
        </div>
      </div>
    );
  }

  // Error / Not Found State
  if (error || !company) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl border border-gray-100 mt-6">
        <div className="h-12 w-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mb-3">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900">
          Unable to Load Company
        </h2>
        <p className="text-sm text-gray-500 mt-1 max-w-sm">
          {error || "We couldn't retrieve the company record."}
        </p>
        <button
          onClick={() => router.back()}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen space-y-6 pb-12">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/admin/tabs/companies"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors w-fit"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Companies</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 shadow-2xs hover:bg-gray-50 hover:text-gray-900 transition"
          >
            <Edit3 className="h-4 w-4 text-gray-500" />
            <span>Edit Profile</span>
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-2xs hover:bg-emerald-700 transition"
          >
            <Store className="h-4 w-4" />
            <span>Launch POS View</span>
          </button>
        </div>
      </div>

      {/* Main Profile Header Card */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs sm:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Logo / Fallback Initial */}
            {company.logo ? (
              <img
                src={company.logo}
                alt={company.name}
                className="h-20 w-20 rounded-2xl object-cover border border-gray-200 shadow-sm"
              />
            ) : (
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-2xl font-bold uppercase text-emerald-700 border border-emerald-200 shadow-inner">
                {company.name ? company.name.charAt(0) : "C"}
              </div>
            )}

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-bold capitalize tracking-tight text-gray-900 sm:text-3xl">
                  {company.name}
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Active Merchant
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                <span className="inline-flex items-center gap-1 font-medium text-gray-700 capitalize">
                  <ShoppingBag className="h-4 w-4 text-emerald-600" />
                  {company.type?.toLowerCase()}
                </span>
                <span>•</span>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  {company.location}
                </span>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => handleCopyCode(company.code)}
                  title="Click to copy code"
                  className="inline-flex items-center gap-1.5 rounded-md bg-gray-100 px-2 py-0.5 text-xs font-mono font-semibold text-gray-800 hover:bg-gray-200 transition"
                >
                  <Hash className="h-3 w-3 text-gray-400" />
                  <span>{company.code}</span>
                  {copiedCode ? (
                    <Check className="h-3 w-3 text-emerald-600" />
                  ) : (
                    <Copy className="h-3 w-3 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Metric Ribbon */}
        <div className="mt-8 grid grid-cols-2 gap-4 border-t border-gray-100 pt-6 sm:grid-cols-4">
          <div className="rounded-xl bg-gray-50/70 p-4 border border-gray-100">
            <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
              <Store className="h-4 w-4 text-emerald-600" />
              <span>Branches</span>
            </div>
            <p className="mt-2 text-2xl font-bold text-gray-900">1</p>
            <p className="text-[11px] text-gray-400">Headquarters</p>
          </div>

          <div className="rounded-xl bg-gray-50/70 p-4 border border-gray-100">
            <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
              <MonitorSmartphone className="h-4 w-4 text-blue-600" />
              <span>POS Terminals</span>
            </div>
            <p className="mt-2 text-2xl font-bold text-gray-900">4</p>
            <p className="text-[11px] text-gray-400">All registered devices</p>
          </div>

          <div className="rounded-xl bg-gray-50/70 p-4 border border-gray-100">
            <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
              <Users className="h-4 w-4 text-purple-600" />
              <span>Cashiers & Staff</span>
            </div>
            <p className="mt-2 text-2xl font-bold text-gray-900">6</p>
            <p className="text-[11px] text-gray-400">Active users</p>
          </div>

          <div className="rounded-xl bg-gray-50/70 p-4 border border-gray-100">
            <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
              <CreditCard className="h-4 w-4 text-amber-600" />
              <span>30-Day Revenue</span>
            </div>
            <p className="mt-2 text-2xl font-bold text-emerald-600">RWF 48.2M</p>
            <p className="text-[11px] text-gray-400">Across all checkouts</p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: "overview", label: "Overview & Info" },
            { id: "branches", label: "Branches" },
            { id: "devices", label: "POS Terminals" },
            { id: "staff", label: "Staff & Roles" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-emerald-600 text-emerald-700"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Panels */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Contact Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-xs">
              <h2 className="text-base font-semibold text-gray-900 mb-4">
                Contact & Profile Details
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 rounded-lg border border-gray-100 p-3.5 bg-gray-50/40">
                  <Mail className="h-5 w-5 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="block text-xs font-medium uppercase tracking-wider text-gray-400">
                      Email Address
                    </span>
                    <a
                      href={`mailto:${company.email}`}
                      className="text-sm font-medium text-emerald-700 hover:underline"
                    >
                      {company.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-lg border border-gray-100 p-3.5 bg-gray-50/40">
                  <Phone className="h-5 w-5 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="block text-xs font-medium uppercase tracking-wider text-gray-400">
                      Phone Number
                    </span>
                    <a
                      href={`tel:${company.phone_number}`}
                      className="text-sm font-medium text-gray-900 hover:underline"
                    >
                      {company.phone_number}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-lg border border-gray-100 p-3.5 bg-gray-50/40">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="block text-xs font-medium uppercase tracking-wider text-gray-400">
                      Address / Location
                    </span>
                    <span className="text-sm font-medium text-gray-900 capitalize">
                      {company.location}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-lg border border-gray-100 p-3.5 bg-gray-50/40">
                  <ShoppingBag className="h-5 w-5 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="block text-xs font-medium uppercase tracking-wider text-gray-400">
                      Industry Category
                    </span>
                    <span className="text-sm font-medium text-gray-900 capitalize">
                      {company.type?.toLowerCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* System & Metadata */}
          <div className="space-y-6">
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-xs">
              <h2 className="text-base font-semibold text-gray-900 mb-4">
                System Identifiers
              </h2>

              <dl className="space-y-3.5 text-xs">
                <div>
                  <dt className="text-gray-400 uppercase font-semibold text-[10px]">
                    Internal ID
                  </dt>
                  <dd className="font-mono text-gray-800 break-all mt-0.5 bg-gray-50 p-2 rounded-md border border-gray-100">
                    {company.id}
                  </dd>
                </div>

                <div>
                  <dt className="text-gray-400 uppercase font-semibold text-[10px]">
                    Registration Code
                  </dt>
                  <dd className="font-mono font-semibold text-emerald-700 text-sm mt-0.5">
                    {company.code}
                  </dd>
                </div>

                <div className="pt-2 border-t border-gray-100">
                  <dt className="text-gray-400 flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Created Date</span>
                  </dt>
                  <dd className="text-gray-800 font-medium mt-0.5">
                    {new Date(company.createdAt).toLocaleString()}
                  </dd>
                </div>

                <div>
                  <dt className="text-gray-400 flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Last Updated</span>
                  </dt>
                  <dd className="text-gray-800 font-medium mt-0.5">
                    {new Date(company.updatedAt).toLocaleString()}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      )}

      {activeTab !== "overview" && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center">
          <Store className="h-10 w-10 text-gray-300" />
          <h3 className="mt-3 text-sm font-semibold text-gray-900 capitalize">
            {activeTab} Management
          </h3>
          <p className="mt-1 text-xs text-gray-500">
            Module to configure company {activeTab} will appear here.
          </p>
        </div>
      )}
    </div>
  );
}