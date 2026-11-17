"use client";

import { useParams } from "next/navigation";
import { useOwnerData } from "@/stores/owner/api";
import type { Device } from "@/app/owner/types";
import { ErrorState, Skeleton } from "@/app/owner/components/ui";
import DeviceView from "@/app/owner/devices/DeviceView";

// A company's device, for the super admin: the owner's device page, with the
// endpoint behind each log entry (the server sends it to the super admin only).
export default function CompanyDevicePage() {
  const { id, deviceId } = useParams<{ id: string; deviceId: string }>();
  const { data, loading, error, reload } = useOwnerData<Device[]>(`/devices?companyId=${encodeURIComponent(id)}`);
  const device = data?.find((d) => d.id === deviceId);
  const company = useOwnerData<{ features?: { deviceAccess?: boolean } | null }>(`/companies/${encodeURIComponent(id)}`);
  const accessOn = company.data?.features?.deviceAccess === true;
  const back = { href: `/admin/tabs/companies/${id}?tab=devices`, label: device?.company?.name ?? "Company devices" };
  if (error && !data) return <ErrorState message={error} onRetry={reload} />;
  if (!device) return loading ? <Skeleton className="h-96" /> : <p className="text-sm text-ink/55">This device was not found. It may have been deleted.</p>;
  return <DeviceView key={device.id} device={device} devices={data!} onChanged={reload} back={back} eyebrow={`${device.company?.name ?? "Company"} · Devices`} access={accessOn ? { staffPath: `/employees?companyId=${encodeURIComponent(id)}` } : null} />;
}
