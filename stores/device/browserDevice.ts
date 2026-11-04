import { API_URL } from "@/config/api";

// Owners sign in only on a device SmartPOS approved, and on the website that
// device is this browser. It keeps one id for good, like a till does.

const STORAGE_KEY = "smartpos.webDeviceId";

export type BrowserDeviceStatus = "REGISTERED" | "PENDING" | "REQUESTED" | "REJECTED" | "DISABLED" | "UNKNOWN";

export interface BrowserDevice {
  deviceId: string;
  deviceName: string;
  deviceOs: string;
}

const randomCode = () => {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
};

const browserName = (agent: string) =>
  /Edg\//.test(agent) ? "Edge" : /Chrome\//.test(agent) ? "Chrome" : /Firefox\//.test(agent) ? "Firefox" : /Safari\//.test(agent) ? "Safari" : "Browser";

const systemName = (agent: string) =>
  /Windows/.test(agent) ? "Windows" : /Mac OS/.test(agent) ? "macOS" : /Android/.test(agent) ? "Android" : /iPhone|iPad/.test(agent) ? "iOS" : /Linux/.test(agent) ? "Linux" : "Web";

export function browserDevice(): BrowserDevice {
  let deviceId = localStorage.getItem(STORAGE_KEY);
  if (!deviceId) {
    deviceId = `SITE-${randomCode()}`;
    localStorage.setItem(STORAGE_KEY, deviceId);
  }
  const agent = navigator.userAgent;
  return {
    deviceId,
    deviceName: `Website · ${browserName(agent)} on ${systemName(agent)}`,
    deviceOs: `${systemName(agent)} web`,
  };
}

// Where this browser stands with SmartPOS. UNKNOWN: it never asked to join.
export async function checkBrowserDevice(deviceId: string): Promise<BrowserDeviceStatus> {
  const response = await fetch(`${API_URL}/api/v1/devices/${encodeURIComponent(deviceId)}/verify`);
  if (response.status === 404) return "UNKNOWN";
  if (!response.ok) throw new Error("Could not reach SmartPOS. Check your connection.");
  const data = await response.json();
  return (data.status as BrowserDeviceStatus) ?? "UNKNOWN";
}

// Asks the company (by its code) to approve this browser.
export async function requestBrowserDevice(companyCode: string) {
  const response = await fetch(`${API_URL}/api/v1/devices/request-registration`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...browserDevice(), companyCode: companyCode.trim() }),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => null);
    const message = Array.isArray(data?.message) ? data.message.join(", ") : data?.message;
    throw new Error(message === "Company not found" ? "No company has that code. Check it and try again." : message || "Could not send the request");
  }
}
