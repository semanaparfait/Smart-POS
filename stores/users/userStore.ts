import { create } from "zustand";
import { API_URL } from "@/config/api";
import type { UserResponse, UserPayload, createUserResponse } from "@/stores/users/userTypes";
import useAuthStore from "@/stores/auth/authstore";

const getAuthToken = (): string | null => {
  // Kept in memory only and renewed by the auth store.
  return useAuthStore.getState().token;
};

/** Calls the users API; throws with the server's message when the request fails */
async function request<T>(path: string, method = "GET", body?: unknown): Promise<T | null> {
  if (!API_URL) throw new Error("API_URL is not defined");

  const token = getAuthToken();
  if (!token) {
    console.warn(`No access token found. Postponing ${method} ${path}.`);
    return null;
  }

  const response = await fetch(`${API_URL}/api/v1/user${path}`, {
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

  return (data?.data ?? data?.user ?? data) as T;
}

const useUserStore = create<{
  users: UserResponse[];
  fetchUsers: () => Promise<void>;
  fetchUserById: (id: string) => Promise<UserResponse | null>;
  createUser: (userData: Partial<UserPayload>) => Promise<createUserResponse | null>;
  deleteUser: (id: string) => Promise<void>;
}>((set) => ({
  users: [],

  fetchUsers: async () => {
    const data = await request<UserResponse[]>("");
    if (data !== null) set({ users: Array.isArray(data) ? data : [] });
  },

  fetchUserById: (id) => request<UserResponse>(`/${id}`),

  createUser: (userData) => request<createUserResponse>("", "POST", userData),

  deleteUser: async (id) => {
    await request(`/${id}`, "DELETE");
    set((state) => ({ users: state.users.filter((u) => u.id !== id) }));
  },
}));

export default useUserStore;
