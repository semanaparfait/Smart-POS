"use client";
import React, { useState } from "react";
import {
  ArrowLeft,
  Plus,
  MonitorSmartphone,
  Wifi,
  Clock3,
  WifiOff,
  Ban,
} from "lucide-react";

export default function DevicesPage() {
  const [activeView, setActiveView] = useState<"devices" | "add">("devices");

  const devicesCounts = [
    {
      name: "Active Devices",
      count: 8,
      icon: Wifi,
      description: "Devices currently active",
    },
    {
      name: "Pending Activation",
      count: 2,
      icon: Clock3,
      description: "Devices waiting for activation",
    },
    {
      name: "Offline Devices",
      count: 1,
      icon: WifiOff,
      description: "Devices currently offline",
    },
    {
      name: "Deactivated Devices",
      count: 1,
      icon: Ban,
      description: "Devices disabled by admin",
    },
  ];
  return (
    <main>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            {activeView === "devices" ? "devices" : "Register Device"}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {activeView === "devices"
              ? "Monitor and manage all SmartPOS devices registered across businesses and locations."
              : "Add a new merchant or business location to the platform."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeView === "add" ? (
            <button
              type="button"
              onClick={() => setActiveView("devices")}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-xs hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to List
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setActiveView("add")}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-emerald-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Device
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {devicesCounts.map((device) => {
          const Icon = device.icon;

          return (
            <div
              key={device.name}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
                  <Icon className="h-5 w-5 text-green-600" />
                </div>

                <span className="text-2xl font-bold text-gray-900">
                  {device.count}
                </span>
              </div>

              <h3 className="mt-4 text-sm font-semibold text-gray-900">
                {device.name}
              </h3>

              <p className="mt-1 text-xs text-gray-500">{device.description}</p>
            </div>
          );
        })}
      </div>
    </main>
  );
}
