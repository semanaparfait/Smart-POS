"use client";

import { useParams } from "next/navigation";
import { useOwnerData } from "@/stores/owner/api";
import { FormPageState } from "@/app/owner/components/forms";
import { ReasonPage } from "@/app/owner/components/ReasonPage";
import { rwf } from "@/app/owner/components/ui";
import type { CheckedPayment } from "@/app/owner/finance/money";

const BACK = "/owner/finance/service-money";

export default function MissingServiceMoneyPage() {
  const { id } = useParams<{ id: string }>();
  const waiting = useOwnerData<CheckedPayment[]>("/booking-payments?receipt=PENDING");
  const payment = waiting.data?.find((p) => p.id === id);
  if (!payment) return <FormPageState back={BACK} backLabel="Service money" loading={waiting.loading} error={waiting.error} onRetry={waiting.reload} />;
  return (
    <ReasonPage
      back={BACK}
      backLabel="Service money"
      eyebrow="Not received"
      title={`${payment.booking.service.name} · ${rwf(payment.amount)}`}
      description={`${payment.booking.customerName} · ${payment.booking.code} · taken by ${payment.takenBy?.name ?? "—"}`}
      label="What happened?"
      placeholder="e.g. Cash short by 5,000"
      submitLabel="Report as not received"
      path={`/booking-payments/${payment.id}/missing`}
      done="Reported as not received"
    />
  );
}
