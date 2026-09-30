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

type RegistrationAction = "APPROVE" | "REJECT";

const useDeviceStore = create<{
  devices: DeviceType[];
  fetchDevices: () => Promise<void>;
}>((set, get) => ({
  devices: [],
  fetchDevices: async () => {
    if (!API_URL) throw new Error("API_URL is not defined");

    const token = getAuthToken();
    if (!token) {
      console.warn("No access token found. Postponing fetchDevices.");
      return;
    }

    const response = await fetch(`${API_URL}/api/v1/devices`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    set({ devices: data });
  },
  fetchDeviceById: async (id: string): Promise<DeviceByIdResponse | null> => {
    if (!API_URL) throw new Error("API_URL is not defined");
    const token = getAuthToken();
    if (!token) {
      console.warn("No access token found. Postponing fetchDeviceById.");
      return null;
    }

    const response = await fetch(`${API_URL}/api/v1/devices/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    return data;
  },
  registerDevice: async (
    id: string,
    action: RegistrationAction,
  ): Promise<DeviceByIdResponse | null> => {
    if (!API_URL) throw new Error("API_URL is not defined");
    const token = getAuthToken();
    if (!token) {
      console.warn("No access token found. Postponing registerDevice.");
      return null;
    }
    const response = await fetch(
      `${API_URL}/api/v1/devices/${id}/registration`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action }),
      },
    );
    const data = await response.json();
    return data;
  },
  enableDevice: async (id: string): Promise<DeviceByIdResponse | null> => {
    if (!API_URL) throw new Error("API_URL is not defined");
    const token = getAuthToken();
    if (!token) {
      console.warn("No access token found. Postponing enableDevice.");
      return null;
    }
    const response = await fetch(`${API_URL}/api/v1/devices/${id}/enable`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    return data;
  },
  disableDevice: async (id: string): Promise<DeviceByIdResponse | null> => {
    if (!API_URL) throw new Error("API_URL is not defined");
    const token = getAuthToken();
    if (!token) {
      console.warn("No access token found. Postponing disableDevice.");
      return null;
    }
    const response = await fetch(`${API_URL}/api/v1/devices/${id}/disable`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    return data;
  },
  deleteDevice: async (id: string): Promise<DeviceByIdResponse | null> => {
    if (!API_URL) throw new Error("API_URL is not defined");
    const token = getAuthToken();
    if (!token) {
      console.warn("No access token found. Postponing deleteDevice.");
      return null;
    }
    const response = await fetch(`${API_URL}/api/v1/devices/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    return data;
  },
}));

export default useDeviceStore;
