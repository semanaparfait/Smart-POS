"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Bike, Check, MapPin, Plus, ShieldCheck, Smartphone, Trash2, UserPlus, Wallet, Users } from "lucide-react";
import useAuthStore from "@/stores/auth/authstore";
import { ownerRequest, useOwnerData } from "@/stores/owner/api";
import type { DeliveryArea, SignedInCompany } from "@/stores/auth/AuthTypes";
import type { Role } from "@/app/owner/types";
import { Button, Field, FormPage, FormPageState, LinkButton, MoneyInput, TextInput } from "@/app/owner/components/forms";

type AreaRow = { name: string; fee: string };
type RiderRole = { id: string; name: string; created: boolean } | null;

function Question({
  icon: Icon,
  title,
  yes,
  no,
  value,
  onChange,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  yes: string;
  no: string;
  value: boolean;
  onChange: (v: boolean) => void;
  children?: React.ReactNode;
}) {
  return (
    <section className="space-y-4 rounded-2xl border border-ink/10 bg-white p-5">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-ivory">
          <Icon className="h-4.5 w-4.5 text-ink" />
        </span>
        <h2 className="text-base font-bold text-ink">{title}</h2>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {[
          { v: true, label: "Yes", hint: yes },
          { v: false, label: "No", hint: no },
        ].map((o) => {
          const on = value === o.v;
          return (
            <button
              key={o.label}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => onChange(o.v)}
              className={`rounded-xl p-3.5 text-left transition-colors ${on ? "bg-ink text-white" : "bg-white text-ink ring-1 ring-inset ring-ink/12 hover:bg-ivory"}`}
            >
              <span className="block text-sm font-bold">{o.label}</span>
              <span className={`block text-xs ${on ? "text-white/65" : "text-ink/55"}`}>{o.hint}</span>
            </button>
          );
        })}
      </div>
      {children}
    </section>
  );
}

