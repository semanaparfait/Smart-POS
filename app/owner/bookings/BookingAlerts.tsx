"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AlarmClock, Hourglass, X } from "lucide-react";
import { useOwnerData } from "@/stores/owner/api";
import { rwf } from "@/app/owner/components/ui";
import { BOOKINGS, runningTotal, timeOf, type Booking } from "@/app/owner/services/services";
import { beep } from "@/app/owner/bookings/useNow";

// Warns when a booking's time is nearly up and when it is up, on every owner
// page, as the app does: five minutes before it beeps a few times; at the end it
// keeps ringing until someone looks.
const WARN_BEFORE_MS = 5 * 60_000;
const CHECK_EVERY_MS = 15_000;
const FETCH_EVERY_MS = 60_000;
const RING_EVERY_MS = 2_000;
const SOON_BEEPS = 3;
const DISMISSED_KEY = "smartpos.bookingAlerts.dismissed.v1";

type Stage = "soon" | "over";
const keyOf = (id: string, stage: Stage) => `${id}:${stage}`;

const readDismissed = () => {
  try {
    return new Set<string>(JSON.parse(localStorage.getItem(DISMISSED_KEY) ?? "[]"));
  } catch {
    return new Set<string>();
  }
};
const saveDismissed = (set: Set<string>) => {
  try {
    localStorage.setItem(DISMISSED_KEY, JSON.stringify([...set]));
  } catch {
    /* storage blocked */
  }
};

export default function BookingAlerts() {
  const { data, reload } = useOwnerData<Booking[]>("/bookings?status=ACTIVE");
  const [now, setNow] = useState(() => Date.now());
  const [dismissed, setDismissed] = useState<Set<string>>(readDismissed);
  const beeped = useRef(new Set<string>());

  useEffect(() => {
    const fetchTimer = setInterval(reload, FETCH_EVERY_MS);
    const clock = setInterval(() => setNow(Date.now()), CHECK_EVERY_MS);
    return () => {
      clearInterval(fetchTimer);
      clearInterval(clock);
    };
  }, [reload]);

  const alerts = useMemo(
    () =>
      (data ?? [])
        .filter((b) => b.status === "ACTIVE" && b.endAt)
        .map((booking) => {
          const end = new Date(booking.endAt!).getTime();
          const stage: Stage | null = now >= end ? "over" : now >= end - WARN_BEFORE_MS ? "soon" : null;
          return stage ? { key: keyOf(booking.id, stage), stage, booking } : null;
        })
        .filter((a): a is { key: string; stage: Stage; booking: Booking } => !!a && !dismissed.has(a.key))
        .sort((a, b) => new Date(a.booking.endAt!).getTime() - new Date(b.booking.endAt!).getTime()),
    [data, now, dismissed],
  );

  const ringing = alerts.some((a) => a.stage === "over");
  useEffect(() => {
    if (!ringing) return;
    beep();
    const timer = setInterval(beep, RING_EVERY_MS);
    return () => clearInterval(timer);
  }, [ringing]);

  // A few beeps only, once per booking.
  const soonKeys = alerts.filter((a) => a.stage === "soon").map((a) => a.key).join(",");
  useEffect(() => {
    if (ringing || !soonKeys) return;
    const fresh = soonKeys.split(",").filter((key) => !beeped.current.has(key));
    if (!fresh.length) return;
    fresh.forEach((key) => beeped.current.add(key));
    for (let i = 0; i < SOON_BEEPS; i++) setTimeout(beep, i * RING_EVERY_MS);
  }, [soonKeys, ringing]);

  const dismiss = (key: string) => {
    const next = new Set(dismissed).add(key);
    // Seen the end: the five-minute warning is no longer needed either.
    if (key.endsWith(":over")) next.add(key.replace(":over", ":soon"));
    setDismissed(next);
    saveDismissed(next);
  };

  if (!alerts.length) return null;
  return (
    <div className="fixed bottom-4 right-4 z-40 flex w-[min(360px,calc(100vw-2rem))] flex-col gap-2.5">
      {alerts.map(({ key, stage, booking }) => {
        const over = stage === "over";
        const minutesLeft = Math.max(1, Math.ceil((new Date(booking.endAt!).getTime() - now) / 60_000));
        return (
          <div key={key} role="alert" className={`rounded-2xl p-4 shadow-[0_8px_24px_rgba(32,40,59,0.18)] ${over ? "bg-rose-600 text-white" : "bg-white text-ink ring-1 ring-ink/10"}`}>
            <div className="flex items-start gap-3">
              {over ? <AlarmClock className="mt-0.5 h-5 w-5 shrink-0" /> : <Hourglass className="mt-0.5 h-5 w-5 shrink-0 text-ink/60" />}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-extrabold">{over ? "Time is up" : `Ends in ${minutesLeft} min`}</p>
                <p className="truncate text-sm font-semibold">
                  {booking.service.name}
                  {booking.unit ? ` · ${booking.unit.name}` : ""}
                </p>
                <p className={`truncate text-xs ${over ? "text-white/80" : "text-ink/55"}`}>
                  {booking.customerName} · Until {timeOf(booking.endAt!)} · {rwf(runningTotal(booking, new Date(now)).total)}
                </p>
              </div>
              <button type="button" onClick={() => dismiss(key)} aria-label="Dismiss" className={`flex h-7 w-7 items-center justify-center rounded-lg ${over ? "hover:bg-white/15" : "text-ink/45 hover:bg-ivory"}`}>
                <X className="h-4 w-4" />
              </button>
            </div>
            <Link
              href={`${BOOKINGS}/${booking.id}`}
              onClick={() => dismiss(key)}
              className={`mt-3 flex h-9 items-center justify-center rounded-xl text-sm font-bold ${over ? "bg-white text-rose-700" : "bg-ink text-white"}`}
            >
              Open booking
            </Link>
          </div>
        );
      })}
    </div>
  );
}
