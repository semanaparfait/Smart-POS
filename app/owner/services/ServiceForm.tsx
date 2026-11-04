"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Camera, Check, ListOrdered, Plus, X } from "lucide-react";
import { ownerRequest } from "@/stores/owner/api";
import { rwf, toNumber } from "@/app/owner/components/ui";
import { BackButton, Button, Choices, Field, FormPage, FormSection, TextArea, TextInput } from "@/app/owner/components/forms";
import { ImageSearch } from "@/app/owner/inventory/StockParts";
import { PRICE_UNITS, SERVICES, SERVICE_KINDS, kindMeta, priceMeta, type PriceUnit, type Service, type ServiceKind } from "@/app/owner/services/services";

const text = (value: number | string | null | undefined) => (value === null || value === undefined || toNumber(value) === 0 ? "" : String(toNumber(value)));

// "Room 101" -> next is "Room 102"; anything without a number gets " 2".
const nextName = (names: string[], word: string) => {
  const last = names[names.length - 1];
  const match = last?.match(/^(.*?)(\d+)$/);
  if (match) return `${match[1]}${Number(match[2]) + 1}`;
  return `${word} ${names.length + 1}`;
};

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-ink/6 py-2 last:border-0">
      <span className="text-xs text-ink/55">{label}</span>
      <span className={`text-sm ${strong ? "font-bold" : "font-semibold"} text-ink`}>{value}</span>
    </div>
  );
}