// Three questions: do you deliver, do you charge for it, do you have riders.
// Workers can't change the fee on an order.
function DeliveryForm({ company }: { company: SignedInCompany }) {
  const fetchMe = useAuthStore((s) => s.fetchMe);
  const saved = company.deliveryAreas ?? [];
  const savedFee = Math.round(Number(company.deliveryFee) || 0);
  const [enabled, setEnabled] = useState(!!company.deliveryEnabled);
  const [charge, setCharge] = useState(savedFee > 0 || saved.length > 0);
  const [mode, setMode] = useState<"one" | "areas">(saved.length ? "areas" : "one");
  const [fee, setFee] = useState(savedFee ? String(savedFee) : "");
  const [areas, setAreas] = useState<AreaRow[]>(saved.map((a) => ({ name: a.name, fee: String(a.fee) })));
  const [riders, setRiders] = useState(!!company.deliveryRiders);
  const [riderRole, setRiderRole] = useState<RiderRole>(null);
  const [saving, setSaving] = useState(false);
  // The rider role made earlier, for the "Add a rider" button.
  const roles = useOwnerData<Role[]>(company.deliveryRiders ? "/roles" : null);
  const riderRoleId = riderRole?.id ?? roles.data?.find((r) => r.permissions?.includes("deliveries.ride"))?.id;

  const save = async () => {
    const list: DeliveryArea[] = charge && mode === "areas" ? areas.filter((a) => a.name.trim()).map((a) => ({ name: a.name.trim(), fee: Number(a.fee) || 0 })) : [];
    const oneFee = charge && mode === "one" ? Number(fee) || 0 : 0;
    if (enabled && charge && mode === "one" && oneFee <= 0) return toast.error("Enter the fee, or answer No to charging a fee.");
    if (enabled && charge && mode === "areas" && list.length === 0) return toast.error("Add at least one area, or use one fee for every delivery.");
    setSaving(true);
    try {
      const result = await ownerRequest<{ riderRole?: RiderRole }>("/deliveries/settings", {
        method: "PUT",
        body: JSON.stringify({ enabled, fee: oneFee, areas: list, riders: enabled && riders }),
      });
      setRiderRole(result?.riderRole ?? null);
      await fetchMe();
      toast.success(
        result?.riderRole?.created
          ? "Delivery is on. We added the Delivery rider role: add your riders as workers."
          : enabled
            ? "Delivery is on. Workers now see Delivery in the cart."
            : "Delivery is off",
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <FormPage
      back="/owner/deliveries"
      backLabel="Deliveries"
      eyebrow="Settings"
      title="Delivery"
      description="Answer a few questions. You can change them any time."
      actions={
        <Button icon={Check} busy={saving} onClick={save}>
          Save
        </Button>
      }
    >
      <Question icon={Bike} title="Do you deliver to customers?" yes="Workers can choose Delivery in the cart" no="Only sales in the shop" value={enabled} onChange={setEnabled} />

      {enabled && (
        <Question icon={Wallet} title="Do you charge a delivery fee?" yes="Added to the customer's total" no="Delivery is free" value={charge} onChange={setCharge}>
          {charge && (
            <div className="space-y-3 border-t border-ink/6 pt-4">
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    ["one", "Same fee everywhere"],
                    ["areas", "A fee per area"],
                  ] as const
                ).map(([v, label]) => (
                  <Button key={v} small tone={mode === v ? "primary" : "outline"} onClick={() => setMode(v)}>
                    {label}
                  </Button>
                ))}
              </div>
              {mode === "one" ? (
                <Field label="Fee for every delivery">
                  <MoneyInput value={fee} onChange={setFee} placeholder="1000" />
                </Field>
              ) : (
                <div className="space-y-2">
                  {areas.map((a, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" />
                        <TextInput value={a.name} maxLength={60} placeholder="Area, e.g. Remera" className="pl-10" onChange={(e) => setAreas(areas.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} />
                      </div>
                      <div className="w-40">
                        <MoneyInput value={a.fee} onChange={(v) => setAreas(areas.map((x, j) => (j === i ? { ...x, fee: v } : x)))} />
                      </div>
                      <Button tone="quiet" icon={Trash2} aria-label={`Remove ${a.name || "area"}`} className="px-2.5" onClick={() => setAreas(areas.filter((_, j) => j !== i))} />
                    </div>
                  ))}
                  <Button small tone="outline" icon={Plus} onClick={() => setAreas([...areas, { name: "", fee: "" }])}>
                    Add an area
                  </Button>
                </div>
              )}
            </div>
          )}
        </Question>
      )}

      {enabled && (
        <Question icon={Users} title="Do you have your own riders?" yes="Choose who takes each order" no="Workers just mark it delivered" value={riders} onChange={setRiders}>
          {riders && (
            <div className="space-y-2 border-t border-ink/6 pt-4">
              {[
                { icon: ShieldCheck, text: 'Saving makes a "Delivery rider" role for you, ready to use.' },
                { icon: UserPlus, text: "Add each rider in Workers with that role, paid monthly or per delivery." },
                { icon: Smartphone, text: "Riders sign in like any worker and pick the deliveries nobody has taken." },
              ].map((s, i) => (
                <p key={i} className="flex items-start gap-2.5 text-sm text-ink/70">
                  <s.icon className="mt-0.5 h-4 w-4 shrink-0 text-ink/50" />
                  {s.text}
                </p>
              ))}
              {riderRoleId && company.deliveryRiders && (
                <LinkButton icon={UserPlus} href={`/owner/workers/new?role=${riderRoleId}`}>
                  Add a rider
                </LinkButton>
              )}
            </div>
          )}
        </Question>
      )}
    </FormPage>
  );
}

export default function DeliverySettingsPage() {
  const company = useAuthStore((s) => s.user?.company);
  if (!company) return <FormPageState back="/owner/deliveries" backLabel="Deliveries" loading error={null} onRetry={() => {}} />;
  return <DeliveryForm company={company} />;
}
