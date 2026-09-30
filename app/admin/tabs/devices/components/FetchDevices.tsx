"use client";

import React, { useEffect, useState } from "react";
import useDeviceStore from "@/stores/device/devicestore";
import {
  Smartphone,
  Building2,
  Calendar,
  CheckCircle2,
  Clock3,
  Ban,
  MoreVertical,
  ExternalLink,
  MonitorCheck, // Used for Windows POS Desktop terminal
  Globe, // Used for Web POS
  Tablet, // Used for iPad/Tablets
  ShieldAlert, // Used for Rejected
  PowerOff, // Used for Disabled
  Layers,
  MapPin,
} from "lucide-react";

export enum RegistrationStatusEnum {
  PENDING = "PENDING",
  REQUESTED = "REQUESTED",
  REGISTERED = "REGISTERED",
  REJECTED = "REJECTED",
  DISABLED = "DISABLED",
}

export interface DeviceType {
  id: string;
  createdAt: string;
  updatedAt: string;
  deviceId: string;
  deviceName: string;
  deviceOs: string;
  registrationStatus: RegistrationStatusEnum;
  company: {
    id: string;
    createdAt: string;
    updatedAt: string;
    code: string;
    logo: string | null;
    name: string;
    email: string;
    phone_number: string;
    location: string;
    type: string;
  };
}

// 1. Status Configuration
const statusConfig: Record<
  RegistrationStatusEnum,
  {
    label: string;
    badge: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  [RegistrationStatusEnum.REGISTERED]: {
    label: "Registered",
    badge:
      "bg-emerald-50 text-emerald-700 border-emerald-200/60 ring-emerald-600/10",
    icon: CheckCircle2,
  },
  [RegistrationStatusEnum.REQUESTED]: {
    label: "Requested",
    badge: "bg-blue-50 text-blue-700 border-blue-200/60 ring-blue-600/10",
    icon: Calendar,
  },
  [RegistrationStatusEnum.PENDING]: {
    label: "Pending",
    badge: "bg-amber-50 text-amber-700 border-amber-200/60 ring-amber-600/10",
    icon: Clock3,
  },
  [RegistrationStatusEnum.REJECTED]: {
    label: "Rejected",
    badge: "bg-rose-50 text-rose-700 border-rose-200/60 ring-rose-600/10",
    icon: ShieldAlert,
  },
  [RegistrationStatusEnum.DISABLED]: {
    label: "Disabled",
    badge: "bg-slate-100 text-slate-700 border-slate-200 ring-slate-600/10",
    icon: Ban,
  },
};

// 2. Device Type & OS Detection Helper
interface DeviceVisualTheme {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  containerBg: string;
  iconColor: string;
  pillBorder: string;
}

function CompanyLogo({ logo, name }: { logo: string | null; name?: string }) {
  const [imageFailed, setImageFailed] = useState(false);
  const normalizedLogo = logo?.trim();
  const initial = name?.trim().charAt(0) || "?";

  if (!normalizedLogo || imageFailed) {
    return (
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-emerald-50 text-xs font-bold uppercase text-emerald-700">
        {initial}
      </div>
    );
  }

  return (
    <img
      src={normalizedLogo}
      alt={name || "Company logo"}
      onError={() => setImageFailed(true)}
      className="h-6 w-6 rounded-md border border-gray-200 object-cover"
    />
  );
}

function getDeviceTypeTheme(os?: string, name?: string): DeviceVisualTheme {
  const normalized = `${os || ""} ${name || ""}`.toLowerCase();

  // Windows Desktop POS
  if (
    normalized.includes("win") ||
    normalized.includes("desktop") ||
    normalized.includes("pc")
  ) {
    return {
      label: "Windows POS",
      icon: MonitorCheck,
      containerBg: "bg-sky-50 border-sky-100 text-sky-600",
      iconColor: "text-sky-600",
      pillBorder: "border-sky-200/60 text-sky-700 bg-sky-50/50",
    };
  }

  // Web Browser POS / Cloud Portal
  if (
    normalized.includes("web") ||
    normalized.includes("chrome") ||
    normalized.includes("browser") ||
    normalized.includes("safari")
  ) {
    return {
      label: "Web Terminal",
      icon: Globe,
      containerBg: "bg-indigo-50 border-indigo-100 text-indigo-600",
      iconColor: "text-indigo-600",
      pillBorder: "border-indigo-200/60 text-indigo-700 bg-indigo-50/50",
    };
  }

  // Tablets / iPad POS
  if (normalized.includes("ipad") || normalized.includes("tablet")) {
    return {
      label: "Tablet POS",
      icon: Tablet,
      containerBg: "bg-purple-50 border-purple-100 text-purple-600",
      iconColor: "text-purple-600",
      pillBorder: "border-purple-200/60 text-purple-700 bg-purple-50/50",
    };
  }

  // Mobile / SmartPOS Handheld (Android, iOS, iPhone)
  return {
    label: "Mobile Handheld",
    icon: Smartphone,
    containerBg: "bg-emerald-50 border-emerald-100 text-emerald-600",
    iconColor: "text-emerald-600",
    pillBorder: "border-emerald-200/60 text-emerald-700 bg-emerald-50/50",
  };
}

