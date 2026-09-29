"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  Plus,
  Wifi,
  Clock3,
  WifiOff,
  Ban,
  Search,
  SlidersHorizontal,
  ChevronDown,
} from "lucide-react";
import FetchDevices from "./components/FetchDevices";

export default function DevicesPage() {
  const [activeView, setActiveView] = useState<"devices" | "add">("devices");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [companyFilter, setCompanyFilter] = useState("");

  const devicesCounts = [
    {
      name: "Active Devices",
      count: 8,
      icon: Wifi,
      description: "Connected and processing transactions",
      iconStyle: "text-emerald-600 bg-emerald-50 border-emerald-100",
      accent: "bg-emerald-500",
    },
    {
      name: "Pending Activation",
      count: 2,
      icon: Clock3,
      description: "Awaiting merchant configuration",
      iconStyle: "text-amber-600 bg-amber-50 border-amber-100",
      accent: "bg-amber-500",
    },
    {
      name: "Offline Devices",
      count: 1,
      icon: WifiOff,
      description: "No heartbeat detected in >15m",
      iconStyle: "text-rose-600 bg-rose-50 border-rose-100",
      accent: "bg-rose-500",
    },
    {
      name: "Deactivated Devices",
      count: 1,
      icon: Ban,
      description: "Revoked or archived by administrator",
      iconStyle: "text-slate-600 bg-slate-100 border-slate-200",
      accent: "bg-slate-400",
    },
  ];

  return (
    <main className="  py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 capitalize">
            {activeView === "devices" ? "Devices Management" : "Register Device"}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {activeView === "devices"
              ? "Monitor and manage all SmartPOS devices registered across businesses and locations."
              : "Register and pair a new terminal hardware unit to an active merchant location."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {activeView === "add" ? (
            <button
              type="button"
              onClick={() => setActiveView("devices")}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Overview
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setActiveView("add")}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            >
              <Plus className="h-4 w-4 stroke-[2.5]" />
              Add Device
            </button>
          )}
        </div>
      </div>

      {activeView === "devices" ? (
        <>
          {/* Metrics Grid */}
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {devicesCounts.map((device) => {
              const Icon = device.icon;
              return (
                <div
                  key={device.name}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-gray-200/80 bg-white p-5 shadow-xs transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div
                        className={`flex h-11 w-11 items-center justify-center rounded-xl border ${device.iconStyle}`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-3xl font-extrabold tracking-tight text-gray-900">
                        {device.count}
                      </span>
                    </div>

                    <h3 className="mt-4 text-sm font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors">
                      {device.name}
                    </h3>
                    <p className="mt-1 text-xs text-gray-500 leading-relaxed">
                      {device.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </section>

          {/* Filters & Search Toolbar */}
          <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-xs">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              {/* Search input with leading icon */}
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by serial number, terminal ID, or merchant..."
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              {/* Select filters */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    aria-label="Filter by Status"
                    className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-3.5 pr-10 text-sm font-medium text-gray-700 outline-none transition hover:bg-gray-50 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 sm:w-48"
                  >
                    <option value="">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="pending">Pending Activation</option>
                    <option value="offline">Offline</option>
                    <option value="deactivated">Deactivated</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                </div>

                <div className="relative">
                  <select
                    value={companyFilter}
                    onChange={(e) => setCompanyFilter(e.target.value)}
                    aria-label="Filter by Company"
                    className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-3.5 pr-10 text-sm font-medium text-gray-700 outline-none transition hover:bg-gray-50 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 sm:w-48"
                  >
                    <option value="">All Merchants</option>
                    <option value="apex">Apex Retail</option>
                    <option value="urban">Urban Grocers</option>
                    <option value="metro">Metro Logistics</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                </div>
              </div>
            </div>
          </section>
        </>
      ) : (
        /* Add Device Form Placeholder */
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs">
          <h2 className="text-base font-semibold text-gray-900">Device Details</h2>
          <p className="mt-1 text-sm text-gray-500">Enter the hardware identifier and allocate a merchant.</p>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
                Serial Number / IMEI
              </label>
              <input
                type="text"
                placeholder="e.g. SN-8839-4402"
                className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">
                Terminal Model
              </label>
              <input
                type="text"
                placeholder="e.g. SmartPOS Pro X3"
                className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>
        </div>
      )}
      <FetchDevices />
    </main>
  );
}