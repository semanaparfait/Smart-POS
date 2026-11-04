"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Activity, ArrowLeft, Calendar, Check, Copy, KeyRound, LogIn, Power, Trash2, Wifi, X } from "lucide-react";
import { ownerRequest, useOwnerData } from "@/stores/owner/api";
import type { Device, DeviceActivity, DeviceKind } from "@/app/owner/types";
import { Card, ErrorState, Skeleton, formatDate, timeAgo } from "@/app/owner/components/ui";
import { Button, TextInput } from "@/app/owner/components/forms";
import { DEVICES, KINDS, STATE_META, deviceState, kindOf } from "@/app/owner/devices/kinds";

const PAGE_SIZE = 20;
const dateTime = (v?: string | null) => (v ? new Date(v).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—");
const titleCase = (v?: string | null) => (v ? v.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase()) : "—");
// "CREATE_ORDER" -> "Create order"; free text is left as it is.
const actionLabel = (a: string) => (/^[A-Z0-9_]+$/.test(a) ? titleCase(a) : a);

function Row({ label, value, mono }: { label: string; value?: string | null; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-4 py-2 text-sm">
      <span className="text-ink/55">{label}</span>
      <span className={`truncate text-right font-semibold text-ink ${mono ? "font-mono text-xs" : ""}`}>{value || "—"}</span>
    </div>
  );
}

