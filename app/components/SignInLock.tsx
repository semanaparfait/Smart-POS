"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Loader2, Lock, LockOpen } from "lucide-react";

// After 5 wrong PINs or passwords the server locks a device for a while
// (5, 15, 30, then 60 minutes). Owners and the super admin can unlock it early.

// Milliseconds until `until`, ticking every second; 0 once it has passed.
export function useCountdown(until?: string | number | null) {
  const end = typeof until === "string" ? Date.parse(until) : until ?? 0;
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!end || end <= Date.now()) return;
    const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(tick);
  }, [end]);
  return end ? Math.max(0, end - now) : 0;
}

// 4:59, or 1:04:59 for an hour or more.
export function formatCountdown(ms: number) {
  const total = Math.ceil(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

export const isLocked = (lockedUntil?: string | null) => !!lockedUntil && Date.parse(lockedUntil) > Date.now();

// Small red tag for device lists.
export function LockedTag({ lockedUntil }: { lockedUntil?: string | null }) {
  if (!isLocked(lockedUntil)) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-bold text-red-700 ring-1 ring-inset ring-red-200">
      <Lock className="h-3 w-3" /> Locked
    </span>
  );
}

// On a device page while it is locked: the countdown and one tap to unlock.
export function SignInLockCard({
  deviceName,
  lockedUntil,
  failedSignIns,
  onUnlock,
}: {
  deviceName: string;
  lockedUntil?: string | null;
  failedSignIns?: number | null;
  // Calls PATCH /devices/:id/unlock and reloads; throws the server's message.
  onUnlock: () => Promise<unknown>;
}) {
  const remaining = useCountdown(lockedUntil);
  const [busy, setBusy] = useState(false);
  if (remaining <= 0) return null;

  const unlock = async () => {
    setBusy(true);
    try {
      await onUnlock();
      toast.success(`${deviceName} unlocked: staff can sign in again`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not unlock");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-red-200 bg-white p-5 sm:flex-row sm:items-center">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
        <Lock className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-ink">Sign-in locked</p>
        <p className="text-xs text-ink/60">
          {failedSignIns ? `${failedSignIns} wrong PINs or passwords. ` : "Too many wrong tries. "}
          Opens by itself in <span className="font-bold tabular-nums text-ink">{formatCountdown(remaining)}</span>
        </p>
      </div>
      <button
        type="button"
        onClick={unlock}
        disabled={busy}
        className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-ink px-4 text-sm font-bold text-white transition hover:bg-ink-soft disabled:opacity-60"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin text-lime" /> : <LockOpen className="h-4 w-4 text-lime" />}
        Unlock now
      </button>
    </section>
  );
}
