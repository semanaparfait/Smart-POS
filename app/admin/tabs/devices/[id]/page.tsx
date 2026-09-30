"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import useDeviceStore from "@/stores/device/devicestore";
import {
  ArrowLeft,
  Tablet,
  Clock,
  Clock3,
  Send,
  CheckCircle2,
  XCircle,
  Ban,
  Smartphone,
  Building2,
  MapPin,
  Utensils,
  Calendar,
  User,
  CreditCard,
  ArrowRight,
  Copy,
  Check,
  RefreshCw,
  KeyRound,
  MoreHorizontal,
  Activity,
  Wifi,
  History,
  Zap,
  MapPinOff,
  Trash2,
  ChevronRight,
  Settings,
  LogIn,
  Layers,
} from "lucide-react";
import type { DeviceByIdResponse } from "@/stores/device/devicetypes";

const statusConfig = {
  PENDING: {
    label: "Pending",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
    icon: Clock3,
  },
  REQUESTED: {
    label: "Requested",
    badge: "bg-blue-50 text-blue-700 border-blue-200",
    dot: "bg-blue-500",
    icon: Send,
  },
  REGISTERED: {
    label: "Registered",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
    icon: CheckCircle2,
  },
  REJECTED: {
    label: "Rejected",
    badge: "bg-rose-50 text-rose-700 border-rose-200",
    dot: "bg-rose-500",
    icon: XCircle,
  },
  DISABLED: {
    label: "Disabled",
    badge: "bg-gray-100 text-gray-700 border-gray-300",
    dot: "bg-gray-400",
    icon: Ban,
  },
} as const;

