"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useOwnerData } from "@/stores/owner/api";
import { FormPageState } from "@/app/owner/components/forms";
import { WORKERS, WorkerForm } from "@/app/owner/workers/WorkerForms";
import type { Role } from "@/app/owner/types";

function NewWorker() {
  // `?role=` comes from "Add a rider" in the delivery settings.
  const startRoleId = useSearchParams().get("role") ?? undefined;
  const roles = useOwnerData<Role[]>("/roles");
  // The form picks a role, so it waits for the list.
  if (!roles.data) return <FormPageState back={WORKERS} backLabel="Workers" loading={roles.loading} error={roles.error} onRetry={roles.reload} />;
  return <WorkerForm worker={null} roles={roles.data} startRoleId={startRoleId} />;
}

export default function NewWorkerPage() {
  return (
    <Suspense fallback={<FormPageState back={WORKERS} backLabel="Workers" loading error={null} onRetry={() => {}} />}>
      <NewWorker />
    </Suspense>
  );
}
