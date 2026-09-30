"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  Phone,
  Building2,
  MapPin,
  CalendarDays,
  ShieldCheck,
  ShieldAlert,
  Clock,
  KeyRound,
  Edit,
  Building,
} from "lucide-react";
import useUserStore from "@/stores/users/userStore";
import type { UserResponse } from "@/stores/users/userTypes";

export default function UserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params?.id as string;

  const users = useUserStore((state) => state.users) || [];
  const fetchUsers = useUserStore((state) => state.fetchUsers);

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserResponse | null>(null);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true);
        if (users.length === 0) {
          await fetchUsers();
        }
      } catch (err) {
        console.error("Failed to load user info:", err);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [fetchUsers, users.length]);

  useEffect(() => {
    if (userId && users.length > 0) {
      const found = users.find((u) => String(u.id) === String(userId));
      setUser(found || null);
    }
  }, [userId, users]);

  if (loading) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center">
        <div className="h-9 w-9 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </main>
    );
  }

  if (!user) {
    return (
      <main className="mx-auto max-w-4xl p-4 text-center">
        <div className="rounded-2xl border border-slate-200 bg-white p-10 shadow-xs">
          <h2 className="text-lg font-semibold text-slate-900">
            User Not Found
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            No profile exists with the ID{" "}
            <code className="font-mono text-slate-700">{userId}</code>.
          </p>
          <button
            onClick={() => router.back()}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <ArrowLeft className="h-4 w-4" /> Go Back
          </button>
        </div>
      </main>
    );
  }

  const initial = user.name?.trim().charAt(0).toUpperCase() || "U";

  return (
    <main className="mx-auto w-full max-w-6xl p-4 ">
      {/* Top Breadcrumb & Action Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-800"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Users
        </button>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50"
          >
            <Edit className="h-4 w-4 text-slate-500" />
            Edit Profile
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Profile Card */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs">
            <div className="flex flex-col items-center text-center">
              {user.company?.logo && !imageFailed ? (
                <img
                  src={user.company.logo}
                  alt={user.name || "User avatar"}
                  onError={() => setImageFailed(true)}
                  className="h-24 w-24 rounded-full border-4 border-slate-50 object-cover shadow-sm"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-slate-50 bg-blue-50 text-3xl font-bold text-green-700 shadow-sm">
                  {initial}
                </div>
              )}
              <h1 className="mt-4 text-lg font-bold text-slate-900">
                {user.name}
              </h1>
              <p className="text-xs font-medium text-slate-400">
                {user.role} &bull; {user.employee}
              </p>

              <div className="mt-3">
                <span
                  className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-0.5 text-xs font-semibold ${
                    user.active
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-slate-200 bg-slate-50 text-slate-600"
                  }`}
                >
                  {user.active ? (
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  ) : (
                    <ShieldAlert className="h-3.5 w-3.5 text-slate-500" />
                  )}
                  {user.active ? "ACTIVE ACCOUNT" : "INACTIVE"}
                </span>
              </div>
            </div>

            <div className="mt-6 border-t border-slate-100 pt-4 space-y-3">
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Mail className="h-4 w-4 shrink-0 text-slate-400" />
                <span className="truncate">{user.email || "No email"}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Phone className="h-4 w-4 shrink-0 text-slate-400" />
                <span className="truncate">
                  {user.phone || user.company?.phone_number || "No phone"}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <CalendarDays className="h-4 w-4 shrink-0 text-slate-400" />
                <span>
                  Joined {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Sections */}
        <div className="space-y-6 lg:col-span-2">
          {/* Company Association */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs">
            <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
              <Building className="h-5 w-5 text-blue-600" />
              Company Details
            </h2>

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-slate-50/70 p-3.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Company Name
                </span>
                <p className="mt-0.5 text-sm font-semibold text-slate-800">
                  {user.company?.name || "Independent"}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50/70 p-3.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Company Code
                </span>
                <p className="mt-0.5 font-mono text-sm font-semibold text-slate-800">
                  {user.company?.code || "N/A"}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50/70 p-3.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Location
                </span>
                <p className="mt-0.5 flex items-center gap-1.5 text-sm font-semibold text-slate-800">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  {user.company?.location || "Not specified"}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50/70 p-3.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Business Type
                </span>
                <p className="mt-0.5 text-sm font-semibold text-slate-800">
                  {user.company?.type || "Standard"}
                </p>
              </div>
            </div>
          </div>

          {/* Security & Access Info */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs">
            <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
              <KeyRound className="h-5 w-5 text-blue-600" />
              Account & Security
            </h2>

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-slate-50/70 p-3.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Password Change Required
                </span>
                <p className="mt-0.5 text-sm font-medium text-slate-800">
                  {user.mustChangePassword
                    ? "Yes (Forced on next login)"
                    : "No"}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50/70 p-3.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Last Login
                </span>
                <p className="mt-0.5 flex items-center gap-1.5 text-sm font-medium text-slate-800">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  {user.lastLoginAt
                    ? new Date(user.lastLoginAt).toLocaleString()
                    : "Never logged in"}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50/70 p-3.5 sm:col-span-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  System ID
                </span>
                <p className="mt-0.5 font-mono text-xs text-slate-600 break-all">
                  {user.id}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
