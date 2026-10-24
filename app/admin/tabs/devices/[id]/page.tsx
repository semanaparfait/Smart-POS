"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowUpRight,
  Ban,
  BellRing,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Cpu,
  Fingerprint,
  Hash,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Power,
  RotateCw,
  Trash2,
  X,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import useDeviceStore from "@/stores/device/devicestore";
import { RegistrationStatusEnum, type DeviceByIdResponse } from "@/stores/device/devicetypes";
import {
  CompanyBadge,
  StatusPill,
  formatDate,
  isAwaiting,
  platformOf,
  statusOf,
} from "@/app/admin/tabs/devices/components/FetchDevices";
import { industryOf } from "@/app/admin/tabs/companies/components/FetchCompany";

type Action = "approve" | "reject" | "enable" | "disable" | "delete";
type LoadState = "loading" | "ready" | "error";

const ACTIONS: Record<
  Action,
  { title: string; text: (name: string) => string; confirm: string; working: string; done: string; icon: LucideIcon; tone: "dark" | "danger" | "warn" }
> = {
  approve: {
    title: "Approve this device?",
    text: (n) => `${n} will be registered and can start processing sales for its business.`,
    confirm: "Approve device",
    working: "Approving…",
    done: "Device approved",
    icon: CheckCircle2,
    tone: "dark",
  },
  reject: {
    title: "Reject this device?",
    text: (n) => `${n} will not be allowed to use SmartPOS. Do this for devices you don't recognise.`,
    confirm: "Reject device",
    working: "Rejecting…",
    done: "Device rejected",
    icon: XCircle,
    tone: "danger",
  },
  enable: {
    title: "Enable this device?",
    text: (n) => `${n} will be able to process sales again.`,
    confirm: "Enable device",
    working: "Enabling…",
    done: "Device enabled",
    icon: Power,
    tone: "dark",
  },
  disable: {
    title: "Disable this device?",
    text: (n) => `${n} will stop processing sales until you enable it again.`,
    confirm: "Disable device",
    working: "Disabling…",
    done: "Device disabled",
    icon: Ban,
    tone: "warn",
  },
  delete: {
    title: "Delete this device?",
    text: (n) => `${n} will be permanently removed. This cannot be undone.`,
    confirm: "Delete permanently",
    working: "Deleting…",
    done: "Device deleted",
    icon: Trash2,
    tone: "danger",
  },
};

const TONE = {
  dark: { icon: "bg-ink/6 text-ink/80", button: "bg-ink hover:bg-ink/90" },
  warn: { icon: "bg-amber-50 text-amber-700", button: "bg-amber-600 hover:bg-amber-700" },
  danger: { icon: "bg-rose-50 text-rose-600", button: "bg-rose-600 hover:bg-rose-700" },
};