export default function FetchDevices() {
  const { devices, fetchDevices } = useDeviceStore() as {
    devices: DeviceType[];
    fetchDevices: () => void;
  };

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  if (!devices || devices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center">
        <Smartphone className="h-10 w-10 text-gray-400" />
        <h3 className="mt-3 text-sm font-semibold text-gray-900">
          No devices found
        </h3>
        <p className="mt-1 text-xs text-gray-500">
          Get started by registering a new device to a merchant.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-5 bg-gray-200 p-3">
      <div className="flex gap-4 flex-wrap ">
        {devices.map((device) => {
          // Resolve status badge
          const status = statusConfig[device.registrationStatus] ?? {
            label: device.registrationStatus,
            badge: "bg-gray-50 text-gray-700 border-gray-200 ring-gray-600/10",
            icon: Clock3,
          };
          const StatusIcon = status.icon;

          // Resolve platform / OS icon & visual identity
          const deviceType = getDeviceTypeTheme(
            device.deviceOs,
            device.deviceName,
          );
          const DeviceIcon = deviceType.icon;

          return (
            <div
              key={device.id}
              className="group   w-fit  flex flex-col justify-between rounded-2xl border border-gray-200/80 bg-white p-5 shadow-xs transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
            >
              <div>
                {/* Header: OS/Hardware Icon, Status Pill & Menu */}
                <div className="flex items-start justify-between gap-2">
                  <div
                    className={`flex  h-12 w-12 items-center justify-center rounded-xl border ${deviceType.containerBg} shadow-xs transition group-hover:scale-105`}
                  >
                    <DeviceIcon className="h-6 w-6 stroke-[2]" />
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${status.badge}`}
                    >
                      <StatusIcon className="h-3 w-3" />
                      {status.label}
                    </span>
                    <button
                      type="button"
                      aria-label="Device actions"
                      className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Title & Hardware Identifier */}
                <div className="mt-4">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold  line-clamp-1 group-hover:text-emerald-600 transition-colors">
                      {device.company.name.charAt(0).toUpperCase()}
                      {device.company.name.slice(1)}
                    </h3>
                  </div>
                </div>
                <div className="mt-1 space-y-2 ">
                  <div className="mt-1 flex items-center gap-2 text-xs">
                    <Building2 className="h-4 w-4 " />
                    <p>{device.company.name}</p>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs">
                    <MapPin className="h-4 w-4 " />
                    <p>{device.company.location}</p>
                  </div>
                </div>

                {/* Badges: Form factor & Registration Date */}
                <div className="mt-3.5 flex  items-center gap-1.5 bg-gray-50/70 p-3 rounded-lg border border-gray-100/80">
                  <div className="whitespace-nowrap">
                    <p className="text-sm">Device Id</p>
                    <p className="text-xs text-gray-500 font-mono whitespace-nowrap">
                      {device.deviceId}
                    </p>
                  </div>

                  <div className="whitespace-nowrap">
                    <p className="text-sm">Created At</p>
                    <p className="text-xs text-gray-500 whitespace-nowrap">
                      {new Date(device.createdAt).toLocaleDateString(
                        undefined,
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        },
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Merchant Details Footer */}
              <div className="mt-5 border-t border-gray-100 pt-3.5 flex items-center justify-between text-xs text-gray-600">
                <div className="flex items-center gap-2 min-w-0">
                  <CompanyLogo
                    logo={device.company?.logo ?? null}
                    name={device.company?.name}
                  />
                  <div className="min-w-0">
                    <p className="truncate font-medium text-gray-800">
                      {device.company?.name || "Unassigned"}
                    </p>
                    <p className="truncate text-[11px] text-gray-400">
                      {device.company?.location || "No location set"}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  title="View device details"
                  className="ml-2 shrink-0 rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-emerald-600 transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
