import {create} from "zustand";
import {API_URL} from "@/config/api"
import type {Login} from "@/stores/auth/AuthTypes"
import { toast } from "react-toastify/unstyled";

const useAuthStore = create((set) => ({
  login: async (loginData: Login) => {

    if (!API_URL) {
      console.error("API_URL is not defined");
      return;
    }
    try {
        const response = await fetch(`${API_URL}/api/v1/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(loginData)
        });
        const data = await response.json();
        set({ user: data.user });
    } catch (error) {
        console.error("Error during login:", error);
        toast.error("Login failed");
    }
  }
}));

export default useAuthStore;