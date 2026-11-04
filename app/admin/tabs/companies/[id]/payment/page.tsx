"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ownerRequest, useOwnerData } from "@/stores/owner/api";
import { rwf } from "@/app/owner/components/ui";
import { Button, Choices, Field, FormPage, FormPageState, FormSection, MoneyInput, TextInput, todayKey } from "@/app/owner/components/forms";
import { PLAN_LABEL, usePlatform } from "@/app/admin/components/Platform";
import { METHODS, dayLabel, useBilling, type Billing } from "@/app/admin/tabs/companies/components/billing";

const MONTHS = ["1", "3", "6", "12"];

function PaymentForm({ companyId, name, billing }: { companyId: string; name: string; billing: Billing }) {
  const router = useRouter();
  const platform = usePlatform();
  const back = `/admin/tabs/companies/${companyId}#subscription`;
  const [months, setMonths] = useState("1");
  const [amount, setAmount] = useState(billing.monthlyPrice ? String(billing.monthlyPrice) : "");
  const [method, setMethod] = useState("MOMO");
  const [paidOn, setPaidOn] = useState(() => todayKey());
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const pickMonths = (m: string) => {
    setMonths(m);
    if (billing.monthlyPrice && Number(m)) setAmount(String(billing.monthlyPrice * Number(m)));
  };

  const save = async () => {
    if (!Number(amount)) return toast.error("Enter the amount paid.");
    if (!Number(months) || Number(months) > 36) return toast.error("Months is between 1 and 36.");
    setBusy(true);
    try {
      const res = await ownerRequest<Billing>(`/companies/${companyId}/billing/payments`, {
        method: "POST",
        body: JSON.stringify({ amount: Number(amount), months: Number(months), method, paidOn, note: note || undefined }),
      });
      toast.success(`Payment recorded. Paid until ${dayLabel(res.paidUntil)}.`);
      platform.reload();
      router.push(back);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not record the payment");
      setBusy(false);
    }
  };

  return (
    <FormPage
      back={back}
      backLabel={name}
      eyebrow="Subscription"
      title="Record a payment"
      description={`${name} · ${PLAN_LABEL[billing.plan ?? ""] ?? "No plan"}${billing.monthlyPrice ? ` · ${rwf(billing.monthlyPrice)} a month` : ""} · paid until ${dayLabel(billing.paidUntil)}`}
      note="The months are added after the last day already paid for."
      actions={
        <>
          <Link href={back} className="inline-flex h-10 items-center rounded-xl bg-white px-4 text-sm font-semibold text-ink ring-1 ring-inset ring-ink/15 hover:bg-ivory">
            Cancel
          </Link>
          <Button tone="lime" busy={busy} onClick={save}>
            Record payment
          </Button>
        </>
      }
    >
      <FormSection title="What they paid">
        <Field label="How many months it pays for">
          <div className="flex flex-wrap items-center gap-2">
            <Choices value={MONTHS.includes(months) ? months : ""} onChange={pickMonths} options={MONTHS.map((m) => ({ value: m, label: `${m} month${m === "1" ? "" : "s"}` }))} />
            <span className="block w-24">
              <TextInput inputMode="numeric" value={months} onChange={(e) => pickMonths(e.target.value.replace(/\D/g, "").slice(0, 2))} aria-label="Months" />
            </span>
          </div>
        </Field>
        <Field label="Amount">
          <MoneyInput value={amount} onChange={setAmount} />
        </Field>
        <Field label="Paid with">
          <Choices value={method} onChange={setMethod} options={METHODS} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Paid on">
            <TextInput type="date" value={paidOn} onChange={(e) => setPaidOn(e.target.value)} />
          </Field>
          <Field label="Note" hint="Optional, e.g. the MoMo transaction ID.">
            <TextInput value={note} onChange={(e) => setNote(e.target.value)} />
          </Field>
        </div>
      </FormSection>
    </FormPage>
  );
}

export default function PaymentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const company = useOwnerData<{ name: string }>(`/companies/${id}`);
  const billing = useBilling(id);
  if (!billing.data || !company.data)
    return (
      <FormPageState
        back={`/admin/tabs/companies/${id}`}
        backLabel="Company"
        loading={billing.loading || company.loading}
        error={billing.error ?? company.error}
        onRetry={() => {
          billing.reload();
          company.reload();
        }}
      />
    );
  return <PaymentForm companyId={id} name={company.data.name} billing={billing.data} />;
}
