"use client";

import { useState } from "react";
import { Building2, CheckCircle2, Clock, Copy, Loader2, MonitorSmartphone, RotateCw, ShieldAlert } from "lucide-react";
import toast from "react-hot-toast";
import {
  browserDevice,
  checkBrowserDevice,
  requestBrowserDevice,
  type BrowserDeviceStatus,
} from "@/stores/device/browserDevice";

// Shown when an owner signs in on a browser SmartPOS hasn't approved: ask the
// company to approve it, then wait. Approval happens in the app (Settings →
// Devices) or by SmartPOS.
export default function DeviceAccess({
  status,
  onStatus,
}: {
  status: BrowserDeviceStatus;
  onStatus: (status: BrowserDeviceStatus) => void;
}) {
  const { deviceId, deviceName } = browserDevice();
  const [companyCode, setCompanyCode] = useState("");
  const [sending, setSending] = useState(false);
  const [checking, setChecking] = useState(false);

  const request = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      await requestBrowserDevice(companyCode);
      toast.success("Request sent");
      onStatus("PENDING");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send the request");
    } finally {
      setSending(false);
    }
  };

  const checkAgain = async () => {
    setChecking(true);
    try {
      const next = await checkBrowserDevice(deviceId);
      onStatus(next);
      if (next === "REGISTERED") toast.success("This browser is approved. Sign in now.");
      else if (next === "PENDING" || next === "REQUESTED") toast("Still waiting for approval", { icon: "⏳" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not check");
    } finally {
      setChecking(false);
    }
  };

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(deviceId);
      toast.success("Device ID copied");
    } catch {
      /* clipboard unavailable */
    }
  };

  const idChip = (
    <button
      type="button"
      onClick={copyId}
      className="inline-flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1 font-mono text-xs font-semibold text-ink ring-1 ring-inset ring-ink/12 hover:bg-ivory"
    >
      {deviceId}
      <Copy className="h-3 w-3 text-ink/45" />
    </button>
  );

  if (status === "REGISTERED") {
    return (
      <div className="mb-6 flex items-start gap-3 rounded-2xl bg-lime/30 p-4 ring-1 ring-inset ring-lime">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-ink" />
        <div className="text-sm text-ink">
          <p className="font-bold">This browser is approved</p>
          <p className="mt-0.5 text-ink/70">Sign in below with your email and password.</p>
        </div>
      </div>
    );
  }

  if (status === "DISABLED") {
    return (
      <div className="mb-6 flex items-start gap-3 rounded-2xl bg-rose-50 p-4 ring-1 ring-inset ring-rose-200">
        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
        <div className="text-sm text-ink">
          <p className="font-bold">This browser was disabled</p>
          <p className="mt-0.5 text-ink/70">
            Ask SmartPOS or enable it again in the app (Settings → Devices). Device {idChip}
          </p>
        </div>
      </div>
    );
  }

  if (status === "PENDING" || status === "REQUESTED") {
    return (
      <div className="mb-6 rounded-2xl bg-ivory p-5 ring-1 ring-inset ring-ink/12">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ink text-lime">
            <Clock className="h-5 w-5" />
          </span>
          <div className="min-w-0 text-sm">
            <p className="font-bold text-ink">Waiting for approval</p>
            <p className="mt-1 text-ink/65">
              Approve <b>{deviceName}</b> in the SmartPOS app under <b>Settings → Devices</b>, or ask SmartPOS to approve it.
            </p>
            <p className="mt-3 flex flex-wrap items-center gap-2 text-xs text-ink/60">Device {idChip}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={checkAgain}
          disabled={checking}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white py-2.5 text-sm font-semibold text-ink ring-1 ring-inset ring-ink/15 hover:bg-ink hover:text-lime disabled:opacity-60"
        >
          {checking ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCw className="h-4 w-4" />}
          I approved it, check again
        </button>
      </div>
    );
  }

  // UNKNOWN or REJECTED: ask to join.
  return (
    <form onSubmit={request} className="mb-6 rounded-2xl bg-ivory p-5 ring-1 ring-inset ring-ink/12">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ink text-lime">
          <MonitorSmartphone className="h-5 w-5" />
        </span>
        <div className="text-sm">
          <p className="font-bold text-ink">{status === "REJECTED" ? "This browser was not approved" : "Approve this browser first"}</p>
          <p className="mt-1 text-ink/65">
            For your security, owners sign in only on approved devices. Enter your company code to ask for approval.
          </p>
        </div>
      </div>
      <label htmlFor="companyCode" className="mt-4 mb-2 block text-xs font-semibold text-ink">
        Company code
      </label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Building2 className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" />
          <input
            id="companyCode"
            required
            value={companyCode}
            onChange={(e) => setCompanyCode(e.target.value.toUpperCase())}
            placeholder="e.g. A1B2C3"
            className="h-11 w-full rounded-xl border border-ink/15 bg-white pl-10 pr-3 font-mono text-sm tracking-widest text-ink outline-none focus:border-ink focus:ring-4 focus:ring-lime/40"
          />
        </div>
        <button
          type="submit"
          disabled={sending || !companyCode.trim()}
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-ink px-4 text-sm font-bold text-white hover:bg-ink-soft disabled:opacity-60"
        >
          {sending && <Loader2 className="h-4 w-4 animate-spin" />}
          Ask
        </button>
      </div>
      <p className="mt-2 text-[11px] text-ink/50">The code is on your company profile in the app (Settings → Profile).</p>
    </form>
  );
}
