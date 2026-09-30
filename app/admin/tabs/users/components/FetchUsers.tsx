"use client";

import React, { useEffect, useState } from "react";
import {
  CalendarDays,
  Mail,
  MapPin,
  Building2,
  Phone,
  MoreVertical,
  Users,
} from "lucide-react";
import useUserStore from "@/stores/users/userStore";
import type { UserResponse } from "@/stores/users/userTypes";
import Link from "next/link";

interface FetchUsersProps {
  searchQuery?: string;
  onEdit?: (user: UserResponse) => void;
  onView?: (user: UserResponse) => void;
}

function UserAvatar({ user }: { user: UserResponse }) {
  const [imageFailed, setImageFailed] = useState(false);
  const initial =
    user.name?.trim().charAt(0).toUpperCase() ||
    user.company?.name?.trim().charAt(0).toUpperCase() ||
    "U";

  if (!user.company?.logo || imageFailed) {
    return (
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-50 text-base font-bold text-blue-700 ring-2 ring-white">
        {initial}
      </div>
    );
  }

  return (
    <img
      src={user.company.logo}
      alt={user.name || "User Avatar"}
      onError={() => setImageFailed(true)}
      className="h-12 w-12 shrink-0 rounded-full border border-slate-100 object-cover shadow-xs"
    />
  );
}

export default function FetchUsers({
  searchQuery = "",
  onEdit,
  onView,
}: FetchUsersProps) {
  const users = useUserStore((state) => state.users) || [];
  const fetchUsers = useUserStore((state) => state.fetchUsers);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null);
        setLoading(true);
        await fetchUsers();
      } catch (fetchError) {
        console.error("Error fetching users:", fetchError);
        setError("Unable to load users right now.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fetchUsers]);

  // Client-side search filtering
  const filteredUsers = users.filter((user) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;

    const name = user.name?.toLowerCase() || "";
    const email = user.email?.toLowerCase() || "";
    const companyName = user.company?.name?.toLowerCase() || "";
    const role = user.role?.toLowerCase() || "";

    return (
      name.includes(query) ||
      email.includes(query) ||
      companyName.includes(query) ||
      role.includes(query)
    );
  });

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center text-sm font-medium text-rose-700">
        {error}
      </div>
    );
  }

  if (filteredUsers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
        <Users className="h-10 w-10 text-slate-400" />
        <h2 className="mt-3 text-sm font-semibold text-slate-900">
          No users found
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          {searchQuery
            ? "No results match your search query."
            : "Users will appear here once registered."}
        </p>
      </div>
    );
  }

  return (
    
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {filteredUsers.map((user) => {
        const formattedDate = user.createdAt
        ? new Date(user.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
        : "N/A";
        
        return (
          <Link
          href={`/admin/tabs/users/${user.id}`}>
          <article
            key={user.id}
            className="group flex flex-col justify-between rounded-2xl border border-slate-100 bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
          >
            <div>
              {/* Profile Avatar and Information */}
              <div className="flex items-center justify-between">
                <div className="mt-3 flex items-center gap-3">
                  <UserAvatar user={user} />
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-bold text-slate-900">
                      {user.name || "Unnamed User"}
                    </h3>
                    <p className="truncate text-xs font-medium text-slate-400">
                      {user.role} &bull; {user.employee}
                    </p>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center rounded-3xl border px-2 py-0.5 text-[11px] font-semibold tracking-wider ${
                    user.active
                      ? "border-emerald-100 bg-emerald-50 text-emerald-600"
                      : "border-slate-200 bg-slate-50 text-slate-500"
                  }`}
                >
                  {user.active ? "ACTIVE" : "INACTIVE"}
                </span>
              </div>

              {/* Company & Location Metadata Grid */}
              <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-3">
                <div className="min-w-0">
                  <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    <Building2 className="h-3 w-3" />
                    Company
                  </span>
                  <span className="mt-0.5 block truncate text-xs font-semibold text-slate-800">
                    {user.company?.name || "Independent"}
                  </span>
                </div>

                <div className="min-w-0">
                  <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    <MapPin className="h-3 w-3" />
                    Location
                  </span>
                  <span className="mt-0.5 block truncate text-xs font-medium text-slate-600">
                    {user.company?.location || "Not specified"}
                  </span>
                </div>
              </div>

              {/* Contact Information Box */}
              <div className="mt-3.5 space-y-1.5 rounded-xl bg-slate-50/80 p-2.5 text-xs text-slate-600">
                <div className="flex items-center gap-2 truncate">
                  <Mail className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                  <span className="truncate">
                    {user.email || "No email available"}
                  </span>
                </div>
                <div className="flex items-center gap-2 truncate">
                  <Phone className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                  <span className="truncate">
                    {user.phone ||
                      user.company?.phone_number ||
                      "No contact phone"}
                  </span>
                </div>
              </div>

              {/* Joined Date and ID */}
              <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
                <span className="inline-flex items-center gap-1">
                  <CalendarDays className="h-3 w-3" />
                  Joined {formattedDate}
                </span>
                <span className="font-mono text-[10px] text-slate-400">
                  {user.company?.code || `#${user.id.slice(0, 6)}`}
                </span>
              </div>
            </div>
          </article>
    </Link>
        );
      })}
    </div>
  );
}
