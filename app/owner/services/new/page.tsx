"use client";

import { ServiceForm } from "@/app/owner/services/ServiceForm";

export default function NewServicePage() {
  return <ServiceForm existing={null} onUnitsChanged={() => {}} />;
}
