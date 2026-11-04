"use client";

import { use } from "react";
import { useOwnerData } from "@/stores/owner/api";
import type { CompanyTypeResponse } from "@/stores/companies/companyTypes";
import CompanyForm from "@/app/admin/tabs/companies/components/CompanyForm";
import { FormPageState } from "@/app/owner/components/forms";

export default function EditCompanyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const company = useOwnerData<CompanyTypeResponse & { tin?: string | null }>(`/companies/${id}`);
  if (!company.data)
    return <FormPageState back={`/admin/tabs/companies/${id}`} backLabel="Company" loading={company.loading} error={company.error} onRetry={company.reload} />;
  return <CompanyForm key={company.data.updatedAt} company={company.data} />;
}
