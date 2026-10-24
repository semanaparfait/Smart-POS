"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight, Briefcase, ChevronRight, Crown, Phone, ShieldCheck, UserRound, type LucideIcon } from "lucide-react";
import type { UserResponse } from "@/stores/users/userTypes";
import { CompanyBadge, InitialsAvatar, formatDate, timeAgo } from "@/app/admin/components/shared";

/* ---------- Shared helpers (also used by the user detail page) ---------- */

export const ROLES: Record<string, { label: string; icon: LucideIcon; note: string }> = {
  OWNER: { label: "Owner", icon: Crown, note: "Manages the business" },
  EMPLOYEE: { label: "Employee", icon: Briefcase, note: "Uses the POS" },
  SUPERADMIN: { label: "Super admin", icon: ShieldCheck, note: "Manages SmartPOS" },
};

export const roleOf = (role?: string) =>
  ROLES[role?.toUpperCase() ?? ""] ?? {
    label: role ? role.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase()) : "User",
    icon: UserRound,
    note: "",
  };

export function RolePill({ role }: { role?: string }) {
  const { label, icon: Icon } = roleOf(role);
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-ink/6 px-2.5 py-1 text-[11px] font-semibold text-ink/80">
      <Icon className="h-3.5 w-3.5 text-ink/60" aria-hidden="true" />
      {label}
    </span>
  );
}

export function StatusDot({ active }: { active: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-[11px] font-semibold text-ink/70">
      <span className={`h-2 w-2 rounded-full ${active ? "bg-lime ring-1 ring-ink/40" : "bg-ink/25"}`} aria-hidden="true" />
      {active ? "Active" : "Inactive"}
    </span>
  );
}

/** "Last seen 2 h ago", or a note when the person has never signed in */
export const lastSeen = (user: UserResponse) =>
  user.lastLoginAt ? `Last seen ${timeAgo(user.lastLoginAt).toLowerCase()}` : "Hasn't signed in yet";

const href = (user: UserResponse) => `/admin/tabs/users/${user.id}`;

/* ---------- Grid ---------- */

function UserGrid({ users }: { users: UserResponse[] }) {
  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {users.map((user) => (
        <li key={user.id}>
          <Link
            href={href(user)}
            className="group flex h-full flex-col rounded-2xl border border-ink/12 bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-ink/25 hover:shadow-lg hover:shadow-ink/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime"
          >
            <div className="flex items-start gap-3.5">
              <InitialsAvatar name={user.name} size="h-12 w-12 text-sm" muted={!user.active} />
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-[15px] font-bold tracking-[-0.01em] text-ink">{user.name || "Unnamed user"}</h3>
                <p className="mt-0.5 truncate text-xs text-ink/60">{user.email || "No email"}</p>
              </div>
              <RolePill role={user.role} />
            </div>

            <div className="mt-4 flex items-center gap-2.5 rounded-xl bg-ivory p-3">
              <CompanyBadge name={user.company?.name} logo={user.company?.logo} />
              <span className="min-w-0">
                <span className="block truncate text-[13px] font-semibold text-ink/90">{user.company?.name || "No business"}</span>
                <span className="block truncate text-[11px] text-ink/60">{user.company?.location || "—"}</span>
              </span>
            </div>

            <div className="mb-4 mt-3 space-y-1.5 text-[13px] text-ink/70">
              <p className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 shrink-0 text-ink/45" aria-hidden="true" />
                <span className={user.phone ? "" : "italic text-ink/45"}>{user.phone || "No phone"}</span>
              </p>
            </div>

            <div className="mt-auto flex items-center justify-between gap-3 border-t border-ink/6 pt-4">
              <StatusDot active={user.active} />
              <span className="flex items-center gap-1.5 truncate text-xs text-ink/45">
                {lastSeen(user)}
                <ArrowUpRight
                  className="h-3.5 w-3.5 shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink"
                  aria-hidden="true"
                />
              </span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/* ---------- Table ---------- */

function UserTable({ users }: { users: UserResponse[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-ink/12 bg-white shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="border-b border-ink/12 bg-ivory text-[11px] font-bold uppercase tracking-[0.12em] text-ink/45">
            <tr>
              <th scope="col" className="px-5 py-3">User</th>
              <th scope="col" className="px-5 py-3">Role</th>
              <th scope="col" className="px-5 py-3">Business</th>
              <th scope="col" className="px-5 py-3">Status</th>
              <th scope="col" className="px-5 py-3">Last sign-in</th>
              <th scope="col" className="px-5 py-3"><span className="sr-only">Open</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/6">
            {users.map((user) => (
              <tr key={user.id} className="group transition-colors hover:bg-ivory/60">
                <td className="px-5 py-3.5">
                  <Link href={href(user)} className="flex items-center gap-3 focus-visible:outline-none">
                    <InitialsAvatar name={user.name} size="h-9 w-9 text-xs" muted={!user.active} />
                    <span className="min-w-0">
                      <span className="block truncate font-semibold text-ink group-hover:underline">{user.name || "Unnamed user"}</span>
                      <span className="block max-w-60 truncate text-xs text-ink/45">{user.email}</span>
                    </span>
                  </Link>
                </td>
                <td className="px-5 py-3.5"><RolePill role={user.role} /></td>
                <td className="px-5 py-3.5">
                  <span className="flex items-center gap-2.5">
                    <CompanyBadge name={user.company?.name} logo={user.company?.logo} />
                    <span className="max-w-48 truncate font-medium text-ink/90">{user.company?.name || "—"}</span>
                  </span>
                </td>
                <td className="px-5 py-3.5"><StatusDot active={user.active} /></td>
                <td className="whitespace-nowrap px-5 py-3.5 text-ink/60">
                  {user.lastLoginAt ? formatDate(user.lastLoginAt, true) : <span className="italic text-ink/45">Never</span>}
                </td>
                <td className="px-5 py-3.5 text-right">
                  <Link
                    href={href(user)}
                    aria-label={`Open ${user.name}`}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-ink/45 transition-colors hover:bg-white hover:text-ink hover:ring-1 hover:ring-ink/12"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function UserSkeleton() {
  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-hidden="true">
      {Array.from({ length: 6 }, (_, i) => (
        <li key={i} className="animate-pulse rounded-2xl border border-ink/12 bg-white p-5">
          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-xl bg-ink/6" />
            <div className="flex-1 space-y-2">
              <div className="h-3.5 w-2/3 rounded bg-ink/6" />
              <div className="h-3 w-1/2 rounded bg-ink/6" />
            </div>
          </div>
          <div className="mt-4 h-14 rounded-xl bg-ivory" />
          <div className="mt-4 h-3 w-1/3 rounded bg-ink/6" />
        </li>
      ))}
    </ul>
  );
}

export default function FetchUsers({ users, view }: { users: UserResponse[]; view: "grid" | "list" }) {
  return view === "grid" ? <UserGrid users={users} /> : <UserTable users={users} />;
}
