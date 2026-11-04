"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import CompanyForm from "@/app/admin/tabs/companies/components/CompanyForm";
import { CompanyKind } from "@/stores/companies/companyTypes";

// Filled in from an installation request when opened from the inbox.
function NewCompany() {
  const q = useSearchParams();
  const type = (q.get("type") ?? "").toUpperCase();
  return (
    <CompanyForm
      initial={{
        name: q.get("name") ?? "",
        type: (Object.values(CompanyKind) as string[]).includes(type) ? type : CompanyKind.RESTAURANT,
        location: q.get("location") ?? "",
        email: q.get("email") ?? "",
        phone_number: q.get("phone") ?? "",
      }}
    />
  );
}

export default function NewCompanyPage() {
  return (
    <Suspense>
      <NewCompany />
    </Suspense>
  );
}
