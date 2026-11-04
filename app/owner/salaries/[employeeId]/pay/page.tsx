"use client";

import { useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { ownerRequest, useOwnerData } from "@/stores/owner/api";
import { rwf } from "@/app/owner/components/ui";
import { BackButton, Button, Choices, Field, FormPage, FormPageState, FormSection, MoneyInput, TextArea, TextInput, todayKey } from "@/app/owner/components/forms";
import { SALARY_METHODS, type SalaryMethod } from "@/app/owner/finance/labels";
import { SALARIES, monthKeyOf, monthName, payLine, shiftMonth, type Worker } from "@/app/owner/salaries/payroll";

// Pay one month's salary: what they owe can be taken off; a month is paid once.
function PayForm({ worker, startMonth }: { worker: Worker; startMonth: string }) {
  const router = useRouter();
  const [month, setMonth] = useState(startMonth);
  const suggested = Math.min(worker.owed, worker.salary);
  const [deduct, setDeduct] = useState(String(suggested));
  const [amount, setAmount] = useState(String(worker.salary - suggested));
  const [method, setMethod] = useState<SalaryMethod>("CASH");
  const [paidOn, setPaidOn] = useState(todayKey());
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const paid = worker.salaryPayments.find((p) => p.month === month);
  const thisMonth = monthKeyOf(new Date());

  // What is handed over follows the deduction, unless typed by hand.
  const changeDeduct = (value: string) => {
    setDeduct(value);
    setAmount(String(Math.max(0, worker.salary - Number(value || 0))));
  };

  const pay = async () => {
    const taken = Number(deduct || 0);
    if (taken > worker.owed) return toast.error(`They owe only ${rwf(worker.owed)}`);
    if (taken > worker.salary) return toast.error("You cannot take off more than the salary");
    setSaving(true);
    try {
      await ownerRequest("/staff-debts/salaries", {
        method: "POST",
        body: JSON.stringify({ employeeId: worker.employeeId, month, deducted: taken, amount: Number(amount || 0), method, paidOn, note: note.trim() || undefined }),
      });
      toast.success(`Salary paid for ${monthName(month)}: ${worker.name} · ${rwf(amount)}`);
      router.push(SALARIES);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not record the salary");
      setSaving(false);
    }
  };

  return (
    <FormPage
      back={SALARIES}
      backLabel="Salaries & debts"
      eyebrow="Pay salary"
      title={worker.name}
      description={`${payLine(worker)} · owes ${rwf(worker.owed)}`}
      actions={
        <>
          <BackButton href={SALARIES} />
          <Button icon={Check} busy={saving} disabled={!!paid} onClick={pay}>
            Mark {monthName(month)} as paid · {rwf(amount || 0)}
          </Button>
        </>
      }
    >
      <FormSection>
        <div className="flex items-center gap-2">
          <Button small tone="outline" icon={ChevronLeft} aria-label="Previous month" onClick={() => setMonth((m) => shiftMonth(m, -1))} />
          <span className="w-44 text-center text-sm font-bold text-ink">{monthName(month)}</span>
          <Button small tone="outline" icon={ChevronRight} aria-label="Next month" disabled={month >= thisMonth} onClick={() => setMonth((m) => shiftMonth(m, 1))} />
        </div>
        {paid ? (
          <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            Already paid: {rwf(paid.amount)} · {SALARY_METHODS.find((m) => m.value === paid.method)?.label ?? ""} · {paid.paidOn}
            {paid.deducted ? ` · ${rwf(paid.deducted)} taken off for debts` : ""}. Undo it on the Salaries page to pay again.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Field label={worker.payType === "PER_DELIVERY" ? "Earned from deliveries" : "Salary"}>
                <div className="flex h-11 items-center rounded-xl bg-ivory px-3.5 text-sm font-semibold text-ink ring-1 ring-inset ring-ink/10">{rwf(worker.salary)}</div>
              </Field>
              <Field label={`Take off for debts (owes ${rwf(worker.owed)})`}>
                <MoneyInput value={deduct} onChange={changeDeduct} />
              </Field>
              <Field label="Handed over">
                <MoneyInput value={amount} onChange={setAmount} />
              </Field>
            </div>
            <div className="flex flex-wrap items-end gap-4">
              <Field label="Paid with">
                <Choices value={method} onChange={setMethod} options={SALARY_METHODS} />
              </Field>
              <Field label="Paid on">
                <TextInput type="date" value={paidOn} max={todayKey()} onChange={(e) => setPaidOn(e.target.value || todayKey())} className="w-44" />
              </Field>
            </div>
            <Field label="Note (optional)">
              <TextArea value={note} maxLength={1000} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Bonus included, 3 days unpaid leave" />
            </Field>
          </>
        )}
      </FormSection>
    </FormPage>
  );
}

export default function PaySalaryPage() {
  const { employeeId } = useParams<{ employeeId: string }>();
  const month = useSearchParams().get("month");
  const workers = useOwnerData<Worker[]>("/staff-debts");
  const worker = workers.data?.find((w) => w.employeeId === employeeId);
  if (!worker) return <FormPageState back={SALARIES} backLabel="Salaries & debts" loading={workers.loading} error={workers.error} onRetry={workers.reload} />;
  return <PayForm key={worker.employeeId} worker={worker} startMonth={month && /^\d{4}-\d{2}$/.test(month) ? month : monthKeyOf(new Date())} />;
}