function TypePicker({ value, onChange, disabled }: { value: DeviceKind; onChange: (k: DeviceKind) => void; disabled?: boolean }) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {(Object.keys(KINDS) as DeviceKind[]).map((k) => {
        const on = value === k;
        const Icon = KINDS[k].icon;
        return (
          <button
            key={k}
            type="button"
            disabled={disabled}
            onClick={() => onChange(k)}
            aria-pressed={on}
            className={`flex items-center gap-3 rounded-xl p-3 text-left transition-colors disabled:opacity-60 ${on ? "bg-ink text-white" : "bg-white text-ink ring-1 ring-inset ring-ink/12 hover:bg-ivory"}`}
          >
            <Icon className={`h-5 w-5 ${on ? "text-lime" : "text-ink/55"}`} />
            <span>
              <span className="block text-sm font-bold">{KINDS[k].label}</span>
              <span className={`block text-xs ${on ? "text-white/60" : "text-ink/55"}`}>{KINDS[k].text}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

function DeviceView({ device, devices, onChanged }: { device: Device; devices: Device[]; onChanged: () => void }) {
  const router = useRouter();
  const state = deviceState(device);
  const approved = state === "active" || state === "disabled";
  const [pendingType, setPendingType] = useState<DeviceKind>(device.deviceId.startsWith("SITE-") ? "POS_TERMINAL" : kindOf(device));
  const [busy, setBusy] = useState<string | null>(null);
  const savedCode = device.momoCode ?? "";
  const [code, setCode] = useState(savedCode);
  const [secret, setSecret] = useState<{ deviceId: string; deviceSecret: string } | null>(null);
  const [shown, setShown] = useState(PAGE_SIZE);
  const activities = useOwnerData<DeviceActivity[]>(`/devices/${device.id}/activities`);
  const logs = useMemo(() => [...(activities.data ?? [])].sort((a, b) => b.createdAt.localeCompare(a.createdAt)), [activities.data]);
  const today = new Date().toDateString();
  const todayCount = logs.filter((l) => new Date(l.createdAt).toDateString() === today).length;
  const tills = devices.filter((d) => d.id !== device.id && kindOf(d) === "POS_TERMINAL" && deviceState(d) === "active");
  const isDisplay = kindOf(device) === "CUSTOMER_DISPLAY";
  const validCode = code === "" || /^\d{4,12}$/.test(code);

  const run = async <T,>(key: string, path: string, init: RequestInit, done: string) => {
    setBusy(key);
    try {
      const result = await ownerRequest<T>(path, init);
      toast.success(done);
      onChanged();
      return result;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save");
      return null;
    } finally {
      setBusy(null);
    }
  };
  const json = (method: string, body: unknown): RequestInit => ({ method, body: JSON.stringify(body) });
  const setType = (type: DeviceKind, displayForId?: string | null) =>
    run(
      "type",
      `/devices/${device.id}/type`,
      json("PATCH", { type, ...(displayForId !== undefined ? { displayForId } : {}) }),
      displayForId !== undefined && type === kindOf(device) ? (displayForId ? "Till paired" : "Till unpaired") : `${device.deviceName} is now a ${KINDS[type].label.toLowerCase()}`,
    );
  const rotate = async () => {
    const result = await run<{ deviceId: string; deviceSecret: string }>("rotate", `/devices/${device.id}/rotate-secret`, { method: "PATCH" }, "New secret issued");
    if (result?.deviceSecret) setSecret(result);
  };
  const remove = async () => {
    const ok = await run("delete", `/devices/${device.id}/delete`, { method: "DELETE" }, `${device.deviceName} deleted`);
    if (ok !== null) router.push(DEVICES);
  };
  const Icon = KINDS[kindOf(device)].icon;

  return (
    <div className="space-y-6">
      <Link href={DEVICES} className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink/55 hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Devices
      </Link>
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex items-center gap-4">
          <span className={`flex h-14 w-14 items-center justify-center rounded-2xl ${device.online ? "bg-ink text-lime" : "bg-ivory text-ink/50"}`}>
            <Icon className="h-6 w-6" />
          </span>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-ink/45">Settings · Devices</p>
            <h1 className="text-2xl font-extrabold tracking-[-0.02em] text-ink">{device.deviceName}</h1>
            <p className="text-sm text-ink/60">Device status, who is using it and what it has been doing.</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${STATE_META[state].cls}`}>{STATE_META[state].label}</span>
          {state === "pending" ? (
            <>
              <Button tone="danger" icon={X} busy={busy === "reject"} onClick={() => run("reject", `/devices/${device.id}/registration`, json("PATCH", { action: "REJECT" }), `${device.deviceName} rejected`)}>
                Reject
              </Button>
              <Button icon={Check} busy={busy === "approve"} onClick={() => run("approve", `/devices/${device.id}/registration`, json("PATCH", { action: "APPROVE", type: pendingType }), `${device.deviceName} approved`)}>
                Approve as {KINDS[pendingType].label.toLowerCase()}
              </Button>
            </>
          ) : (
            state !== "rejected" && (
              <Button
                tone="outline"
                icon={Power}
                busy={busy === "toggle"}
                onClick={() =>
                  run("toggle", `/devices/${device.id}/${state === "disabled" ? "enable" : "disable"}`, { method: "PATCH" }, state === "disabled" ? `${device.deviceName} enabled` : `${device.deviceName} disabled: blocked from selling`)
                }
              >
                {state === "disabled" ? "Enable device" : "Disable device"}
              </Button>
            )
          )}
          <Button tone="danger" icon={Trash2} busy={busy === "delete"} onClick={remove}>
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { icon: Wifi, label: "Last seen", value: device.online ? "Online now" : timeAgo(device.lastSeenAt), hint: dateTime(device.lastSeenAt) },
          { icon: LogIn, label: "Last login", value: timeAgo(device.lastLoginAt), hint: device.currentUser?.name },
          { icon: Activity, label: "Last activity", value: device.lastActivity ? actionLabel(device.lastActivity) : "None", hint: device.lastActivityAt ? timeAgo(device.lastActivityAt) : undefined },
          { icon: Calendar, label: "Added", value: formatDate(device.createdAt), hint: device.company?.name },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-ink/10 bg-white p-4">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-ink/55">
              <s.icon className="h-3.5 w-3.5" /> {s.label}
            </p>
            <p className="mt-1.5 truncate text-lg font-extrabold text-ink">{s.value}</p>
            {s.hint && <p className="truncate text-[11px] text-ink/45">{s.hint}</p>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <Card title="Device type" description={approved ? "Changing it reopens the device on the matching screens." : "Choose what this device will be used for, then approve it."}>
            <div className="space-y-4 p-5">
              <TypePicker value={approved ? kindOf(device) : pendingType} disabled={busy === "type"} onChange={(t) => (approved ? t !== kindOf(device) && setType(t) : setPendingType(t))} />
              {approved && isDisplay && (
                <div>
                  <p className="mb-1.5 text-xs font-semibold text-ink">Shows the sale of</p>
                  <p className="mb-2 text-xs text-ink/55">{device.displayFor ? "Click another till to switch." : "Not paired yet: the screen stays on the welcome message until you pick a till."}</p>
                  {tills.length === 0 ? (
                    <p className="text-xs text-ink/50">No approved tills yet.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {tills.map((t) => {
                        const on = device.displayFor?.id === t.id;
                        return (
                          <Button key={t.id} small tone={on ? "primary" : "outline"} disabled={busy === "type"} onClick={() => setType("CUSTOMER_DISPLAY", on ? null : t.id)}>
                            {t.deviceName}
                          </Button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>

          {approved && (
            <Card title="MoMo code" description={isDisplay ? "Shown on this screen for customers to pay. Leave empty to use the paired till's code." : "Shown on this till's customer display for customers to pay."}>
              <div className="space-y-2 p-5">
                <div className="flex flex-wrap gap-2">
                  <TextInput
                    inputMode="numeric"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 12))}
                    placeholder="e.g. 445566"
                    className={`max-w-60 ${validCode ? "" : "border-rose-400"}`}
                  />
                  <Button
                    busy={busy === "momo"}
                    disabled={!validCode || code === savedCode}
                    onClick={() => run("momo", `/devices/${device.id}/momo-code`, json("PATCH", { momoCode: code || null }), code ? `MoMo code saved: customers see ${code}` : "MoMo code removed")}
                  >
                    Save
                  </Button>
                  {!!savedCode && (
                    <Button tone="quiet" disabled={busy === "momo"} onClick={() => (setCode(""), run("momo", `/devices/${device.id}/momo-code`, json("PATCH", { momoCode: null }), "MoMo code removed"))}>
                      Remove
                    </Button>
                  )}
                </div>
                {!validCode && <p className="text-xs text-rose-600">Use 4 to 12 digits.</p>}
              </div>
            </Card>
          )}

          <Card title="Activity log" description={`${logs.length} events · ${todayCount} today`}>
            {activities.loading && !activities.data ? (
              <div className="p-5">
                <Skeleton className="h-24" />
              </div>
            ) : logs.length === 0 ? (
              <p className="px-5 py-4 text-sm text-ink/55">No activity yet.</p>
            ) : (
              <>
                <ul className="divide-y divide-ink/6">
                  {logs.slice(0, shown).map((l) => {
                    const bad = (l.statusCode ?? 0) >= 400;
                    return (
                      <li key={l.id} className="flex items-center gap-3 px-5 py-3">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-ink">{actionLabel(l.action)}</p>
                          <p className="truncate text-xs text-ink/55">
                            {l.user?.name ?? "—"} · {dateTime(l.createdAt)}
                            {l.method && l.path ? ` · ${l.method} ${l.path}` : ""}
                          </p>
                        </div>
                        {l.statusCode !== null && (
                          <span className={`rounded-lg px-2 py-0.5 font-mono text-[11px] font-bold ${bad ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"}`}>{l.statusCode}</span>
                        )}
                      </li>
                    );
                  })}
                </ul>
                {logs.length > shown && (
                  <div className="border-t border-ink/6 p-3 text-center">
                    <Button tone="quiet" onClick={() => setShown((n) => n + PAGE_SIZE)}>
                      Show more
                    </Button>
                  </div>
                )}
              </>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          {device.currentUser && (
            <Card title="Signed in">
              <div className="px-5 py-2">
                <Row label="Name" value={device.currentUser.name} />
                <Row label="Role" value={titleCase(device.currentUser.role)} />
                <Row label="Email" value={device.currentUser.email} />
                <Row label="Phone" value={device.currentUser.phone} />
                <Row label="Account" value={device.currentUser.active === false ? "Inactive" : "Active"} />
                <Row label="Last login" value={dateTime(device.currentUser.lastLoginAt)} />
              </div>
            </Card>
          )}
          <Card title="Device">
            <div className="px-5 py-2">
              <Row label="Device ID" value={device.deviceId} mono />
              <Row label="OS" value={device.deviceOs} />
              <Row label="Registration" value={titleCase(device.registrationStatus)} />
              <Row label="Added" value={dateTime(device.createdAt)} />
              <Row label="Last change" value={dateTime(device.updatedAt)} />
            </div>
          </Card>
          {approved && (
            <Card title="Security" description="A new secret stops the old one at once. The device shows offline until the new secret is entered on it.">
              <div className="p-5">
                <Button tone="outline" icon={KeyRound} busy={busy === "rotate"} onClick={rotate}>
                  Rotate device secret
                </Button>
              </div>
            </Card>
          )}
          {secret && (
            <div className="rounded-2xl bg-ink p-5 text-white">
              <p className="text-sm font-bold">New secret for {device.deviceName}</p>
              <p className="mt-1 text-xs text-white/60">Shown only now. Enter it on the device before you leave this page.</p>
              <p className="mt-3 break-all font-mono text-sm text-lime">{secret.deviceSecret}</p>
              <div className="mt-3 flex gap-2">
                <Button
                  small
                  tone="lime"
                  icon={Copy}
                  onClick={() =>
                    navigator.clipboard
                      .writeText(secret.deviceSecret)
                      .then(() => toast.success("Copied"))
                      .catch(() => {})
                  }
                >
                  Copy
                </Button>
                <Button small tone="quiet" className="text-white/70 hover:bg-white/10 hover:text-white" onClick={() => setSecret(null)}>
                  Done
                </Button>
              </div>
            </div>
          )}
          <Card title="Company">
            <div className="px-5 py-2">
              <Row label="Name" value={device.company?.name} />
              <Row label="Code" value={device.company?.code} mono />
              <Row label="Type" value={titleCase(device.company?.type)} />
              <Row label="Location" value={device.company?.location} />
              <Row label="Phone" value={device.company?.phone_number} />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function DevicePage() {
  const { id } = useParams<{ id: string }>();
  // The list holds every field the page shows, and the tills to pair with.
  const { data, loading, error, reload } = useOwnerData<Device[]>("/devices");
  const device = data?.find((d) => d.id === id);
  if (error && !data) return <ErrorState message={error} onRetry={reload} />;
  if (!device) return loading ? <Skeleton className="h-96" /> : <p className="text-sm text-ink/55">This device was not found. It may have been deleted.</p>;
  return <DeviceView key={device.id} device={device} devices={data!} onChanged={reload} />;
}