export default function DeviceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const fetchDeviceById = useDeviceStore((s) => s.fetchDeviceById);
  const registerDevice = useDeviceStore((s) => s.registerDevice);
  const enableDevice = useDeviceStore((s) => s.enableDevice);
  const disableDevice = useDeviceStore((s) => s.disableDevice);
  const deleteDevice = useDeviceStore((s) => s.deleteDevice);

  const [device, setDevice] = useState<DeviceByIdResponse | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [errorText, setErrorText] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [pending, setPending] = useState<Action | null>(null);
  const [working, setWorking] = useState(false);
  const [copied, setCopied] = useState("");

  useEffect(() => {
    if (!id) return;
    let alive = true;
    fetchDeviceById(id)
      .then((data) => {
        if (!alive) return;
        if (data) {
          setDevice(data);
          setLoadState("ready");
        } else {
          setErrorText("Please sign in again to view this device.");
          setLoadState("error");
        }
      })
      .catch((err: unknown) => {
        if (!alive) return;
        setErrorText(err instanceof Error ? err.message : "Failed to load the device.");
        setLoadState("error");
      });
    return () => {
      alive = false;
    };
  }, [id, fetchDeviceById, attempt]);

  // Escape closes the confirmation dialog
  useEffect(() => {
    if (!pending) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !working && setPending(null);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [pending, working]);

  const retry = () => {
    setLoadState("loading");
    setAttempt((n) => n + 1);
  };

  const copy = async (key: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      setTimeout(() => setCopied((c) => (c === key ? "" : c)), 1800);
    } catch {
      /* clipboard unavailable */
    }
  };

  const runAction = async () => {
    if (!pending || !id) return;
    setWorking(true);
    try {
      if (pending === "approve" || pending === "reject") await registerDevice(id, pending === "approve" ? "APPROVE" : "REJECT");
      if (pending === "enable") await enableDevice(id);
      if (pending === "disable") await disableDevice(id);
      if (pending === "delete") {
        await deleteDevice(id);
        toast.success(ACTIONS.delete.done);
        router.push("/admin/tabs/devices");
        return;
      }
      toast.success(ACTIONS[pending].done);
      // Reload so the page shows exactly what the server saved
      const fresh = await fetchDeviceById(id);
      if (fresh) setDevice(fresh);
      setPending(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setWorking(false);
    }
  };

  const backLink = (
    <Link href="/admin/tabs/devices" className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-ink/60 transition-colors hover:text-ink">
      <ArrowLeft className="h-4 w-4" />
      POS devices
    </Link>
  );

  if (loadState === "loading") {
    return (
      <div className="space-y-6" aria-busy="true">
        {backLink}
        <div className="h-36 animate-pulse rounded-2xl border border-ink/12 bg-white" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="h-80 animate-pulse rounded-2xl bg-white lg:col-span-2" />
          <div className="h-80 animate-pulse rounded-2xl bg-white" />
        </div>
      </div>
    );
  }

  if (loadState === "error" || !device) {
    return (
      <div className="space-y-6">
        {backLink}
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-ink/25 bg-white px-6 py-14 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-500">
            <AlertTriangle className="h-6 w-6" />
          </span>
          <h1 className="mt-4 text-base font-bold text-ink">Couldn&apos;t load this device</h1>
          <p className="mt-1 max-w-sm text-sm text-ink/60">{errorText || "The device may have been removed."}</p>
          <button type="button" onClick={retry} className="mt-5 inline-flex items-center gap-2 rounded-lg bg-lime px-4 py-2 text-sm font-semibold text-ink hover:bg-lime-dark">
            <RotateCw className="h-4 w-4" />
            Try again
          </button>
        </div>
      </div>
    );
  }

  const name = device.deviceName || "Unnamed device";
  const platform = platformOf(device.deviceOs, device.deviceName);
  const PlatformIcon = platform.icon;
  const status = device.registrationStatus;
  const awaiting = isAwaiting(status);
  const company = device.company;
  const industry = company ? industryOf(company.type) : null;

  // Main actions depend on the current status
  const primaryActions: { action: Action; label: string; icon: LucideIcon; style: "dark" | "outline" | "danger" }[] = awaiting
    ? [
        { action: "reject", label: "Reject", icon: X, style: "danger" },
        { action: "approve", label: "Approve", icon: Check, style: "dark" },
      ]
    : status === RegistrationStatusEnum.REGISTERED
      ? [{ action: "disable", label: "Disable", icon: Ban, style: "outline" }]
      : status === RegistrationStatusEnum.DISABLED
        ? [{ action: "enable", label: "Enable", icon: Power, style: "dark" }]
        : status === RegistrationStatusEnum.REJECTED
          ? [{ action: "approve", label: "Approve instead", icon: Check, style: "dark" }]
          : [];

  const buttonStyle = {
    dark: "bg-ink text-white shadow-md shadow-ink/15 hover:bg-ink/90",
    outline: "text-ink/80 ring-1 ring-inset ring-ink/12 hover:bg-ivory hover:text-ink",
    danger: "text-rose-600 ring-1 ring-inset ring-rose-200 hover:bg-rose-50",
  };

  const details: { key: string; label: string; value: string; icon: LucideIcon; mono?: boolean; copy?: boolean }[] = [
    { key: "name", label: "Device name", value: name, icon: PlatformIcon },
    { key: "deviceId", label: "Device ID", value: device.deviceId, icon: Hash, mono: true, copy: true },
    { key: "os", label: "Operating system", value: device.deviceOs || "Unknown", icon: Cpu },
    { key: "platform", label: "Platform", value: platform.label, icon: PlatformIcon },
    { key: "created", label: "Added", value: formatDate(device.createdAt, true), icon: Calendar },
    { key: "updated", label: "Last updated", value: formatDate(device.updatedAt, true), icon: Clock },
  ];

  const config = pending ? ACTIONS[pending] : null;
  const ConfigIcon = config?.icon;

  return (
    <div className="space-y-6 pb-10">
      {backLink}

      {/* Header */}
      <section className="rounded-2xl border border-ink/12 bg-white p-6 shadow-xs">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <span
              className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl ${
                status === RegistrationStatusEnum.REGISTERED ? "bg-ink text-lime shadow-lg shadow-ink/20" : "bg-ink/6 text-ink/60"
              }`}
            >
              <PlatformIcon className="h-8 w-8" strokeWidth={1.7} />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="truncate text-2xl font-bold tracking-[-0.02em] text-ink">{name}</h1>
                <StatusPill status={status} />
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-ink/60">
                <button
                  type="button"
                  onClick={() => copy("deviceId", device.deviceId)}
                  title="Copy device ID"
                  className="inline-flex max-w-full items-center gap-1.5 rounded-md bg-ivory px-2 py-0.5 font-mono text-xs font-semibold text-ink/80 ring-1 ring-inset ring-ink/12 transition-colors hover:bg-ink/6"
                >
                  <span className="truncate">{device.deviceId}</span>
                  {copied === "deviceId" ? <Check className="h-3 w-3 shrink-0" /> : <Copy className="h-3 w-3 shrink-0 text-ink/45" />}
                </button>
                <span>{device.deviceOs || platform.label}</span>
                {company?.name && (
                  <Link href={`/admin/tabs/companies/${company.id}`} className="font-medium text-ink/80 hover:text-ink hover:underline">
                    {company.name}
                  </Link>
                )}
              </div>
            </div>
          </div>

          {primaryActions.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {primaryActions.map(({ action, label, icon: Icon, style }) => (
                <button
                  key={action}
                  type="button"
                  onClick={() => setPending(action)}
                  className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${buttonStyle[style]}`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        {awaiting && (
          <div className="mt-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/70 p-4">
            <BellRing className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
            <p className="text-sm text-amber-900">
              <span className="font-semibold">This device is waiting for approval.</span> Check that it belongs to{" "}
              {company?.name || "the business"} before approving it.
            </p>
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Device details */}
        <section className="rounded-2xl border border-ink/12 bg-white shadow-xs lg:col-span-2">
          <header className="border-b border-ink/6 px-6 py-4">
            <h2 className="text-sm font-bold text-ink">Device details</h2>
          </header>
          <dl className="grid grid-cols-1 sm:grid-cols-2">
            {details.map(({ key, label, value, icon: Icon, mono, copy: canCopy }, i) => (
              <div
                key={key}
                className={`group flex items-start gap-3.5 px-6 py-5 ${i >= 1 ? "border-t border-ink/6" : ""} ${
                  i === 1 ? "sm:border-t-0" : ""
                } ${i % 2 === 1 ? "sm:border-l" : ""}`}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ink/6 text-ink/60">
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <dt className="text-xs font-semibold text-ink/45">{label}</dt>
                  <dd className="mt-0.5 flex items-center gap-2">
                    <span className={`truncate text-sm font-semibold text-ink ${mono ? "font-mono text-[13px]" : ""}`}>{value}</span>
                    {canCopy && (
                      <button
                        type="button"
                        onClick={() => copy(key, value)}
                        aria-label={`Copy ${label.toLowerCase()}`}
                        className="rounded p-1 text-ink/25 opacity-0 transition hover:bg-ink/6 hover:text-ink/80 focus:opacity-100 group-hover:opacity-100"
                      >
                        {copied === key ? <Check className="h-3.5 w-3.5 text-ink" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    )}
                  </dd>
                </div>
              </div>
            ))}
          </dl>

          {/* Status history from the record dates */}
          <div className="border-t border-ink/6 px-6 py-5">
            <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-ink/45">Status</h3>
            <ol className="mt-4 space-y-4">
              <li className="relative flex gap-3 pl-0.5">
                <span className="absolute left-[7px] top-5 h-[calc(100%+4px)] w-px bg-ink/12" aria-hidden="true" />
                <span className="relative mt-1 h-3.5 w-3.5 shrink-0 rounded-full border-2 border-ink/25 bg-white" />
                <div>
                  <p className="text-sm font-semibold text-ink">Registration requested</p>
                  <p className="text-xs text-ink/60">{formatDate(device.createdAt, true)}</p>
                </div>
              </li>
              <li className="flex gap-3 pl-0.5">
                <span className={`mt-1 h-3.5 w-3.5 shrink-0 rounded-full ring-4 ring-ink/6 ${statusOf(status).dot}`} />
                <div>
                  <p className="text-sm font-semibold text-ink">Now {statusOf(status).label.toLowerCase()}</p>
                  <p className="text-xs text-ink/60">Last change {formatDate(device.updatedAt, true)}</p>
                </div>
              </li>
            </ol>
          </div>
        </section>

        <aside className="space-y-6">
          {/* Business */}
          <section className="rounded-2xl border border-ink/12 bg-white shadow-xs">
            <header className="border-b border-ink/6 px-6 py-4">
              <h2 className="text-sm font-bold text-ink">Business</h2>
            </header>
            {company ? (
              <div className="p-6">
                <div className="flex items-center gap-3">
                  <CompanyBadge name={company.name} logo={company.logo} size="h-12 w-12 text-sm" />
                  <div className="min-w-0">
                    <p className="truncate font-bold text-ink">{company.name}</p>
                    <p className="mt-0.5 flex items-center gap-2 text-xs text-ink/60">
                      {industry && <span>{industry.label}</span>}
                      {company.code && <span className="font-mono">{company.code}</span>}
                    </p>
                  </div>
                </div>
                <dl className="mt-5 space-y-3 text-[13px]">
                  {[
                    { icon: MapPin, value: company.location, label: "Location" },
                    { icon: Mail, value: company.email, label: "Email", href: company.email ? `mailto:${company.email}` : "" },
                    { icon: Phone, value: company.phone_number ? String(company.phone_number) : "", label: "Phone" },
                  ].map(({ icon: Icon, value, label, href }) => (
                    <div key={label} className="flex items-center gap-2.5">
                      <dt className="sr-only">{label}</dt>
                      <Icon className="h-4 w-4 shrink-0 text-ink/45" />
                      <dd className={`truncate ${value ? "text-ink/80" : "italic text-ink/45"}`}>
                        {value && href ? <a href={href} className="hover:underline">{value}</a> : value || "Not provided"}
                      </dd>
                    </div>
                  ))}
                </dl>
                <Link
                  href={`/admin/tabs/companies/${company.id}`}
                  className="mt-5 flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold text-ink/80 ring-1 ring-inset ring-ink/12 transition-colors hover:bg-ivory hover:text-ink"
                >
                  View business <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <p className="p-6 text-sm text-ink/60">This device isn&apos;t linked to a business.</p>
            )}
          </section>

          {/* Record */}
          <section className="rounded-2xl border border-ink/12 bg-white px-6 py-4 shadow-xs">
            <div className="flex items-start gap-3">
              <Fingerprint className="mt-0.5 h-4 w-4 shrink-0 text-ink/45" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-ink/45">Internal record ID</p>
                <div className="mt-1 flex items-center gap-2">
                  <code className="min-w-0 flex-1 truncate rounded-md bg-ivory px-2 py-1 font-mono text-[11px] text-ink/70 ring-1 ring-inset ring-ink/12">
                    {device.id}
                  </code>
                  <button
                    type="button"
                    onClick={() => copy("id", device.id)}
                    aria-label="Copy internal record ID"
                    className="rounded-md p-1.5 text-ink/45 transition-colors hover:bg-ink/6 hover:text-ink"
                  >
                    {copied === "id" ? <Check className="h-3.5 w-3.5 text-ink" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Danger zone */}
          <section className="rounded-2xl border border-rose-200/80 bg-white p-6 shadow-xs">
            <h2 className="text-sm font-bold text-ink">Delete device</h2>
            <p className="mt-1 text-xs leading-relaxed text-ink/60">
              Permanently remove this device from SmartPOS. It will need to request registration again.
            </p>
            <button
              type="button"
              onClick={() => setPending("delete")}
              className="mt-4 inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold text-rose-600 ring-1 ring-inset ring-rose-200 transition-colors hover:bg-rose-50"
            >
              <Trash2 className="h-4 w-4" />
              Delete device
            </button>
          </section>
        </aside>
      </div>

      {/* Confirmation dialog */}
      {config && ConfigIcon && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/50 p-4 backdrop-blur-sm"
          onPointerDown={(e) => e.target === e.currentTarget && !working && setPending(null)}
        >
          <div role="alertdialog" aria-modal="true" aria-labelledby="device-action-title" className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-start gap-4 p-6">
              <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${TONE[config.tone].icon}`}>
                <ConfigIcon className="h-5 w-5" />
              </span>
              <div>
                <h2 id="device-action-title" className="text-base font-bold text-ink">{config.title}</h2>
                <p className="mt-1 text-sm leading-relaxed text-ink/60">{config.text(name)}</p>
              </div>
            </div>
            <div className="flex justify-end gap-2.5 border-t border-ink/6 bg-ivory/70 px-6 py-4">
              <button
                type="button"
                disabled={working}
                onClick={() => setPending(null)}
                className="rounded-lg px-4 py-2 text-sm font-semibold text-ink/80 ring-1 ring-inset ring-ink/12 transition-colors hover:bg-white disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={working}
                onClick={runAction}
                autoFocus
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors disabled:opacity-70 ${TONE[config.tone].button}`}
              >
                {working && <Loader2 className="h-4 w-4 animate-spin" />}
                {working ? config.working : config.confirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
