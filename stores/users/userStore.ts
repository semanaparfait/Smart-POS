import { create } from "zustand";
import { API_URL } from "@/config/api";
import type {UserResponse, UserPayload, createUserResponse } from "@/stores/users/userTypes"
import useAuthStore from "@/stores/auth/authstore";

const getAuthToken = (): string | null => {
  return useAuthStore.getState().token || localStorage.getItem("accessToken");
};

const useUserStore = create<{
  users: UserResponse[];
  fetchUserById: (id: string) => Promise<UserResponse | null>;
  createUser: (userData: Partial<UserPayload>) => Promise<createUserResponse | null>;
  fetchUsers: () => Promise<void>;
}>((set, get) => ({
  users: [],
  fetchUsers: async () => {
    if (!API_URL) throw new Error("API_URL is not defined");

    const token = getAuthToken();
    if (!token) {
      console.warn("No access token found. Postponing fetchDevices.");
      return;
    }

    const response = await fetch(`${API_URL}/api/v1/user`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch users");
    }

    const data = await response.json();
    set({ users: data });
  },
  fetchUserById: async (id: string) => {
    if (!API_URL) throw new Error("API_URL is not defined");
    const token = getAuthToken();
    if (!token) {
      console.warn("No access token found. Postponing fetchUserById.");
      return null;
    }
    const response = await fetch(`${API_URL}/api/v1/user/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch user by ID");
    }

    const data = await response.json();
    return data;
  },
  createUser: async (userData: Partial<UserPayload>) => {
    if (!API_URL) throw new Error("API_URL is not defined");
    const token = getAuthToken();
    if (!token) {
      console.warn("No access token found. Postponing createUser.");
      return null;
    }

    const response = await fetch(`${API_URL}/api/v1/user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error("Failed to create user");
    }

    const data = await response.json();
    return data;
  },
  deleteUser: async (id: string) => {
    if (!API_URL) throw new Error("API_URL is not defined");
    const token = getAuthToken();
    if (!token) {
      console.warn("No access token found. Postponing deleteUser.");
      return;
    }
    const response = await fetch(`${API_URL}/api/v1/user/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error("Failed to delete user");
    }
    // After deletion, fetch the updated list of users
    await get().fetchUsers();
  }
}));

export default useUserStore;