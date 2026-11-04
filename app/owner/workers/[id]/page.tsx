"use client";

import { useParams } from "next/navigation";
import { useOwnerData } from "@/stores/owner/api";
import { FormPageState } from "@/app/owner/components/forms";
import { WORKERS, WorkerForm } from "@/app/owner/workers/WorkerForms";
import type { Employee, Role } from "@/app/owner/types";

export default function EditWorkerPage() {
  const { id } = useParams<{ id: string }>();
  const workers = useOwnerData<Employee[]>("/employees");
  const roles = useOwnerData<Role[]>("/roles");
  const worker = workers.data?.find((w) => w.id === id);

  if (!worker || !roles.data)
    return (
      <FormPageState
        back={WORKERS}
        backLabel="Workers"
        loading={workers.loading || roles.loading}
        error={workers.error ?? roles.error}
        onRetry={() => {
          workers.reload();
          roles.reload();
        }}
      />
    );
  return <WorkerForm key={worker.id} worker={worker} roles={roles.data} />;
}
