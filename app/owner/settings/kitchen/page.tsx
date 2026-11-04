"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Check, ChefHat, PackageCheck, ShieldCheck, Tag, UserPlus } from "lucide-react";
import useAuthStore from "@/stores/auth/authstore";
import { ownerRequest, useOwnerData } from "@/stores/owner/api";
import type { Role } from "@/app/owner/types";
import { Button, FormPage, FormPageState, LinkButton } from "@/app/owner/components/forms";

type KitchenRole = { id: string; name: string; created: boolean } | null;

// One question: does the shop prepare orders in a kitchen? Yes makes a "Kitchen
// staff" role; workers given it sign in straight to the kitchen screen.
function KitchenForm({ savedOn }: { savedOn: boolean }) {
  const fetchMe = useAuthStore((s) => s.fetchMe);
  const [enabled, setEnabled] = useState(savedOn);
  const [saving, setSaving] = useState(false);
  const [kitchenRole, setKitchenRole] = useState<KitchenRole>(null);
  // The kitchen role made earlier, for the "Add kitchen staff" button.
  const roles = useOwnerData<Role[]>(savedOn ? "/roles" : null);
  const roleId = kitchenRole?.id ?? roles.data?.find((r) => r.permissions?.includes("kitchen.prepare"))?.id;

  const save = async () => {
    setSaving(true);
    try {
      const result = await ownerRequest<{ kitchenRole?: KitchenRole }>("/companies/kitchen-settings", { method: "PUT", body: JSON.stringify({ enabled }) });
      setKitchenRole(result?.kitchenRole ?? null);
      await fetchMe();
      toast.success(
        enabled ? (result?.kitchenRole?.created ? "Kitchen screen is on. We added the Kitchen staff role: add your kitchen staff as workers." : "Kitchen screen is on") : "Kitchen screen is off",
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save");
    } finally {
      setSaving(false);
    }
  };

  const steps = [
    { icon: ShieldCheck, text: 'Saving makes a "Kitchen staff" role for you, ready to use.' },
    { icon: UserPlus, text: "Add each cook in Workers with that role." },
    { icon: ChefHat, text: "Kitchen staff sign in straight to the kitchen screen and see nothing else." },
    { icon: Tag, text: 'Turn on "Show in kitchen" on the products the kitchen prepares.' },
  ];

  return (
    <FormPage
      back="/owner/company"
      backLabel="Company profile"
      eyebrow="Settings"
      title="Kitchen"
      description="Prepare orders on a kitchen screen, with your own kitchen staff."
      actions={
        <Button icon={Check} busy={saving} onClick={save}>
          Save
        </Button>
      }
    >
      <section className="space-y-4 rounded-2xl border border-ink/10 bg-white p-5">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-ivory">
            <ChefHat className="h-4.5 w-4.5 text-ink" />
          </span>
          <h2 className="text-base font-bold text-ink">Do you prepare orders in a kitchen?</h2>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {[
            { v: true, label: "Yes", hint: "Kitchen items go to the kitchen screen" },
            { v: false, label: "No", hint: "Orders are served straight from the till" },
          ].map((o) => {
            const on = enabled === o.v;
            return (
              <button
                key={o.label}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => setEnabled(o.v)}
                className={`rounded-xl p-3.5 text-left transition-colors ${on ? "bg-ink text-white" : "bg-white text-ink ring-1 ring-inset ring-ink/12 hover:bg-ivory"}`}
              >
                <span className="block text-sm font-bold">{o.label}</span>
                <span className={`block text-xs ${on ? "text-white/65" : "text-ink/55"}`}>{o.hint}</span>
              </button>
            );
          })}
        </div>
        {enabled && (
          <div className="space-y-2 border-t border-ink/6 pt-4">
            {steps.map((s, i) => (
              <p key={i} className="flex items-start gap-2.5 text-sm text-ink/70">
                <s.icon className="mt-0.5 h-4 w-4 shrink-0 text-ink/50" />
                {s.text}
              </p>
            ))}
            <div className="flex flex-wrap gap-2 pt-1">
              {roleId && savedOn && (
                <LinkButton icon={UserPlus} href={`/owner/workers/new?role=${roleId}`}>
                  Add kitchen staff
                </LinkButton>
              )}
              <LinkButton tone="outline" icon={PackageCheck} href="/owner/products">
                Choose kitchen products
              </LinkButton>
            </div>
          </div>
        )}
      </section>
    </FormPage>
  );
}

export default function KitchenSettingsPage() {
  const company = useAuthStore((s) => s.user?.company);
  if (!company) return <FormPageState back="/owner/company" backLabel="Company profile" loading error={null} onRetry={() => {}} />;
  return <KitchenForm key={String(company.kitchenEnabled)} savedOn={!!company.kitchenEnabled} />;
}
