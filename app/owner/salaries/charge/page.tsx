"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Check } from "lucide-react";
import { ownerRequest, useOwnerData } from "@/stores/owner/api";
import { rwf } from "@/app/owner/components/ui";
import { BackButton, Button, Choices, Field, FormPage, FormPageState, FormSection, MoneyInput, TextArea, TextInput, todayKey } from "@/app/owner/components/forms";
import { DEBT_KINDS, type DebtKind } from "@/app/owner/finance/labels";
import { SALARIES, type Worker } from "@/app/owner/salaries/payroll";

// Charge something to a worker by hand: an advance, goods, damage. It comes off
// their salary.
function ChargeForm({ workers }: { workers: Worker[] }) {
  const router = useRouter();
  const [employeeId, setEmployeeId] = useState(() => (typeof window === "undefined" ? "" : new URLSearchParams(window.location.search).get("worker") ?? ""));
  const [kind, setKind] = useState<DebtKind | "">("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(todayKey());
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!employeeId || !kind || !(Number(amount) > 0)) return toast.error("Choose the worker, the reason and the amount");
    setSaving(true);
    try {
      await ownerRequest("/staff-debts", { method: "POST", body: JSON.stringify({ employeeId, kind, amount: Number(amount), date, note: note.trim() || undefined }) });
      toast.success(`Charged to the worker: ${workers.find((w) => w.employeeId === employeeId)?.name ?? ""} · ${rwf(amount)}`);
      router.push(SALARIES);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not charge");
      setSaving(false);
    }
  };

  return (
    <FormPage
      back={SALARIES}
      backLabel="Salaries & debts"
      eyebrow="Finance"
      title="Charge a worker"
      description="It comes off their salary. When they pay it back and it is approved, it goes back to their salary."
      actions={
        <>
          <BackButton href={SALARIES} />
          <Button icon={Check} busy={saving} onClick={save}>
            Charge
          </Button>
        </>
      }
    >
      <FormSection>
        <Field label="Worker">
          <Choices value={employeeId} onChange={setEmployeeId} options={workers.map((w) => ({ value: w.employeeId, label: w.name }))} />
        </Field>
        <Field label="Why">
          <Choices value={kind} onChange={(v) => v && setKind(v as DebtKind)} options={DEBT_KINDS} />
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Amount">
            <MoneyInput value={amount} onChange={setAmount} />
          </Field>
          <Field label="Date">
            <TextInput type="date" value={date} max={todayKey()} onChange={(e) => setDate(e.target.value || todayKey())} />
          </Field>
        </div>
        <Field label="Note (optional)">
          <TextArea value={note} maxLength={1000} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Took 2 sodas, broke a glass" />
        </Field>
      </FormSection>
    </FormPage>
  );
}

export default function ChargePage() {
  const workers = useOwnerData<Worker[]>("/staff-debts");
  if (!workers.data) return <FormPageState back={SALARIES} backLabel="Salaries & debts" loading={workers.loading} error={workers.error} onRetry={workers.reload} />;
  return <ChargeForm workers={workers.data} />;
}
