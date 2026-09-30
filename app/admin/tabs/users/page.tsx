"use client";

import React, { useMemo, useState } from "react";
import { Users, UserCheck, UserX, Plus, Search } from "lucide-react";
import useUserStore from "@/stores/users/userStore";
import FetchUsers from "@/app/admin/tabs/users/components/FetchUsers";
import AddUserForm from "@/app/admin/tabs/users/components/AddUserForm";

export default function UsersPage() {
  const [activeView, setActiveView] = useState<"users" | "add">("users");
  const [searchQuery, setSearchQuery] = useState("");
  const users = useUserStore((state) => state.users) || [];

  const counts = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => Boolean(u.active)).length;
    const inactive = total - active;
    return { total, active, inactive };
  }, [users]);

  const statCards = [
    {
      name: "Total Users",
      count: counts.total,
      icon: Users,
      iconColor: "text-slate-700",
      iconBg: "bg-slate-100",
      accentBorder: "border-slate-200",
    },
    {
      name: "Active Users",
      count: counts.active,
      icon: UserCheck,
      iconColor: "text-emerald-700",
      iconBg: "bg-emerald-50 ring-1 ring-emerald-600/10",
      accentBorder: "border-emerald-100",
    },
    {
      name: "Inactive Users",
      count: counts.inactive,
      icon: UserX,
      iconColor: "text-rose-700",
      iconBg: "bg-rose-50 ring-1 ring-rose-600/10",
      accentBorder: "border-rose-100",
    },
  ];

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-6">
        {/* Top Header & View Controls */}
        <div className="flex flex-col gap-4 border-b border-slate-200/80 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              User Management
            </h1>
            <p className="mt-0.5 text-sm text-slate-500">
              Manage accounts, verify permissions, and track active statuses.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Segmented View Switcher */}
            <div className="inline-flex rounded-xl border border-slate-200 bg-slate-100/70 p-1">
              <button
                type="button"
                onClick={() => setActiveView("users")}
                className={`rounded-lg px-4 py-2 text-xs font-semibold transition-all sm:text-sm ${
                  activeView === "users"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All Users
              </button>
              <button
                type="button"
                onClick={() => setActiveView("add")}
                className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold transition-all sm:text-sm ${
                  activeView === "add"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Plus className="h-4 w-4 text-slate-500" />
                Add User
              </button>
            </div>
          </div>
        </div>

        {/* Metric Overview Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {statCards.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.name}
                className={`flex items-center justify-between rounded-2xl border bg-white p-5 shadow-xs transition hover:shadow-md ${item.accentBorder}`}
              >
                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                    {item.name}
                  </p>
                  <p className="text-3xl font-bold tracking-tight text-slate-900">
                    {item.count.toLocaleString()}
                  </p>
                </div>
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${item.iconBg} ${item.iconColor}`}
                >
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Dynamic Section Switcher */}
        {activeView === "users" ? (
          <div className="space-y-5">
            {/* Search Input Bar */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, company, email, or role..."
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 shadow-xs outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Users Card Grid */}
            <FetchUsers searchQuery={searchQuery} />
          </div>
        ) : (
          <AddUserForm onSuccess={() => setActiveView("users")} />
        )}
      </div>
    </main>
  );
}