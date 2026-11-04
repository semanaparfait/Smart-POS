"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";
import { BedDouble, Bike, ChefHat, LayoutGrid, Loader2, type LucideIcon } from "lucide-react";
import useCompanyStore from "@/stores/companies/companystore";
import type { CompanyFeatures as Features, FeatureKey } from "@/stores/companies/companyTypes";

const EXTRAS: { key: FeatureKey; label: string; description: string; icon: LucideIcon }[] = [
  {
    key: "services",
    label: "Services & bookings",
    description: "Rooms, halls, games, tickets and rentals, with their bookings.",
    icon: BedDouble,
  },
  {
    key: "delivery",
    label: "Delivery",
    description: "Delivery orders, riders and rider phones. The owner sets fees and riders.",
    icon: Bike,
  },
  {
    key: "floorMap",
    label: "Floor map & tables",
    description: "The venue's floor map and the Tables screen at the till.",
    icon: LayoutGrid,
  },
  {
    key: "kitchen",
    label: "Kitchen screen",
    description: "Kitchen display and kitchen staff, for orders that are prepared.",
    icon: ChefHat,
  },
];

// What this company may use beyond selling. Saved per switch; the owner's app
// and everyone signed in update at once.
export default function CompanyFeatures({
  companyId,
  initial,
}: {
  companyId: string;
  initial?: Partial<Features> | null;
}) {
  const setFeatures = useCompanyStore((s) => s.setFeatures);
  // A server from before extras existed sends none: everything is on there.
  const known = !!initial;
  const [features, setLocal] = useState<Partial<Features>>(
    initial ?? { services: true, delivery: true, floorMap: true, kitchen: true },
  );
  const [saving, setSaving] = useState<FeatureKey | null>(null);

  const toggle = async (key: FeatureKey) => {
    const on = !features[key];
    setSaving(key);
    try {
      setLocal(await setFeatures(companyId, { [key]: on }));
      const label = EXTRAS.find((e) => e.key === key)!.label;
      toast.success(`${label} ${on ? "turned on" : "turned off"}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save the extras");
    } finally {
      setSaving(null);
    }
  };

  const count = EXTRAS.filter((e) => features[e.key]).length;

  return (
    <section className="rounded-2xl border border-ink/12 bg-white shadow-xs">
      <header className="flex items-center justify-between gap-4 border-b border-ink/6 px-6 py-4">
        <div>
          <h2 className="text-sm font-bold text-ink">Extras</h2>
          <p className="mt-0.5 text-xs text-ink/60">
            What this company can use besides selling. Switched-off extras disappear from their app.
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-ivory px-2.5 py-1 text-[11px] font-semibold text-ink/70 ring-1 ring-inset ring-ink/12">
          {count} of {EXTRAS.length} on
        </span>
      </header>

      {!known && (
        <p className="border-b border-ink/6 bg-ivory/60 px-6 py-3 text-xs text-ink/60">
          The server doesn&apos;t report extras yet. Run its latest migrations, then reload this page.
        </p>
      )}

      <ul className="divide-y divide-ink/6">
        {EXTRAS.map(({ key, label, description, icon: Icon }) => {
          const on = !!features[key];
          const busy = saving === key;
          return (
            <li key={key} className="flex items-center gap-4 px-6 py-4">
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                  on ? "bg-ink text-lime" : "bg-ink/6 text-ink/45"
                }`}
              >
                <Icon className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink">{label}</p>
                <p className="text-xs text-ink/60">{description}</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={on}
                aria-label={`${label}: ${on ? "on" : "off"}`}
                disabled={!known || saving !== null}
                onClick={() => toggle(key)}
                className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime focus-visible:ring-offset-2 disabled:opacity-60 ${
                  on ? "bg-ink" : "bg-ink/15"
                }`}
              >
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full shadow-sm transition-transform ${
                    on ? "translate-x-6 bg-lime" : "translate-x-1 bg-white"
                  }`}
                >
                  {busy && <Loader2 className="h-3 w-3 animate-spin text-ink" />}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
