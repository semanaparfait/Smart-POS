import { create } from "zustand";
import { API_URL } from "@/config/api";
import type {
  DeviceType,
  DeviceByIdResponse,
} from "@/stores/device/devicetypes";
import useAuthStore from "@/stores/auth/authstore";

const getAuthToken = (): string | null => {
  return useAuthStore.getState().token || localStorage.getItem("accessToken");
};

export type RegistrationAction = "APPROVE" | "REJECT";

/** Calls the devices API; throws with the server's message when the request fails */
async function request<T>(path: string, method = "GET", body?: unknown): Promise<T | null> {
  if (!API_URL) throw new Error("API_URL is not defined");

  const token = getAuthToken();
  if (!token) {
    console.warn(`No access token found. Postponing ${method} ${path}.`);
    return null;
  }

  const response = await fetch(`${API_URL}/api/v1/devices${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = data?.message;
    throw new Error(
      (Array.isArray(message) ? message.join(", ") : message) || `Request failed (${response.status})`,
    );
  }

  return (data?.data ?? data) as T;
}

const useDeviceStore = create<{
  devices: DeviceType[];
  fetchDevices: () => Promise<void>;
  fetchDeviceById: (id: string) => Promise<DeviceByIdResponse | null>;
  registerDevice: (id: string, action: RegistrationAction) => Promise<DeviceByIdResponse | null>;
  enableDevice: (id: string) => Promise<DeviceByIdResponse | null>;
  disableDevice: (id: string) => Promise<DeviceByIdResponse | null>;
  deleteDevice: (id: string) => Promise<DeviceByIdResponse | null>;
}>((set) => ({
  devices: [],

  fetchDevices: async () => {
    const data = await request<DeviceType[]>("");
    if (data !== null) set({ devices: Array.isArray(data) ? data : [] });
  },

  fetchDeviceById: (id) => request<DeviceByIdResponse>(`/${id}`),

  registerDevice: (id, action) => request<DeviceByIdResponse>(`/${id}/registration`, "PATCH", { action }),

  enableDevice: (id) => request<DeviceByIdResponse>(`/${id}/enable`, "PATCH"),

  disableDevice: (id) => request<DeviceByIdResponse>(`/${id}/disable`, "PATCH"),

  deleteDevice: async (id) => {
    const result = await request<DeviceByIdResponse>(`/${id}/delete`, "DELETE");
    set((state) => ({ devices: state.devices.filter((d) => d.id !== id) }));
    return result;
  },
}));

export default useDeviceStore;
