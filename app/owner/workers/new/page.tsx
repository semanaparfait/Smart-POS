"use client";

import { useOwnerData } from "@/stores/owner/api";
import { FormPageState } from "@/app/owner/components/forms";
import { WORKERS, WorkerForm } from "@/app/owner/workers/WorkerForms";
import type { Role } from "@/app/owner/types";

export default function NewWorkerPage() {
  const roles = useOwnerData<Role[]>("/roles");
  // The form picks the first role, so it waits for the list.
  if (!roles.data) return <FormPageState back={WORKERS} backLabel="Workers" loading={roles.loading} error={roles.error} onRetry={roles.reload} />;
  return <WorkerForm worker={null} roles={roles.data} />;
}
