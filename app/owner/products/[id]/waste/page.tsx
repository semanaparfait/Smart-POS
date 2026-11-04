"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Trash2 } from "lucide-react";
import { ownerRequest } from "@/stores/owner/api";
import type { Product } from "@/app/owner/types";
import { BackButton, Button, Choices, Field, FormPage, FormPageState, FormSection, TextInput } from "@/app/owner/components/forms";
import { INGREDIENTS, WASTE_REASONS, formatQty, quantityOnly } from "@/app/owner/inventory/stock";
import { useBack } from "@/app/owner/inventory/useBack";
import { useProduct } from "@/app/owner/products/useProduct";

// Takes lost stock out, with why, so it isn't mistaken for a sale or a miscount.
function WasteForm({ product, back, backLabel }: { product: Product; back: string; backLabel: string }) {
  const router = useRouter();
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState(WASTE_REASONS[0]);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    const amount = Number(quantity);
    if (!(amount > 0)) return toast.error("Enter how much was lost");
    setSaving(true);
    try {
      await ownerRequest(`/products/${product.id}/waste`, { method: "POST", body: JSON.stringify({ quantity: amount, reason }) });
      toast.success(`Waste recorded: ${formatQty(amount)} ${product.unit} of ${product.name}, ${reason.toLowerCase()}`);
      router.push(back);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not record waste");
      setSaving(false);
    }
  };

  return (
    <FormPage
      back={back}
      backLabel={backLabel}
      eyebrow="Record waste"
      title={product.name}
      description={`${formatQty(product.stockQuantity)} ${product.unit} now`}
      actions={
        <>
          <BackButton href={back} />
          <Button onClick={save} busy={saving} icon={Trash2}>
            Record waste
          </Button>
        </>
      }
    >
      <FormSection>
        <Field label={`How much was lost (${product.unit})`}>
          <TextInput inputMode="decimal" value={quantity} onChange={(e) => setQuantity(quantityOnly(e.target.value))} placeholder="0" autoFocus />
        </Field>
        <Field label="Why">
          <Choices value={reason} onChange={setReason} options={WASTE_REASONS.map((r) => ({ value: r, label: r }))} />
        </Field>
      </FormSection>
    </FormPage>
  );
}

export default function WastePage() {
  const { product, loading, error, reload } = useProduct();
  const { back, label } = useBack(INGREDIENTS);
  if (!product) return <FormPageState back={back} backLabel={label} loading={loading} error={error} onRetry={reload} />;
  return <WasteForm key={product.id} product={product} back={back} backLabel={label} />;
}
