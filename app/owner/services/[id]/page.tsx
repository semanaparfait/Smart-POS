"use client";

import { useParams } from "next/navigation";
import { useOwnerData } from "@/stores/owner/api";
import { FormPageState } from "@/app/owner/components/forms";
import { ServiceForm } from "@/app/owner/services/ServiceForm";
import { SERVICES, type Service } from "@/app/owner/services/services";

export default function EditServicePage() {
  const { id } = useParams<{ id: string }>();
  const { data, loading, error, reload } = useOwnerData<Service>(`/services/${id}`);
  if (!data) return <FormPageState back={SERVICES} backLabel="What you offer" loading={loading} error={error} onRetry={reload} />;
  // Keyed by id only: unit changes reload the units without resetting the form.
  return <ServiceForm key={data.id} existing={data} onUnitsChanged={reload} />;
}
