import { Lock } from "lucide-react";

// Shown instead of a page whose extra SmartPOS hasn't turned on for the company.
export default function FeatureOff({ feature }: { feature: string }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-ink/20 bg-white px-6 py-16 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ivory text-ink/50">
        <Lock className="h-6 w-6" />
      </span>
      <p className="mt-3 text-base font-bold text-ink">{feature} is not turned on</p>
      <p className="mt-1 max-w-sm text-sm text-ink/55">It isn&apos;t part of your plan yet. Contact SmartPOS to add it.</p>
    </div>
  );
}
