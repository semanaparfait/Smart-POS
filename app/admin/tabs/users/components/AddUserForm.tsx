"use client";

import React, { useState } from "react";
import {
  UserPlus,
  ArrowLeft,
  Building2,
  Shield,
  Mail,
  Phone,
  User,
  Loader2,
  CheckCircle2,
  KeyRound,
  Copy,
  Check,
  Calendar,
  AlertCircle,
  X,
} from "lucide-react";
import { toast } from "react-hot-toast";

import useUserStore from "@/stores/users/userStore";
import { UserRole, type UserPayload } from "@/stores/users/userTypes";

export interface CreateUserResponse {
  id: string;
  createdAt: string;
  updatedAt: string;
  company: {
    id: string;
  };
  name: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
  active: boolean;
  mustChangePassword: boolean;
  lastLoginAt: null | string;
}

export default function AddUserForm({
  onSuccess,
}: {
  onSuccess: () => void;
}) {
  const createUser = useUserStore((state) => state.createUser);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdUser, setCreatedUser] = useState<CreateUserResponse | null>(null);
  const [copied, setCopied] = useState(false);

  const [form, setForm] = useState<UserPayload>({
    companyCode: "",
    name: "",
    email: "",
    phone: "",
    role: UserRole.OWNER,
  });

  const handleChange = (field: keyof UserPayload, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCopyPassword = () => {
    if (!createdUser?.password) return;
    navigator.clipboard.writeText(createdUser.password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCloseModal = () => {
    setCreatedUser(null);
    onSuccess();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setSubmitting(true);
    setError(null);

    try {
      if (
        !form.companyCode ||
        !form.name ||
        !form.email ||
        !form.phone ||
        !form.role
      ) {
        throw new Error("Please fill in all required fields.");
      }

      // Capture the returned user from createUser
      const res = await createUser(form);
      const newUserData: CreateUserResponse =
        (res as any)?.data ?? (res as any)?.user ?? res;

      toast.success("User registered successfully!");

      // Open credentials confirmation modal
      setCreatedUser(newUserData);

      // Reset form
      setForm({
        companyCode: "",
        name: "",
        email: "",
        phone: "",
        role: UserRole.OWNER,
      });
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to create user.";

      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs sm:p-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <UserPlus className="h-5 w-5 text-emerald-600" />
              Add New User
            </h2>

            <p className="mt-0.5 text-xs text-slate-500">
              Assign a user to a company and give them a system role.
            </p>
          </div>

          <button
            type="button"
            onClick={onSuccess}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 transition hover:text-emerald-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Cancel
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-medium text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {/* Company Code */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                Company Code
              </label>

              <div className="relative">
                <Building2 className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  type="text"
                  required
                  placeholder="e.g. COMP-102"
                  value={form.companyCode}
                  onChange={(e) =>
                    handleChange("companyCode", e.target.value.toUpperCase())
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3.5 text-sm uppercase text-slate-800 shadow-xs outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                />
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                Full Name
              </label>

              <div className="relative">
                <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  type="text"
                  required
                  placeholder="Olivia Williams"
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3.5 text-sm text-slate-800 shadow-xs outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                Email Address
              </label>

              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  type="email"
                  required
                  placeholder="user@example.com"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3.5 text-sm text-slate-800 shadow-xs outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                Phone Number
              </label>

              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  type="tel"
                  required
                  placeholder="+250 788 123 456"
                  value={form.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3.5 text-sm text-slate-800 shadow-xs outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                />
              </div>
            </div>

            {/* Role */}
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                Assigned Role
              </label>

              <div className="relative">
                <Shield className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <select
                  value={form.role}
                  onChange={(e) =>
                    handleChange("role", e.target.value as UserRole)
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3.5 text-sm text-slate-800 shadow-xs outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                >
                  <option value={UserRole.OWNER}>OWNER</option>
                  <option value={UserRole.EMPLOYEE}>EMPLOYEE</option>
                </select>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={onSuccess}
              disabled={submitting}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {submitting ? "Creating..." : "Create User"}
            </button>
          </div>
        </form>
      </div>

      {/* Success Modal */}
      {createdUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm transition-opacity"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xl transition-all sm:p-7">
            {/* Close button */}
            <button
              type="button"
              onClick={handleCloseModal}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header with success badge */}
            <div className="flex items-start gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-500/20">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div className="pr-6">
                <h3 className="text-lg font-bold text-slate-900">
                  User Created Successfully
                </h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  The account has been created and registered in the system.
                </p>
              </div>
            </div>

            {/* Email notification notice banner */}
            <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-blue-200/80 bg-blue-50/60 p-3.5 text-xs text-blue-900">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
              <p className="leading-relaxed">
                A password change link has been sent to{" "}
                <span className="font-semibold underline underline-offset-2">
                  {createdUser.email}
                </span>
                . Please advise them to check their inbox or spam folder.
              </p>
            </div>

            {/* User Details Grid */}
            <div className="mt-4 space-y-3 rounded-xl border border-slate-100 bg-slate-50/70 p-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-500">Full Name</span>
                <span className="font-semibold text-slate-900">
                  {createdUser.name}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-500">Role</span>
                <span className="inline-flex rounded-md border border-slate-200 bg-white px-2 py-0.5 font-semibold text-slate-700">
                  {createdUser.role}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-500">Phone</span>
                <span className="font-mono text-slate-800">
                  {createdUser.phone}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-500">System ID</span>
                <span className="font-mono text-[11px] text-slate-500">
                  {createdUser.id}
                </span>
              </div>

              {/* Temporary Password & Copy Button */}
              {createdUser.password && (
                <div className="flex items-center justify-between border-t border-slate-200/60 pt-2.5 text-xs">
                  <span className="flex items-center gap-1 font-medium text-slate-500">
                    <KeyRound className="h-3.5 w-3.5 text-slate-400" />
                    Generated Password
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-white px-2 py-1 font-mono font-medium text-slate-800 ring-1 ring-slate-200">
                      {createdUser.password}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyPassword}
                      className="rounded-md border border-slate-200 bg-white p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                      title="Copy Password"
                    >
                      {copied ? (
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Must Change Password Badge */}
              <div className="flex items-center justify-between border-t border-slate-200/60 pt-2.5 text-xs">
                <span className="font-medium text-slate-500">
                  Must Change Password
                </span>
                <span
                  className={`font-semibold ${
                    createdUser.mustChangePassword
                      ? "text-amber-600"
                      : "text-slate-600"
                  }`}
                >
                  {createdUser.mustChangePassword ? "Yes (Required)" : "No"}
                </span>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={handleCloseModal}
                className="w-full rounded-xl bg-emerald-600 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-emerald-700 sm:w-auto sm:px-6"
              >
                Done & Return to Users
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}