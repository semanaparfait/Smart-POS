"use client";

import { useParams } from "next/navigation";
import { useOwnerData } from "@/stores/owner/api";
import { FormPageState } from "@/app/owner/components/forms";
import { EXPENSES, ExpenseForm } from "@/app/owner/expenses/ExpenseForm";
import type { Expense } from "@/app/owner/finance/money";

export default function EditExpensePage() {
  const { id } = useParams<{ id: string }>();
  const expenses = useOwnerData<Expense[]>("/expenses");
  const expense = expenses.data?.find((e) => e.id === id);
  if (!expense) return <FormPageState back={EXPENSES} backLabel="Expenses" loading={expenses.loading} error={expenses.error} onRetry={expenses.reload} />;
  return <ExpenseForm key={expense.id} editing={expense} />;
}
