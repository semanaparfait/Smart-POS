"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { PackagePlus } from "lucide-react";
import { ownerRequest } from "@/stores/owner/api";
import type { Product } from "@/app/owner/types";
import { BackButton, Button, Field, FormPage, FormPageState, FormSection, TextInput } from "@/app/owner/components/forms";
import { Tabs } from "@/app/owner/components/ui";
import { MONEY_UNIT, PRODUCTS, formatQty, formatStock, quantityOnly } from "@/app/owner/inventory/stock";
import { useBack } from "@/app/owner/inventory/useBack";
import { useProduct } from "@/app/owner/products/useProduct";

// Stock that arrived: it is added to what is there. Bought-in-bulk items can be
// entered the way they arrive, e.g. 3 Trays.
function RestockForm({ product, back, backLabel }: { product: Product; back: string; backLabel: string }) {
  const router = useRouter();
  const [quantity, setQuantity] = useState("");
  const [paid, setPaid] = useState("");
  const [expiry, setExpiry] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const packSize = Number(product.purchaseSize) || 0;
  const hasPack = !!product.purchaseUnit && packSize > 0;
  const [inPacks, setInPacks] = useState<"pack" | "unit">("pack");
  const byPack = hasPack && inPacks === "pack";

  // Stock is always kept in the product's own unit.
  const received = Number(quantity) * (byPack ? packSize : 1);
  const unitCost = Number(paid) > 0 && received > 0 ? Math.round((Number(paid) / received) * 100) / 100 : undefined;

  const save = async () => {
    const amount = Math.round(received * 1000) / 1000;
    if (!(amount > 0)) return toast.error("Enter how much arrived");
    const delivered = byPack ? `${quantity} ${product.purchaseUnit}` : "";
    const fullNote = [delivered, note.trim()].filter(Boolean).join(" · ");
    setSaving(true);
    try {
      await ownerRequest(`/products/${product.id}/restock`, {
        method: "POST",
        body: JSON.stringify({
          quantity: amount,
          ...(fullNote ? { note: fullNote } : {}),
          ...(unitCost !== undefined ? { unitCost } : {}),
          ...(expiry ? { expiryDate: expiry } : {}),
        }),
      });
      toast.success(`Stock added: ${formatQty(amount)} ${product.unit} of ${product.name}`);
      router.push(back);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not add stock");
      setSaving(false);
    }
  };

  return (
    <FormPage
      back={back}
      backLabel={backLabel}
      eyebrow="Restock"
      title={product.name}
      description={`${formatStock(product.stockQuantity, product)} now`}
      actions={
        <>
          <BackButton href={back} />
          <Button onClick={save} busy={saving} icon={PackagePlus}>
            Add stock
          </Button>
        </>
      }
    >
      <FormSection>
        {hasPack && (
          <Tabs
            options={[
              { value: "pack", label: `By ${product.purchaseUnit}` },
              { value: "unit", label: `By ${product.unit}` },
            ]}
            value={inPacks}
            onChange={setInPacks}
          />
        )}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label={`How much arrived (${byPack ? product.purchaseUnit : product.unit})`} hint={byPack && received > 0 ? `Adds ${formatQty(received)} ${product.unit} to stock` : undefined}>
            <TextInput inputMode="decimal" value={quantity} onChange={(e) => setQuantity(quantityOnly(e.target.value))} placeholder="0" autoFocus />
          </Field>
          {product.unit !== MONEY_UNIT && (
            <Field label="Total paid (optional)" hint={unitCost !== undefined ? `New cost: ${unitCost.toLocaleString()} RWF per ${product.unit}` : "Updates the cost per unit"}>
              <div className="relative">
                <TextInput inputMode="decimal" value={paid} onChange={(e) => setPaid(quantityOnly(e.target.value))} placeholder="0" className="pr-14" />
                <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-ink/45">RWF</span>
              </div>
            </Field>
          )}
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="New expiry date (optional)">
            <TextInput type="date" value={expiry} onChange={(e) => setExpiry(e.target.value)} />
          </Field>
          <Field label="Note (optional)">
            <TextInput value={note} maxLength={255} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Delivery" />
          </Field>
        </div>
      </FormSection>
    </FormPage>
  );
}

export default function RestockPage() {
  const { product, loading, error, reload } = useProduct();
  const { back, label } = useBack(PRODUCTS);
  if (!product) return <FormPageState back={back} backLabel={label} loading={loading} error={error} onRetry={reload} />;
  return <RestockForm key={product.id} product={product} back={back} backLabel={label} />;
}
