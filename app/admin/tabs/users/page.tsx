"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { KeyRound, Plus, RotateCw, Search, UserCheck, UserX, Users, X } from "lucide-react";
import useUserStore from "@/stores/users/userStore";
import type { UserResponse } from "@/stores/users/userTypes";
import FetchUsers, { UserSkeleton, roleOf } from "@/app/admin/tabs/users/components/FetchUsers";
import Link from "next/link";
import {
  EmptyState,
  FilterChips,
  SummaryBar,
  ViewToggle,
  controlClass,
  primaryButton,
  secondaryButton,
} from "@/app/admin/components/shared";

type LoadState = "loading" | "ready" | "error";
type SortKey = "newest" | "oldest" | "name" | "recent";
type StatusFilter = "" | "active" | "inactive";

const time = (value?: string | null) => (value ? new Date(value).getTime() || 0 : 0);

export default function UsersPage() {
  const users = useUserStore((s) => s.users);
  const fetchUsers = useUserStore((s) => s.fetchUsers);

  const [layout, setLayout] = useState<"grid" | "list">("grid");
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState<StatusFilter>("");
  const [company, setCompany] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");

  const request = useCallback(
    () =>
      fetchUsers()
        .then(() => setLoadState("ready"))
        .catch(() => setLoadState("error")),
    [fetchUsers],
  );

  // Initial state is already "loading"
  useEffect(() => {
    request();
  }, [request]);

  const reload = () => {
    setLoadState("loading");
    request();
  };

  const stats = useMemo(() => {
    const active = users.filter((u) => u.active).length;
    const neverSignedIn = users.filter((u) => !u.lastLoginAt).length;
    return [
      { label: "Total users", value: users.length, icon: Users },
      { label: "Active", value: active, icon: UserCheck },
      { label: "Inactive", value: users.length - active, icon: UserX },
      { label: "Not signed in yet", value: neverSignedIn, icon: KeyRound, highlight: neverSignedIn > 0 },
    ];
  }, [users]);

  // Role chips from the roles present in the data
  const roleChips = useMemo(() => {
    const counts = new Map<string, number>();
    users.forEach((u) => u.role && counts.set(u.role, (counts.get(u.role) ?? 0) + 1));
    return [
      { key: "", label: "All roles", count: users.length },
      ...[...counts].map(([key, count]) => ({ key, label: roleOf(key).label, count })),
    ];
  }, [users]);

  const companies = useMemo(() => {
    const map = new Map<string, string>();
    users.forEach((u) => u.company?.id && map.set(u.company.id, u.company.name));
    return [...map].sort((a, b) => a[1].localeCompare(b[1]));
  }, [users]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    const sorters: Record<SortKey, (a: UserResponse, b: UserResponse) => number> = {
      newest: (a, b) => time(b.createdAt) - time(a.createdAt),
      oldest: (a, b) => time(a.createdAt) - time(b.createdAt),
      name: (a, b) => (a.name ?? "").localeCompare(b.name ?? ""),
      recent: (a, b) => time(b.lastLoginAt) - time(a.lastLoginAt),
    };
    return users
      .filter((u) => {
        const matchesSearch =
          !q || [u.name, u.email, u.phone, u.role, u.company?.name, u.company?.code].some((v) => v?.toLowerCase().includes(q));
        const matchesRole = !role || u.role === role;
        const matchesStatus = !status || (status === "active" ? u.active : !u.active);
        const matchesCompany = !company || u.company?.id === company;
        return matchesSearch && matchesRole && matchesStatus && matchesCompany;
      })
      .sort(sorters[sort]);
  }, [users, search, role, status, company, sort]);

  const hasFilters = Boolean(search || role || status || company);
  const clearFilters = () => {
    setSearch("");
    setRole("");
    setStatus("");
    setCompany("");
  };


  return (
    <main className="space-y-6">
      {/* Header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-[-0.02em] text-ink">Users</h1>
          <p className="mt-1 text-sm text-ink/60">Business owners and staff who can sign in to SmartPOS.</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={reload} disabled={loadState === "loading"} className={secondaryButton} aria-label="Refresh">
            <RotateCw className={`h-4 w-4 ${loadState === "loading" ? "animate-spin" : ""}`} />
          </button>
          <Link href="/admin/tabs/users/new" className={primaryButton}>
            <Plus className="h-4 w-4" />
            Add user
          </Link>
        </div>
      </header>

      <SummaryBar stats={stats} loading={loadState === "loading"} />

      {/* Toolbar */}
      <section className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/45" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, phone or business..."
              aria-label="Search users"
              className={`${controlClass} w-full pl-9 pr-3 text-ink placeholder:text-ink/45`}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select value={status} onChange={(e) => setStatus(e.target.value as StatusFilter)} aria-label="Filter by status" className={`${controlClass} cursor-pointer px-3 font-medium`}>
              <option value="">Any status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <select value={company} onChange={(e) => setCompany(e.target.value)} aria-label="Filter by business" className={`${controlClass} max-w-56 cursor-pointer px-3 font-medium`}>
              <option value="">All businesses</option>
              {companies.map(([id, name]) => (
                <option key={id} value={id}>{name}</option>
              ))}
            </select>
            <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} aria-label="Sort users" className={`${controlClass} cursor-pointer px-3 font-medium`}>
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="name">Name A–Z</option>
              <option value="recent">Recently signed in</option>
            </select>
            <ViewToggle value={layout} onChange={setLayout} />
          </div>
        </div>

        <FilterChips label="Filter by role" options={roleChips} value={role} onChange={setRole} />
      </section>

      {/* Results */}
      <section aria-live="polite">
        {loadState === "ready" && users.length > 0 && (
          <div className="mb-3 flex items-center justify-between text-xs text-ink/60">
            <span>
              Showing <span className="font-semibold text-ink">{visible.length}</span> of {users.length} {users.length === 1 ? "user" : "users"}
            </span>
            {hasFilters && (
              <button type="button" onClick={clearFilters} className="inline-flex items-center gap-1 font-semibold text-ink/70 hover:text-ink">
                <X className="h-3.5 w-3.5" />
                Clear filters
              </button>
            )}
          </div>
        )}

        {loadState === "loading" && <UserSkeleton />}

        {loadState === "error" && (
          <EmptyState
            icon={Users}
            title="Couldn't load users"
            text="Check your connection or sign in again, then try once more."
            action={
              <button type="button" onClick={reload} className={primaryButton}>
                <RotateCw className="h-4 w-4" />
                Try again
              </button>
            }
          />
        )}

        {loadState === "ready" && users.length === 0 && (
          <EmptyState
            icon={Users}
            title="No users yet"
            text="Add the first business owner so they can sign in and set up their staff."
            action={
              <Link href="/admin/tabs/users/new" className={primaryButton}>
                <Plus className="h-4 w-4" />
                Add user
              </Link>
            }
          />
        )}

        {loadState === "ready" && users.length > 0 && visible.length === 0 && (
          <EmptyState
            icon={Users}
            title="No matching users"
            text="Try a different search, role, status or business."
            action={
              <button type="button" onClick={clearFilters} className={secondaryButton}>
                <X className="h-4 w-4" />
                Clear filters
              </button>
            }
          />
        )}

        {loadState === "ready" && visible.length > 0 && <FetchUsers users={visible} view={layout} />}
      </section>
    </main>
  );
}
