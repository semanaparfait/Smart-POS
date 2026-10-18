import { create } from "zustand";
import { API_URL } from "@/config/api";
import type {
  ContactMessagePayload,
  InstallationRequestPayload,
} from "@/stores/requests/requestTypes";

/*
 * Public (no login) endpoints used by the website forms.
 * The backend must expose:
 *   POST /api/v1/installation-requests   body: InstallationRequestPayload
 *   POST /api/v1/contact-messages        body: ContactMessagePayload
 */

const postPublic = async (path: string, body: unknown) => {
  if (!API_URL) throw new Error("API_URL is not defined");

  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    let message = response.statusText;
    try {
      const data = await response.json();
      message = data.message || message;
    } catch {
      // response had no JSON body
    }
    throw new Error(message || "Request failed");
  }

  return response.json().catch(() => ({}));
};

const useRequestStore = create<{
  submitInstallationRequest: (payload: InstallationRequestPayload) => Promise<void>;
  submitContactMessage: (payload: ContactMessagePayload) => Promise<void>;
}>(() => ({
  submitInstallationRequest: async (payload) => {
    await postPublic("/api/v1/installation-requests", payload);
  },

  submitContactMessage: async (payload) => {
    await postPublic("/api/v1/contact-messages", payload);
  },
}));

export default useRequestStore;
