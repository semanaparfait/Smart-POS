"use client";

import { useParams } from "next/navigation";
import { useOwnerData } from "@/stores/owner/api";
import type { Device } from "@/app/owner/types";
import { ErrorState, Skeleton } from "@/app/owner/components/ui";
import { DEVICES } from "@/app/owner/devices/kinds";
import DeviceView from "@/app/owner/devices/DeviceView";

export default function DevicePage() {
  const { id } = useParams<{ id: string }>();
  // The list holds every field the page shows, and the tills to pair with.
  const { data, loading, error, reload } = useOwnerData<Device[]>("/devices");
  const device = data?.find((d) => d.id === id);
  if (error && !data) return <ErrorState message={error} onRetry={reload} />;
  if (!device) return loading ? <Skeleton className="h-96" /> : <p className="text-sm text-ink/55">This device was not found. It may have been deleted.</p>;
  return <DeviceView key={device.id} device={device} devices={data!} onChanged={reload} back={{ href: DEVICES, label: "Devices" }} />;
}
