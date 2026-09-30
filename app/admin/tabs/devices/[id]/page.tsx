"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import useDeviceStore from "@/stores/device/devicestore";
import {
  ArrowLeft,
  Tablet,
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
  ShieldCheck,
  Cpu,
} from "lucide-react";
import type { DeviceByIdResponse } from "@/stores/device/devicetypes";

const statusConfig = {
  PENDING: {
    label: "Pending",
    className: "bg-amber-50 text-amber-700 border-amber-200/80",
    icon: Clock3,
  },
  REQUESTED: {
    label: "Requested",
    className: "bg-blue-50 text-blue-700 border-blue-200/80",
    icon: Send,
  },
  REGISTERED: {
    label: "Registered",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
    icon: CheckCircle2,
  },
  REJECTED: {
    label: "Rejected",
    className: "bg-rose-50 text-rose-700 border-rose-200/80",
    icon: XCircle,
  },
  DISABLED: {
    label: "Disabled",
    className: "bg-slate-100 text-slate-600 border-slate-200/80",
    icon: Ban,
  },
} as const;

export default function DeviceDetailPage() {
  const [device, setDevice] = useState<DeviceByIdResponse | null>(null);
  const [loading, setLoading] = useState(true);
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
        console.error(`Device with ID ${id} not found.`);
        router.push("/admin/tabs/devices");
      }
      setLoading(false);
    };
    fetchData();
  }, [id, fetchDeviceById, router]);

  const status =
    device?.registrationStatus &&
    statusConfig[device.registrationStatus as keyof typeof statusConfig];
  const StatusIcon = status ? status.icon : null;

  if (loading) {
    return (
      <div className="flex h-96 w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-2 ">
      {/* Back Navigation */}
      <Link
        href="/admin/tabs/devices"
        className="group inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-emerald-700"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        Back to Devices
      </Link>

      {/* Hero Overview Header */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-100">
              <Tablet className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-xl font-bold tracking-tight text-slate-900">
                  POS-{id}
                </h1>
                {status && StatusIcon && (
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${status.className}`}
                  >
                    <StatusIcon className="h-3.5 w-3.5" />
                    {status.label}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
                <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                  <Cpu className="h-3 w-3" />
                  {device?.deviceOs || "Unknown OS"}
                </span>
                <span>•</span>
                <span>
                  Created{" "}
                  {device?.createdAt
                    ? new Date(device.createdAt).toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })
                    : "N/A"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <span className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-50">
              <ShieldCheck className="h-4 w-4 text-emerald-600" /> Secure Terminal
            </span>
          </div>
        </div>
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Device Information Card */}
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-700">
              <Smartphone className="h-5 w-5" />
            </div>
            <h2 className="text-base font-semibold text-slate-900">
              Device Specifications
            </h2>
          </div>

          <dl className="mt-4 divide-y divide-slate-100 text-sm">
            <div className="flex justify-between py-3">
              <dt className="font-medium text-slate-500">Device ID</dt>
              <dd className="font-mono text-slate-900">{device?.id || "N/A"}</dd>
            </div>
            <div className="flex justify-between py-3">
              <dt className="font-medium text-slate-500">Status</dt>
              <dd>
                {status && StatusIcon ? (
                  <span
                    className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${status.className}`}
                  >
                    <StatusIcon className="h-3 w-3" />
                    {status.label}
                  </span>
                ) : (
                  <span className="text-slate-500">N/A</span>
                )}
              </dd>
            </div>
            <div className="flex justify-between py-3">
              <dt className="font-medium text-slate-500">Operating System</dt>
              <dd className="font-medium text-slate-900">{device?.deviceOs || "N/A"}</dd>
            </div>
            <div className="flex justify-between py-3">
              <dt className="font-medium text-slate-500">Created At</dt>
              <dd className="text-slate-700">
                {device?.createdAt ? new Date(device.createdAt).toLocaleString() : "N/A"}
              </dd>
            </div>
            <div className="flex justify-between py-3">
              <dt className="font-medium text-slate-500">Last Synced / Updated</dt>
              <dd className="text-slate-700">
                {device?.updatedAt ? new Date(device.updatedAt).toLocaleString() : "N/A"}
              </dd>
            </div>
          </dl>
        </section>

        {/* Company Information Card */}
        <section className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
              <div className="rounded-lg bg-emerald-50 p-2 text-emerald-700">
                <Building2 className="h-5 w-5" />
              </div>
              <h2 className="text-base font-semibold text-slate-900">
                Assigned Company
              </h2>
            </div>

            {/* Company Banner Row */}
            <div className="mt-4 flex items-center gap-3.5 rounded-lg border border-slate-100 bg-slate-50/70 p-3">
              {device?.company?.logo && !logoFailed ? (
                <img
                  src={device.company.logo}
                  alt={device.company.name || "Company Logo"}
                  onError={() => setLogoFailed(true)}
                  className="h-12 w-12 rounded-lg border border-slate-200 object-cover shadow-xs"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-100 text-lg font-bold text-emerald-800">
                  {device?.company?.name?.charAt(0).toUpperCase() || "?"}
                </div>
              )}
              <div>
                <p className="font-semibold text-slate-900 capitalize">
                  {device?.company?.name || "Unassigned"}
                </p>
                <p className="flex items-center gap-1 text-xs text-slate-500">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  {device?.company?.location || "No location specified"}
                </p>
              </div>
            </div>

            <dl className="mt-4 divide-y divide-slate-100 text-sm">
              <div className="flex items-center justify-between py-3">
                <dt className="flex items-center gap-2 text-slate-500 font-medium">
                  <Utensils className="h-4 w-4 text-slate-400" /> Location / Branch
                </dt>
                <dd className="font-medium text-slate-800">
                  {device?.company?.location || "N/A"}
                </dd>
              </div>
              <div className="flex items-center justify-between py-3">
                <dt className="flex items-center gap-2 text-slate-500 font-medium">
                  <User className="h-4 w-4 text-slate-400" /> Company Contact
                </dt>
                <dd className="font-medium text-slate-800">Semana Owner</dd>
              </div>
              <div className="flex items-center justify-between py-3">
                <dt className="flex items-center gap-2 text-slate-500 font-medium">
                  <CreditCard className="h-4 w-4 text-slate-400" /> Company Code
                </dt>
                <dd className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                  {device?.company?.code || "N/A"}
                </dd>
              </div>
              <div className="flex items-center justify-between py-3">
                <dt className="flex items-center gap-2 text-slate-500 font-medium">
                  <Calendar className="h-4 w-4 text-slate-400" /> Registered At
                </dt>
                <dd className="text-slate-700">
                  {device?.company?.createdAt
                    ? new Date(device.company.createdAt).toLocaleDateString()
                    : "N/A"}
                </dd>
              </div>
            </dl>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
            <Link
              href={device?.company?.id ? `/admin/tabs/companies/${device.company.id}` : "#"}
              className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 transition hover:text-emerald-800 hover:underline"
            >
              View Company Profile <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}