// The page for adding or changing a service: something sold by time or by
// booking, not off a shelf.
export function ServiceForm({ existing, onUnitsChanged }: { existing: Service | null; onUnitsChanged: () => void }) {
  const router = useRouter();
  const [name, setName] = useState(existing?.name ?? "");
  const [kind, setKind] = useState<ServiceKind | "">(existing?.kind ?? "");
  const [priceUnit, setPriceUnit] = useState<PriceUnit | "">(existing?.priceUnit ?? "");
  const [price, setPrice] = useState(text(existing?.price));
  const [deposit, setDeposit] = useState(text(existing?.deposit));
  const [capacity, setCapacity] = useState(text(existing?.capacity));
  const [description, setDescription] = useState(existing?.description ?? "");
  const [photo, setPhoto] = useState<File | null>(null);
  const [pictureUrl, setPictureUrl] = useState<string | null>(null);
  // New services keep their units here until saved; existing ones save each change.
  const [draftUnits, setDraftUnits] = useState<string[]>([]);
  const [unitName, setUnitName] = useState("");
  const [many, setMany] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const preview = useMemo(() => (photo ? URL.createObjectURL(photo) : null), [photo]);

  const meta = kind ? kindMeta(kind) : null;
  const units = existing ? existing.units.map((u) => u.name) : draftUnits;
  const imageUri = pictureUrl ?? preview ?? existing?.imageUrl ?? null;
  const per = priceUnit ? priceMeta(priceUnit) : null;

  const chooseKind = (value: ServiceKind) => {
    setKind(value);
    // The usual price unit, unless the owner already picked one.
    if (!priceUnit) setPriceUnit(kindMeta(value).priceUnit);
  };

  const add = async (names: string[]) => {
    const fresh = names.map((n) => n.trim()).filter((n) => n && !units.some((u) => u.toLowerCase() === n.toLowerCase()));
    if (!fresh.length) return toast.error("That name is already in the list");
    if (!existing) return setDraftUnits((list) => [...list, ...fresh]);
    setBusy("unit");
    try {
      for (const unit of fresh) await ownerRequest(`/services/${existing.id}/units`, { method: "POST", body: JSON.stringify({ name: unit }) });
      toast.success(`Added: ${fresh.join(", ")}`);
      onUnitsChanged();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not add");
    } finally {
      setBusy(null);
    }
  };
  const addOne = () => {
    add([unitName.trim() || nextName(units, meta?.unitWord ?? "Unit")]);
    setUnitName("");
  };
  const addMany = () => {
    const count = Math.min(50, Math.max(1, Number(many) || 0));
    if (!Number(many)) return;
    const list = [...units];
    const names: string[] = [];
    for (let i = 0; i < count; i++) {
      const next = nextName(list, meta?.unitWord ?? "Unit");
      list.push(next);
      names.push(next);
    }
    add(names);
    setMany("");
  };
  const drop = async (unit: string) => {
    if (!existing) return setDraftUnits((list) => list.filter((u) => u !== unit));
    const saved = existing.units.find((u) => u.name === unit);
    if (!saved) return;
    setBusy(saved.id);
    try {
      await ownerRequest(`/service-units/${saved.id}`, { method: "DELETE" });
      toast.success(`Removed: ${unit}`);
      onUnitsChanged();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not remove");
    } finally {
      setBusy(null);
    }
  };

  const save = async () => {
    if (!name.trim() || !kind || !priceUnit || !(Number(price) > 0)) return toast.error("Enter a name, a kind and a price");
    setBusy("save");
    try {
      const form = new FormData();
      form.append("name", name.trim());
      form.append("kind", kind);
      form.append("priceUnit", priceUnit);
      form.append("price", price);
      form.append("deposit", deposit || "0");
      // Blank clears these on the server.
      form.append("capacity", capacity);
      form.append("description", description.trim());
      if (!existing) form.append("units", JSON.stringify(draftUnits));
      if (pictureUrl) form.append("pictureUrl", pictureUrl);
      else if (photo) form.append("picture", photo, photo.name);
      await ownerRequest(existing ? `/services/${existing.id}` : "/services", { method: existing ? "PATCH" : "POST", body: form });
      toast.success(`${existing ? "Service saved" : "Service added"}: ${name.trim()}`);
      router.push(SERVICES);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save the service");
      setBusy(null);
    }
  };

  return (
    <FormPage
      back={SERVICES}
      backLabel="What you offer"
      eyebrow="Services"
      title={existing ? existing.name : "Add a service"}
      description="Something you sell by time or by booking, not off a shelf."
      actions={
        <>
          <BackButton href={SERVICES} />
          <Button icon={Check} busy={busy === "save"} onClick={save}>
            {existing ? "Save changes" : "Add service"}
          </Button>
        </>
      }
    >
      <FormSection title="How it looks">
        <div className="flex items-center gap-4">
          <label className="flex h-24 w-24 shrink-0 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl bg-ivory ring-1 ring-inset ring-ink/10 hover:opacity-80">
            {imageUri ? (
              // eslint-disable-next-line @next/next/no-img-element -- a local preview, a picked picture or the API's storage
              <img src={imageUri} alt="" className="h-full w-full object-cover" />
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
            <p className="truncate text-base font-bold text-ink">{name.trim() || "New service"}</p>
            <Row label="Price" value={Number(price) > 0 && per ? `${rwf(price)} ${per.per}` : "—"} strong />
            <Row label="Units" value={units.length ? String(units.length) : "None"} />
            {Number(deposit) > 0 && <Row label="Deposit" value={rwf(deposit)} />}
            {Number(capacity) > 0 && <Row label="Up to" value={`${capacity} people`} />}
          </div>
        </div>
        {per && ["HOUR", "NIGHT", "DAY"].includes(per.value) && (
          <p className="rounded-xl bg-ivory px-3.5 py-2.5 text-xs text-ink/65">
            {per.value === "HOUR"
              ? "Charged by the quarter hour. 1 h 10 min is 1.25 hours."
              : per.value === "NIGHT"
                ? "Arriving at 14:00 and leaving at 11:00 the next day is one night."
                : "Charged by the started 24 hours, with one hour of grace."}
          </p>
        )}
      </FormSection>

      <FormSection title="What is it">
        <Field label="Name">
          <TextInput value={name} maxLength={120} onChange={(e) => setName(e.target.value)} placeholder="e.g. Deluxe room, Pool table, Swimming pool entry" autoFocus={!existing} />
        </Field>
        <Field label="Kind">
          <Choices value={kind} onChange={(v) => v && chooseKind(v as ServiceKind)} options={SERVICE_KINDS} />
        </Field>
        {meta && <p className="text-xs text-ink/55">{meta.hint}</p>}
        <Field label="Description">
          <TextArea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. Double bed, breakfast included, sea view" />
        </Field>
      </FormSection>

      <FormSection title="Price" description="What one hour, night, day, session or person costs">
        <Field label="Charged">
          <Choices value={priceUnit} onChange={(v) => v && setPriceUnit(v as PriceUnit)} options={PRICE_UNITS} />
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Price" hint={per ? `RWF ${per.per}` : undefined}>
            <TextInput inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value.replace(/[^0-9.]/g, ""))} placeholder="0" />
          </Field>
          <Field label="Deposit when booking ahead" hint="Optional">
            <TextInput inputMode="decimal" value={deposit} onChange={(e) => setDeposit(e.target.value.replace(/[^0-9.]/g, ""))} placeholder="0" />
          </Field>
          <Field label="Most people at once" hint="Empty: no limit">
            <TextInput inputMode="numeric" value={capacity} onChange={(e) => setCapacity(e.target.value.replace(/\D/g, ""))} placeholder="No limit" />
          </Field>
        </div>
      </FormSection>

      <FormSection title="What can be booked" description="Each room, table, hall or item, so two customers never get the same one. Leave empty for tickets.">
        {units.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {units.map((unit) => (
              <span key={unit} className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-ivory pl-3 pr-1 text-sm font-semibold text-ink ring-1 ring-inset ring-ink/10">
                {unit}
                <button type="button" onClick={() => drop(unit)} aria-label={`Remove ${unit}`} className="flex h-7 w-7 items-center justify-center rounded-lg text-ink/45 hover:bg-white hover:text-ink">
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          <TextInput
            value={unitName}
            maxLength={60}
            onChange={(e) => setUnitName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addOne())}
            placeholder={units.length ? nextName(units, meta?.unitWord ?? "Unit") : (meta?.unitExample ?? "Room 101")}
            className="min-w-48 flex-1"
          />
          <Button tone="outline" icon={Plus} busy={busy === "unit"} onClick={addOne}>
            Add
          </Button>
          <TextInput inputMode="numeric" value={many} onChange={(e) => setMany(e.target.value.replace(/\D/g, ""))} placeholder="10" className="w-24" aria-label="How many to add" />
          <Button tone="outline" icon={ListOrdered} onClick={addMany}>
            Add numbered
          </Button>
        </div>
        {!existing && <p className="text-xs text-ink/50">Units are saved with the service.</p>}
      </FormSection>

      <FormSection title="Picture" description="Search, paste a link, or click the photo above to upload">
        <ImageSearch name={name} selected={pictureUrl} onPick={setPictureUrl} searchPath="/services/image-search" />
      </FormSection>
    </FormPage>
  );
}
