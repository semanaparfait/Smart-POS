"use client";

import { useParams } from "next/navigation";
import { useOwnerData } from "@/stores/owner/api";
import { FormPageState } from "@/app/owner/components/forms";
import { RoleForm, WORKERS } from "@/app/owner/workers/WorkerForms";
import type { Role } from "@/app/owner/types";

export default function EditRolePage() {
  const { id } = useParams<{ id: string }>();
  const roles = useOwnerData<Role[]>("/roles");
  const role = roles.data?.find((r) => r.id === id);

  if (!role) return <FormPageState back={WORKERS} backLabel="Workers" loading={roles.loading} error={roles.error} onRetry={roles.reload} />;
  return <RoleForm key={role.id} role={role} />;
}
