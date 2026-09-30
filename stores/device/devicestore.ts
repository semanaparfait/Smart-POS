import { create } from "zustand";
import { API_URL } from "@/config/api";
import type {
  DeviceType,
  DeviceByIdResponse
} from "@/stores/device/devicetypes";
import useAuthStore from "@/stores/auth/authstore";

const getAuthToken = (): string | null => {
  return useAuthStore.getState().token || localStorage.getItem("accessToken");
};


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
}));

export default useDeviceStore;