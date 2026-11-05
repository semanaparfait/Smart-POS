"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Camera, Check, Info, Plus } from "lucide-react";
import { ownerRequest } from "@/stores/owner/api";
import type { Product } from "@/app/owner/types";
import { rwf, toNumber } from "@/app/owner/components/ui";
import { BackButton, Button, Field, FormPage, FormSection, TextArea, TextInput } from "@/app/owner/components/forms";
import { ImageSearch } from "@/app/owner/inventory/StockParts";
import { BUY_UNITS, INGREDIENTS, MONEY_UNIT, USE_UNITS, formatQty, formatStock, quantityOnly } from "@/app/owner/inventory/stock";

const UNITS = USE_UNITS.map((u) => u.value);
const text = (value: number | string | null | undefined) => (value === null || value === undefined ? "" : String(toNumber(value)));

function Row({ label, value, danger }: { label: string; value: string; danger?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-ink/6 py-2 last:border-0">
      <span className="text-xs text-ink/55">{label}</span>
      <span className={`truncate text-[13px] font-semibold ${danger ? "text-rose-600" : "text-ink"}`}>{value}</span>
    </div>
  );
}

function Suffixed({ suffix, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { suffix?: string }) {
  return (
    <div className="relative">
      <TextInput inputMode="decimal" {...props} className={suffix ? "pr-20" : ""} />
      {suffix && <span className="pointer-events-none absolute right-3.5 top-1/2 max-w-16 -translate-y-1/2 truncate text-xs font-semibold text-ink/45">{suffix}</span>}
    </div>
  );
}

// The page for adding or changing an ingredient: stock used to make food. It
// never appears on the till.
export function IngredientForm({ existing, products }: { existing: Product | null; products: Product[] }) {
  const router = useRouter();
  const savedStock = existing ? text(existing.stockQuantity) : "";
  const [name, setName] = useState(existing?.name ?? "");
  const [description, setDescription] = useState(existing?.description ?? "");
  const [photo, setPhoto] = useState<File | null>(null);
  // A picture chosen from the search, used instead of `photo`.
  const [pictureUrl, setPictureUrl] = useState<string | null>(null);
  // No default: a forgotten choice would count eggs in Kg.
  const [unit, setUnit] = useState(existing?.unit ?? "");
  const [customUnit, setCustomUnit] = useState(!!existing && !UNITS.includes(existing.unit));
  const [cost, setCost] = useState(existing ? text(existing.buyingPrice) : "");
  const [purchaseUnit, setPurchaseUnit] = useState(existing?.purchaseUnit ?? "");
  const [packQuantity, setPackQuantity] = useState(text(existing?.purchaseSize));
  const [packPrice, setPackPrice] = useState(existing?.purchaseSize ? String(Math.round(toNumber(existing.purchaseSize) * toNumber(existing.buyingPrice))) : "");
  const [stock, setStock] = useState(savedStock);
  const [alertAt, setAlertAt] = useState(text(existing?.lowStockLevel));
  const [usedIn, setUsedIn] = useState<{ id: string; name: string; quantity: number }[]>([]);
  const [saving, setSaving] = useState(false);
  const preview = useMemo(() => (photo ? URL.createObjectURL(photo) : null), [photo]);

  useEffect(() => {
    if (!existing) return;
    ownerRequest<{ id: string; name: string; quantity: number }[]>(`/products/${existing.id}/used-in`)
      .then(setUsedIn)
      .catch(() => {});
  }, [existing]);

  const duplicate = products.some((p) => p.id !== existing?.id && p.name?.trim().toLowerCase() === name.trim().toLowerCase());
  const buyUnit = purchaseUnit.trim();
  const stockNumber = Number(stock || 0);
  const byValue = unit === MONEY_UNIT;
  const costNumber = byValue ? 1 : Number(cost || 0);
  const alertNumber = alertAt === "" ? null : Number(alertAt);
  const low = alertNumber !== null && stockNumber <= alertNumber;
  const status = stock === "" ? "Not counted yet" : stockNumber <= 0 ? "Out of stock" : low ? "Low stock" : "In stock";
  const imageUri = pictureUrl ?? preview ?? existing?.images?.[0]?.thumbnailUrl ?? existing?.images?.[0]?.url ?? null;

  const applyPack = (quantity: string, price: string) => {
    setPackQuantity(quantity);
    setPackPrice(price);
    if (Number(quantity) > 0 && Number(price) > 0) setCost(String(Math.round((Number(price) / Number(quantity)) * 100) / 100));
  };

  const reset = () => {
    setName("");
    setDescription("");
    setPhoto(null);
    setPictureUrl(null);
    setCost("");
    setPurchaseUnit("");
    setPackQuantity("");
    setPackPrice("");
    setStock("");
    setAlertAt("");
  };

  const save = async (addAnother: boolean) => {
    if (!name.trim() || !unit.trim()) return toast.error("Enter a name and a unit");
    if (duplicate) return toast.error(`${name.trim()} already exists`);
    if (buyUnit && !(Number(packQuantity) > 0)) return toast.error(`How many ${unit} are in one ${buyUnit}?`);
    setSaving(true);
    try {
      const form = new FormData();
      form.append("name", name.trim());
      form.append("unit", unit.trim());
      // Blank clears these on the server.
      form.append("purchaseUnit", buyUnit);
      form.append("purchaseSize", buyUnit ? packQuantity : "");
      form.append("buyingPrice", String(costNumber));
      form.append("isIngredient", "true");
      form.append("trackStock", "true");
      form.append("description", description.trim());
      form.append("lowStockLevel", alertAt);
      if (!existing) form.append("sellingPrice", "0");
      // It replaces the count, so an unchanged figure isn't sent: a sale made
      // while the page was open would be undone.
      if (stock !== "" && stock !== savedStock) form.append("stockQuantity", stock);
      if (pictureUrl) form.append("pictureUrl", pictureUrl);
      else if (photo) form.append("picture", photo, photo.name);

      await ownerRequest(existing ? `/products/${existing.id}` : "/products", { method: existing ? "PATCH" : "POST", body: form });
      toast.success(`${existing ? "Ingredient saved" : "Ingredient added"}: ${name.trim()}`);
      if (addAnother) {
        reset();
        setSaving(false);
      } else router.push(INGREDIENTS);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save the ingredient");
      setSaving(false);
    }
  };

  return (
    <FormPage
      back={INGREDIENTS}
      backLabel="Ingredients"
      eyebrow="Ingredients"
      title={existing ? `Edit ${existing.name}` : "Add ingredient"}
      description="Stock used to make your food. It never appears on the till."
      actions={
        <>
          <BackButton href={INGREDIENTS} />
          {!existing && (
            <Button tone="outline" icon={Plus} disabled={saving} onClick={() => save(true)}>
              Save & add another
            </Button>
          )}
          <Button icon={Check} busy={saving} onClick={() => save(false)}>
            {existing ? "Save changes" : "Save ingredient"}
          </Button>
        </>
      }
    >
      <FormSection title="Summary">
        <div className="flex items-center gap-4">
          <label className="flex h-24 w-24 shrink-0 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl bg-ivory ring-1 ring-inset ring-ink/10 hover:opacity-80">
            {imageUri ? (
              // eslint-disable-next-line @next/next/no-img-element -- a local preview, a picked picture or the API's storage
              <img loading="lazy" decoding="async" src={imageUri} alt="" className="h-full w-full object-cover" />
            ) : (
              <>
                <Camera className="h-5 w-5 text-ink/40" />
                <span className="mt-1 text-[11px] text-ink/45">Add photo</span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => {
                setPhoto(e.target.files?.[0] ?? null);
                setPictureUrl(null);
              }}
            />
          </label>
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-bold text-ink">{name.trim() || "New ingredient"}</p>
            <Row label="Status" value={status} danger={stock !== "" && (stockNumber <= 0 || low)} />
            <Row label="In stock" value={formatStock(stockNumber, { unit, purchaseUnit: buyUnit || null, purchaseSize: packQuantity || null })} />
            {!byValue && <Row label={`Cost per ${unit || "unit"}`} value={rwf(costNumber)} />}
            <Row label="Stock value" value={rwf(Math.max(0, stockNumber) * costNumber)} />
            {alertNumber !== null && <Row label="Reorder at" value={`${formatQty(alertNumber)} ${unit}`} />}
          </div>
        </div>
      </FormSection>

      <FormSection title="About this ingredient">
        <Field label="Name">
          <TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Beef" autoFocus={!existing} />
          {duplicate && <span className="mt-1.5 block text-xs text-rose-600">This name is already in use.</span>}
        </Field>
        <Field label="Storage notes">
          <TextArea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. Keep frozen, use within 3 days" />
        </Field>
      </FormSection>

      <FormSection title="Picture" description="Search, paste a link, or click the photo in the summary to upload">
        <ImageSearch name={name} selected={pictureUrl} onPick={setPictureUrl} />
      </FormSection>

      <FormSection title="How the kitchen uses it" description="Rice by Kg, oil by Litre, eggs, onions or a whole chicken by Piece">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {USE_UNITS.map((option) => {
            const on = !customUnit && unit === option.value;
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => {
                  setCustomUnit(false);
                  setUnit(option.value);
                  if (option.value === MONEY_UNIT) setPurchaseUnit("");
                }}
                className={`rounded-xl p-3 text-left transition-colors ${on ? "bg-ink text-white" : "bg-white text-ink ring-1 ring-inset ring-ink/12 hover:bg-ivory"}`}
              >
                <span className="block text-[13px] font-bold">
                  {option.value} · {option.how}
                </span>
                <span className={`block truncate text-[11px] ${on ? "text-white/60" : "text-ink/55"}`}>{option.examples}</span>
              </button>
            );
          })}
          <button
            type="button"
            role="radio"
            aria-checked={customUnit}
            onClick={() => {
              setCustomUnit(true);
              setUnit("");
            }}
            className={`rounded-xl p-3 text-left text-[13px] font-bold transition-colors ${customUnit ? "bg-ink text-white" : "bg-white text-ink ring-1 ring-inset ring-ink/12 hover:bg-ivory"}`}
          >
            Something else
          </button>
        </div>
        {byValue && (
          <p className="text-xs text-ink/60">
            For things bought by value, not weight. If you buy 500 RWF of spices and each pot uses 100 RWF of it, enter 500 as stock and 100 in the recipe.
          </p>
        )}
        {customUnit && <TextInput value={unit} maxLength={20} onChange={(e) => setUnit(e.target.value)} placeholder="Type your own unit" />}
      </FormSection>

      {!byValue && (
        <FormSection title="How you buy it" description="Only if it arrives differently, like eggs by the tray or onions by the Kg">
          <div>
            <p className="mb-1.5 text-xs font-semibold text-ink">You buy it by the</p>
            <div className="flex flex-wrap gap-2">
              {BUY_UNITS.filter((o) => o.value !== unit).map((o) => {
                const on = buyUnit === o.value;
                return (
                  <button
                    key={o.value}
                    type="button"
                    aria-pressed={on}
                    onClick={() => {
                      setPurchaseUnit(on ? "" : o.value);
                      if (o.size && !on) applyPack(String(o.size), packPrice);
                    }}
                    className={`h-9 rounded-xl px-3 text-xs font-semibold transition-colors ${on ? "bg-ink text-white" : "bg-white text-ink ring-1 ring-inset ring-ink/12 hover:bg-ivory"}`}
                  >
                    {o.value}
                  </button>
                );
              })}
            </div>
            <TextInput className="mt-2" value={purchaseUnit} maxLength={20} onChange={(e) => setPurchaseUnit(e.target.value)} placeholder="Or type another, e.g. Basin" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label={buyUnit ? `${unit || "Units"} in one ${buyUnit}` : "You buy"}>
              <Suffixed value={packQuantity} onChange={(e) => applyPack(quantityOnly(e.target.value), packPrice)} placeholder="e.g. 25" suffix={unit} />
            </Field>
            <Field label={buyUnit ? `Price of one ${buyUnit}` : "For a total of"}>
              <Suffixed value={packPrice} onChange={(e) => applyPack(packQuantity, quantityOnly(e.target.value))} placeholder="e.g. 30000" suffix="RWF" />
            </Field>
          </div>
          {buyUnit && (
            <p className="flex items-start gap-2 rounded-xl bg-ivory px-3.5 py-3 text-xs text-ink/70">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-ink/45" />
              {Number(packQuantity) > 0
                ? `1 ${buyUnit} = ${formatQty(packQuantity)} ${unit}. Deliveries are entered by the ${buyUnit}, the kitchen uses ${unit}.`
                : `${buyUnit} sizes differ between sellers. Measure one of yours and enter how many ${unit || "units"} it holds. A good average is enough.`}
            </p>
          )}
          <Field label={`Cost per ${unit || "unit"}`}>
            <Suffixed value={cost} onChange={(e) => setCost(quantityOnly(e.target.value))} placeholder="0" suffix="RWF" />
          </Field>
        </FormSection>
      )}

      <FormSection title="Stock" description="What you have now and when to reorder">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label={existing ? "Counted stock" : "In stock now"}>
            <Suffixed value={stock} onChange={(e) => setStock(quantityOnly(e.target.value))} placeholder="0" suffix={unit} />
          </Field>
          <Field label="Low-stock alert at">
            <Suffixed value={alertAt} onChange={(e) => setAlertAt(quantityOnly(e.target.value))} placeholder="0" suffix={unit} />
          </Field>
        </div>
      </FormSection>

      {existing && (
        <FormSection title="Used in" description="Recipes that take this from stock">
          {usedIn.length === 0 ? (
            <p className="text-xs text-ink/55">Not in any recipe yet.</p>
          ) : (
            usedIn.map((dish) => <Row key={dish.id} label={dish.name} value={`${formatQty(dish.quantity)} ${unit}`} />)
          )}
        </FormSection>
      )}
    </FormPage>
  );
}
