"use client";

import { RotateCw } from "lucide-react";
import { useOwnerData } from "@/stores/owner/api";
import type { Device } from "@/app/owner/types";
import { ErrorState, PageHeader } from "@/app/owner/components/ui";
import { Button } from "@/app/owner/components/forms";
import { DEVICES } from "@/app/owner/devices/kinds";
import DevicesBoard from "@/app/owner/devices/DevicesBoard";

export default function OwnerDevices() {
  const { data, loading, error, reload } = useOwnerData<Device[]>("/devices");

  if (error) return <ErrorState message={error} onRetry={reload} />;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Settings"
        title="Devices"
        description="Approve new tills, kitchen and customer displays, and control which ones can be used."
        actions={
          <Button tone="outline" icon={RotateCw} onClick={reload}>
            Refresh
          </Button>
        }
      />
      <DevicesBoard devices={data} loading={loading} reload={reload} base={DEVICES} />
    </div>
  );
}
