"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ownerRequest, useOwnerData } from "@/stores/owner/api";
import { Button, Choices, Field, FormPage, FormPageState, FormSection, MoneyInput, TextArea, TextInput } from "@/app/owner/components/forms";
import { usePlatform } from "@/app/admin/components/Platform";
import { PLANS, useBilling, type Billing } from "@/app/admin/tabs/companies/components/billing";

type PlanValue = (typeof PLANS)[number]["value"];

const inDays = (n: number) => {
  const d = new Date(Date.now() + n * 86_400_000);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

function PlanForm({ companyId, name, billing }: { companyId: string; name: string; billing: Billing }) {
  const router = useRouter();
  const platform = usePlatform();
  const back = `/admin/tabs/companies/${companyId}#subscription`;
  const [plan, setPlan] = useState<PlanValue>((billing.plan as PlanValue) ?? "STARTER");
  const [price, setPrice] = useState(billing.plan ? String(billing.monthlyPrice) : "100000");
  const [trialEnds, setTrialEnds] = useState(() => billing.trialEnds ?? inDays(14));
  const [note, setNote] = useState(billing.note ?? "");
  const [busy, setBusy] = useState(false);

  const pick = (value: PlanValue) => {
    setPlan(value);
    const preset = PLANS.find((p) => p.value === value);
    if (preset && (preset.price || value === "TRIAL")) setPrice(String(preset.price));
  };

  const save = async () => {
    if (plan !== "TRIAL" && !Number(price)) return toast.error("Set what the company pays a month.");
    setBusy(true);
    try {
      await ownerRequest(`/companies/${companyId}/billing/plan`, {
        method: "PATCH",
        body: JSON.stringify({ plan, monthlyPrice: plan === "TRIAL" ? 0 : Number(price), note, ...(plan === "TRIAL" ? { trialEnds } : {}) }),
      });
      toast.success("Plan saved");
      platform.reload();
      router.push(back);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save the plan");
      setBusy(false);
    }
  };

  return (
    <FormPage
      back={back}
      backLabel={name}
      eyebrow="Subscription"
      title={billing.plan ? "Change plan" : "Choose a plan"}
      description={`What ${name} pays SmartPOS each month.`}
      actions={
        <>
          <Link href={back} className="inline-flex h-10 items-center rounded-xl bg-white px-4 text-sm font-semibold text-ink ring-1 ring-inset ring-ink/15 hover:bg-ivory">
            Cancel
          </Link>
          <Button tone="lime" busy={busy} onClick={save}>
            Save plan
          </Button>
        </>
      }
    >
      <FormSection title="Plan">
        <Choices value={plan} onChange={pick} options={PLANS.map((p) => ({ value: p.value, label: p.label }))} />
        <p className="text-xs text-ink/55">{PLANS.find((p) => p.value === plan)?.hint}</p>
        {plan === "TRIAL" ? (
          <Field label="Last free day" hint="Paid months start the day after.">
            <TextInput type="date" value={trialEnds} onChange={(e) => setTrialEnds(e.target.value)} />
          </Field>
        ) : (
          <Field label="Price a month" hint="Change it for a discount or an agreed price.">
            <MoneyInput value={price} onChange={setPrice} />
          </Field>
        )}
      </FormSection>
      <FormSection title="Note" description="Only the SmartPOS team sees it, e.g. agreed price for 2 branches.">
        <TextArea value={note} onChange={(e) => setNote(e.target.value)} />
      </FormSection>
    </FormPage>
  );
}

export default function PlanPage({ params }: { params: Promise<{ id: string }> }) {
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
  return <PlanForm companyId={id} name={company.data.name} billing={billing.data} />;
}
