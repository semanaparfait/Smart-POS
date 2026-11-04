"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Check } from "lucide-react";
import { ownerRequest, useOwnerData } from "@/stores/owner/api";
import { rwf } from "@/app/owner/components/ui";
import { BackButton, Button, Choices, Field, FormPage, FormPageState, FormSection, MoneyInput } from "@/app/owner/components/forms";
import { DEBT_PAYMENT_METHODS, debtKindLabel, type DebtPaymentMethod } from "@/app/owner/finance/labels";
import { SALARIES, type Worker } from "@/app/owner/salaries/payroll";

// A worker paid back what they owe: in cash, by MoMo, or taken from the salary.
function PaidBackForm({ worker }: { worker: Worker }) {
  const router = useRouter();
  const fromSalary = Math.min(worker.owed, worker.salary);
  const [method, setMethod] = useState<DebtPaymentMethod>("CASH");
  const [amount, setAmount] = useState(String(worker.owed));
  const [saving, setSaving] = useState(false);

  const pick = (m: DebtPaymentMethod) => {
    setMethod(m);
    if (m === "SALARY") setAmount(String(fromSalary));
  };
  const save = async () => {
    const value = Number(amount || 0);
    if (!(value > 0)) return toast.error("Enter how much they gave back");
    if (value > worker.owed) return toast.error(`They owe only ${rwf(worker.owed)}`);
    setSaving(true);
    try {
      await ownerRequest("/staff-debts/payments", { method: "POST", body: JSON.stringify({ employeeId: worker.employeeId, amount: value, method }) });
      toast.success(`${method === "SALARY" ? "Taken from the salary" : "Payment recorded"}: ${worker.name} · ${rwf(value)}`);
      router.push(SALARIES);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update");
      setSaving(false);
    }
  };

  return (
    <FormPage
      back={SALARIES}
      backLabel="Salaries & debts"
      eyebrow="Paid back"
      title={worker.name}
      description={`Owes ${rwf(worker.owed)}`}
      actions={
        <>
          <BackButton href={SALARIES} />
          <Button icon={Check} busy={saving} onClick={save}>
            {method === "SALARY" ? `Take ${rwf(amount || 0)} from the salary` : `Record ${rwf(amount || 0)}`}
          </Button>
        </>
      }
    >
      <FormSection>
        <Field label="How they paid">
          <Choices value={method} onChange={pick} options={DEBT_PAYMENT_METHODS.filter((m) => m.value !== "SALARY" || fromSalary > 0)} />
        </Field>
        <Field label="How much" hint={method === "SALARY" ? `Up to ${rwf(fromSalary)}, the salary or what they owe` : undefined}>
          <MoneyInput value={amount} onChange={setAmount} />
        </Field>
        {worker.debts.length > 0 && (
          <div>
            <p className="mb-1.5 text-xs font-semibold text-ink">What they owe</p>
            <ul className="divide-y divide-ink/6 rounded-xl ring-1 ring-inset ring-ink/10">
              {worker.debts.map((d) => (
                <li key={d.id} className="flex justify-between px-4 py-2 text-sm">
                  <span className="text-ink/70">
                    {debtKindLabel(d.kind)} · {d.date}
                    {d.note ? ` · ${d.note}` : ""}
                  </span>
                  <span className="font-semibold text-ink">{rwf(d.amount)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </FormSection>
    </FormPage>
  );
}

export default function PaidBackPage() {
  const { employeeId } = useParams<{ employeeId: string }>();
  const workers = useOwnerData<Worker[]>("/staff-debts");
  const worker = workers.data?.find((w) => w.employeeId === employeeId);
  if (!worker) return <FormPageState back={SALARIES} backLabel="Salaries & debts" loading={workers.loading} error={workers.error} onRetry={workers.reload} />;
  return <PaidBackForm key={worker.employeeId} worker={worker} />;
}
