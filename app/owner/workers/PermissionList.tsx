"use client";

import { Badge } from "@/app/owner/components/ui";
import { PERMISSION_GROUPS, permissionLabel, withRequirements, withoutDependents } from "@/app/owner/permissions";

export const ALL_KEYS = PERMISSION_GROUPS.flatMap((g) => g.permissions.map((p) => p.key));

// Every switch, grouped as in the app. Turning one on turns on what it needs;
// turning one off turns off what depends on it. With `base` (a worker's role),
// switches that differ from it are marked Added or Removed.
export function PermissionList({ value, onChange, base }: { value: Set<string>; onChange: (next: Set<string>) => void; base?: Set<string> }) {
  const toggle = (key: string) => onChange(value.has(key) ? withoutDependents(value, key) : withRequirements([...value, key]));
  return (
    <div className="space-y-4">
      {PERMISSION_GROUPS.map((group) => (
        <div key={group.title} className="rounded-2xl border border-ink/10 bg-white shadow-[0_1px_2px_rgba(32,40,59,0.04)]">
          <p className="border-b border-ink/8 px-4 py-2.5 text-xs font-bold uppercase tracking-[0.15em] text-ink/50">{group.title}</p>
          <ul className="divide-y divide-ink/6">
            {group.permissions.map((p) => {
              const on = value.has(p.key);
              const added = base && on && !base.has(p.key);
              const removed = base && !on && base.has(p.key);
              return (
                <li key={p.key}>
                  <button type="button" role="switch" aria-checked={on} onClick={() => toggle(p.key)} className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-ivory/60">
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2 text-sm font-semibold text-ink">
                        {p.label}
                        {p.sensitive && <Badge>Sensitive</Badge>}
                        {added && <Badge tone="lime">Added</Badge>}
                        {removed && <Badge tone="danger">Removed</Badge>}
                      </span>
                      <span className="block text-xs text-ink/55">{p.description}</span>
                      {p.requires && <span className="block text-[11px] text-ink/40">Also turns on: {p.requires.map(permissionLabel).join(", ")}</span>}
                    </span>
                    <span className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${on ? "bg-ink" : "bg-ink/15"}`}>
                      <span className={`h-4.5 w-4.5 rounded-full shadow-sm transition-transform ${on ? "translate-x-5.5 bg-lime" : "translate-x-1 bg-white"}`} />
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