export default function DeviceDetailPage() {
  const [device, setDevice] = useState<DeviceByIdResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [logoFailed, setLogoFailed] = useState(false);

  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const fetchDeviceById = useDeviceStore((state: any) => state.fetchDeviceById);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      setLoading(true);
      const deviceData = await fetchDeviceById(id);
      if (deviceData) {
        setDevice(deviceData);
      } else {
        router.push("/admin/tabs/devices");
      }
      setLoading(false);
    };
    fetchData();
  }, [id, fetchDeviceById, router]);

  const copyToClipboard = (text: string, fieldKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const statusKey = (device?.registrationStatus as keyof typeof statusConfig) || "REGISTERED";
  const currentStatus = statusConfig[statusKey] || statusConfig.REGISTERED;

  if (loading) {
    return (
      <div className="flex min-h-[450px] w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-2  bg-[#f8fafc]/60 min-h-screen">
      {/* Back button */}
      <div>
        <Link
          href="/admin/tabs/devices"
          className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-800 hover:text-emerald-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Devices
        </Link>
      </div>

      {/* Top Hero Section */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-100">
            <Tablet className="h-8 w-8 stroke-[1.8]" />
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                POS-{id}
              </h1>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${currentStatus.badge}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${currentStatus.dot}`} />
                {currentStatus.label}
              </span>
            </div>
            <p className="text-xs font-medium text-slate-500">
              {device?.deviceOs || "Android POS"}
            </p>
            <p className="flex items-center gap-1 text-xs text-emerald-700">
              <Clock className="h-3.5 w-3.5" />
              <span>Last active 2 minutes ago</span>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-800 transition">
            <RefreshCw className="h-3.5 w-3.5" /> Sync Device
          </button>
          <button className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition">
            <KeyRound className="h-3.5 w-3.5 text-slate-500" /> Reset Activation
          </button>
          <button className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition">
            <MoreHorizontal className="h-4 w-4 text-slate-500" /> More <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Row 1: Device Information & Business Cards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Device Information */}
        <div className="rounded-xl border border-slate-200/90 bg-white p-6 shadow-xs">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
            <Smartphone className="h-5 w-5 text-emerald-700" />
            <h2 className="text-sm font-semibold text-slate-900">Device Information</h2>
          </div>

          <div className="mt-4 space-y-3.5 text-xs sm:text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-normal">Device ID</span>
              <div className="flex items-center gap-1.5 font-medium text-slate-900">
                <span>POS-{id}</span>
                <button
                  onClick={() => copyToClipboard(`POS-${id}`, "deviceId")}
                  className="text-slate-400 hover:text-slate-600 transition"
                >
                  {copiedField === "deviceId" ? (
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-normal">Status</span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                {currentStatus.label}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-normal">Device Type</span>
              <span className="flex items-center gap-1.5 font-medium text-slate-900">
                <Smartphone className="h-3.5 w-3.5 text-emerald-600" />
                {device?.deviceOs || "Android POS"}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-normal">App Version</span>
              <span className="font-medium text-slate-900">v2.4.1</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-normal">Created At</span>
              <span className="font-medium text-slate-900">
                {device?.createdAt
                  ? new Date(device.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    }) + " • 10:32 AM"
                  : "N/A"}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-normal">Last Active</span>
              <span className="font-medium text-slate-900">
                {device?.updatedAt
                  ? new Date(device.updatedAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    }) + " • 10:45 AM"
                  : "N/A"}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-normal">Registered By</span>
              <span className="font-medium text-slate-900">Shema Parfait</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-normal">Android ID</span>
              <div className="flex items-center gap-1.5 font-mono text-xs text-slate-600">
                <span>a1b2c3d4e5f6g7h8</span>
                <button
                  onClick={() => copyToClipboard("a1b2c3d4e5f6g7h8", "androidId")}
                  className="text-slate-400 hover:text-slate-600 transition"
                >
                  {copiedField === "androidId" ? (
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Business Information */}
        <div className="rounded-xl border border-slate-200/90 bg-white p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
              <Building2 className="h-5 w-5 text-emerald-700" />
              <h2 className="text-sm font-semibold text-slate-900">Business</h2>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-12 gap-5">
              {/* Business Details List */}
              <div className="sm:col-span-8 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-800 text-white font-bold text-base">
                    {device?.company?.name?.charAt(0).toUpperCase() || "L"}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 leading-tight">
                      {device?.company?.name || "Lex Corp Hotel"}
                    </h3>
                    <p className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                      <MapPin className="h-3 w-3 text-slate-400" />
                      {device?.company?.location || "Kigali, Rwanda"}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pt-2 text-xs sm:text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-normal">Location / Branch</span>
                    <span className="flex items-center gap-1.5 font-medium text-slate-900">
                      <Utensils className="h-3.5 w-3.5 text-slate-400" />
                      {device?.company?.location || "Main Restaurant"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-normal">Owner</span>
                    <span className="flex items-center gap-1.5 font-medium text-slate-900">
                      <User className="h-3.5 w-3.5 text-slate-400" />
                      Shema Parfait
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-normal">Company Code</span>
                    <span className="flex items-center gap-1.5 font-medium text-slate-900">
                      <Building2 className="h-3.5 w-3.5 text-slate-400" />
                      {device?.company?.code || "NTC8ZD"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-normal">Registered At</span>
                    <span className="flex items-center gap-1.5 font-medium text-slate-900">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      Sep 30, 2026 • 10:32 AM
                    </span>
                  </div>
                </div>
              </div>

              {/* Business Profile Sidebar Pill */}
              <div className="sm:col-span-4 rounded-xl bg-emerald-50/60 border border-emerald-100/80 p-5 flex flex-col items-center justify-center text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-800 text-white font-bold text-lg mb-2 shadow-xs">
                  {device?.company?.name?.charAt(0).toUpperCase() || "L"}
                </div>
                <h4 className="font-bold text-slate-900 text-sm">
                  {device?.company?.name || "Lex Corp Hotel"}
                </h4>
                <p className="text-[11px] text-slate-500 mb-4">Hospitality & Comfort</p>
                <Link
                  href={device?.company?.id ? `/admin/companies/${device.company.id}` : "#"}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 hover:text-emerald-900 transition"
                >
                  View Company <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Device Health Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-emerald-700" />
          <h2 className="text-sm font-semibold text-slate-900">Device Health</h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Card 1: Online status */}
          <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/50 p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
              <Wifi className="h-5 w-5" />
            </div>
            <div>
              <p className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
                <span className="h-2 w-2 rounded-full bg-emerald-500" /> Online
              </p>
              <p className="text-[11px] text-slate-500">Device is active and connected</p>
            </div>
          </div>

          {/* Card 2: Last Sync */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-4 flex items-center gap-3 shadow-xs">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] text-slate-400 font-medium">Last Sync</p>
              <p className="text-xs font-bold text-slate-900">2 minutes ago</p>
              <p className="text-[10px] text-slate-400">Sep 30, 2026 • 10:45 AM</p>
            </div>
          </div>

          {/* Card 3: App Version */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-4 flex items-center gap-3 shadow-xs">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
              <Tablet className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] text-slate-400 font-medium">App Version</p>
              <p className="text-xs font-bold text-slate-900">v2.4.1</p>
              <p className="text-[10px] text-slate-400">Latest version</p>
            </div>
          </div>

          {/* Card 4: Device Type */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-4 flex items-center gap-3 shadow-xs">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] text-slate-400 font-medium">Device Type</p>
              <p className="text-xs font-bold text-slate-900">Android POS</p>
              <p className="text-[10px] text-slate-400">Mobile POS Terminal</p>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Recent Activity & Device Actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Activity Timeline */}
        <div className="rounded-xl border border-slate-200/90 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-emerald-700" />
              <h2 className="text-sm font-semibold text-slate-900">Recent Activity</h2>
            </div>
            <Link
              href="#"
              className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 hover:text-emerald-900"
            >
              View All <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-5 space-y-6">
            {/* Event 1 */}
            <div className="relative flex items-start gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                <Smartphone className="h-4 w-4" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-bold text-slate-900">Device registered</p>
                </div>
                <p className="text-[11px] text-slate-400">Sep 30, 2026 • 10:32 AM</p>
                <p className="text-xs text-slate-600 pt-0.5">
                  Device POS-{id || "NTC8ZD-001"} was registered to Lex Corp Hotel.
                </p>
              </div>
            </div>

            {/* Event 2 */}
            <div className="relative flex items-start gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                <LogIn className="h-4 w-4" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-bold text-slate-900">Login successful</p>
                </div>
                <p className="text-[11px] text-slate-400">Sep 30, 2026 • 10:30 AM</p>
                <p className="text-xs text-slate-600 pt-0.5">
                  Device logged in by Shema Parfait.
                </p>
              </div>
            </div>

            {/* Event 3 */}
            <div className="relative flex items-start gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                <Settings className="h-4 w-4" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-bold text-slate-900">Configuration updated</p>
                </div>
                <p className="text-[11px] text-slate-400">Sep 29, 2026 • 06:42 PM</p>
                <p className="text-xs text-slate-600 pt-0.5">
                  POS settings were updated by Super Admin.
                </p>
              </div>
            </div>

            {/* Event 4 */}
            <div className="relative flex items-start gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                <MapPin className="h-4 w-4" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-bold text-slate-900">Device location changed</p>
                </div>
                <p className="text-[11px] text-slate-400">Sep 28, 2026 • 03:15 PM</p>
                <p className="text-xs text-slate-600 pt-0.5">
                  Location set to Main Restaurant.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Device Actions List */}
        <div className="rounded-xl border border-slate-200/90 bg-white p-6 shadow-xs">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
            <Zap className="h-5 w-5 text-emerald-700" />
            <h2 className="text-sm font-semibold text-slate-900">Device Actions</h2>
          </div>

          <div className="mt-4 space-y-2.5">
            {/* Sync Device */}
            <button className="flex w-full items-center justify-between rounded-xl border border-slate-100 bg-white p-3 hover:bg-slate-50 transition text-left">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                  <RefreshCw className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Sync Device</p>
                  <p className="text-[11px] text-slate-400">Force sync device data and settings</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </button>

            {/* Reset Activation */}
            <button className="flex w-full items-center justify-between rounded-xl border border-slate-100 bg-white p-3 hover:bg-slate-50 transition text-left">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                  <KeyRound className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Reset Activation</p>
                  <p className="text-[11px] text-slate-400">Generate new activation key (6-char code)</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </button>

            {/* Reassign Location */}
            <button className="flex w-full items-center justify-between rounded-xl border border-slate-100 bg-white p-3 hover:bg-slate-50 transition text-left">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Reassign Location</p>
                  <p className="text-[11px] text-slate-400">Move device to a different location</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </button>

            {/* Disable Device */}
            <button className="flex w-full items-center justify-between rounded-xl border border-slate-100 bg-white p-3 hover:bg-slate-50 transition text-left">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                  <Ban className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Disable Device</p>
                  <p className="text-[11px] text-slate-400">Temporarily disable this device</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </button>

            {/* Delete Device */}
            <button className="flex w-full items-center justify-between rounded-xl border border-rose-200 bg-rose-50/20 p-3 hover:bg-rose-50/50 transition text-left">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-100 text-rose-600">
                  <Trash2 className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-rose-600">Delete Device</p>
                  <p className="text-[11px] text-rose-400">Permanently remove this device</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-rose-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}