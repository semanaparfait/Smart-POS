"use client";

import { useParams } from "next/navigation";
import { useOwnerData } from "@/stores/owner/api";
import { FormPageState } from "@/app/owner/components/forms";
import { ReasonPage } from "@/app/owner/components/ReasonPage";
import { rwf } from "@/app/owner/components/ui";
import { PAID_FROM } from "@/app/owner/finance/labels";
import { EXPENSES } from "@/app/owner/expenses/ExpenseForm";
import type { Expense } from "@/app/owner/finance/money";

export default function RejectExpensePage() {
  const { id } = useParams<{ id: string }>();
  const expenses = useOwnerData<Expense[]>("/expenses");
  const expense = expenses.data?.find((e) => e.id === id);
  if (!expense) return <FormPageState back={EXPENSES} backLabel="Expenses" loading={expenses.loading} error={expenses.error} onRetry={expenses.reload} />;
  return (
    <ReasonPage
      back={EXPENSES}
      backLabel="Expenses"
      eyebrow="Reject expense"
      title={`${expense.title} · ${rwf(expense.amount)}`}
      description={`Sent by ${expense.recordedBy?.name ?? "a worker"} · ${expense.startDate} · ${expense.paidFrom ? PAID_FROM[expense.paidFrom] : "Other"}`}
      summary={
        expense.proofUrl ? (
          <a href={expense.proofUrl} target="_blank" rel="noopener noreferrer" className="block w-40 overflow-hidden rounded-xl ring-1 ring-ink/10">
            {/* eslint-disable-next-line @next/next/no-img-element -- the receipt photo in the API's storage */}
            <img loading="lazy" decoding="async" src={expense.proofUrl} alt="Receipt" className="w-full object-cover" />
          </a>
        ) : undefined
      }
      placeholder="e.g. The receipt does not match the amount"
      path={`/expenses/${expense.id}/reject`}
      done="Expense rejected"
    />
  );
}
