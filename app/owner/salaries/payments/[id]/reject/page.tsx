"use client";

import { useParams } from "next/navigation";
import { useOwnerData } from "@/stores/owner/api";
import { FormPageState } from "@/app/owner/components/forms";
import { ReasonPage } from "@/app/owner/components/ReasonPage";
import { rwf } from "@/app/owner/components/ui";
import { debtMethodLabel } from "@/app/owner/finance/labels";
import { SALARIES, type Worker } from "@/app/owner/salaries/payroll";

export default function RejectDebtPaymentPage() {
  const { id } = useParams<{ id: string }>();
  const workers = useOwnerData<Worker[]>("/staff-debts");
  const worker = workers.data?.find((w) => w.payments.some((p) => p.id === id));
  const payment = worker?.payments.find((p) => p.id === id);
  if (!worker || !payment) return <FormPageState back={SALARIES} backLabel="Salaries & debts" loading={workers.loading} error={workers.error} onRetry={workers.reload} />;
  return (
    <ReasonPage
      back={SALARIES}
      backLabel="Salaries & debts"
      eyebrow="Reject payment"
      title={`${worker.name} · ${rwf(payment.amount)}`}
      description={`${debtMethodLabel(payment.method)} · ${payment.createdAt.slice(0, 10)}${payment.note ? ` · ${payment.note}` : ""}`}
      placeholder="e.g. The money did not arrive"
      path={`/staff-debts/payments/${payment.id}/reject`}
      done="Payment rejected"
    />
  );
}
