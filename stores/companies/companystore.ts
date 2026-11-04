import { create } from "zustand";
import { API_URL } from "@/config/api";
import type {
  CompanyType,
  CompanyTypePayload,
  CompanyTypeResponse,
  CompanyFeatures,
} from "@/stores/companies/companyTypes";
import useAuthStore from "@/stores/auth/authstore";

const getAuthToken = (): string | null => {
  return useAuthStore.getState().token || localStorage.getItem("accessToken");
};

const useCompanyStore = create<{
  companies: CompanyType[];
  fetchCompanies: () => Promise<void>;
  addCompany: (company: CompanyTypePayload) => Promise<CompanyTypeResponse>;
  updateCompany: (id: string, company: Partial<CompanyTypePayload>) => Promise<CompanyTypeResponse>;
  deleteCompany: (id: string) => Promise<void>;
  fetchSingleCompany: (id: string) => Promise<CompanyTypeResponse | null>;
  // Turns extras on or off; returns all of them as saved.
  setFeatures: (id: string, changes: Partial<CompanyFeatures>) => Promise<CompanyFeatures>;
}>((set, get) => ({
  companies: [],

  fetchCompanies: async () => {
    if (!API_URL) throw new Error("API_URL is not defined");

    const token = getAuthToken();
    if (!token) {
      console.warn("No access token found. Postponing fetchCompanies.");
      return;
    }

    const response = await fetch(`${API_URL}/api/v1/companies`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch companies: ${response.statusText}`);
    }

    const resData = await response.json();

    const companiesArray = resData.data ?? resData.companies ?? resData;

    set({ companies: Array.isArray(companiesArray) ? companiesArray : [] });
  },
  

  addCompany: async (company: CompanyTypePayload) => {
    if (!API_URL) throw new Error("API_URL is not defined");

    const token = getAuthToken();

    const response = await fetch(`${API_URL}/api/v1/companies`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(company),
    });

    if (!response.ok) throw new Error("Failed to add company");

    const resData = await response.json();
    const newCompany = resData.data ?? resData;

    set({ companies: [...get().companies, newCompany] });
    return newCompany;
  },

  updateCompany: async (id: string, company: Partial<CompanyTypePayload>) => {
    if (!API_URL) throw new Error("API_URL is not defined");

    const token = getAuthToken();

    const response = await fetch(`${API_URL}/api/v1/companies/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // Added auth protection
      },
      body: JSON.stringify(company),
    });

    if (!response.ok) throw new Error("Failed to update company");

    const resData = await response.json();
    const updatedCompany = resData.data ?? resData;

    set({
      companies: get().companies.map((c) => (c.id === id ? updatedCompany : c)),
    });

    return updatedCompany;
  },

  deleteCompany: async (id: string) => {
    if (!API_URL) throw new Error("API_URL is not defined");

    const token = getAuthToken();

    const response = await fetch(`${API_URL}/api/v1/companies/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // Added auth protection
      },
    });

    if (!response.ok) throw new Error("Failed to delete company");

    set({ companies: get().companies.filter((c) => c.id !== id) });
  },

  fetchSingleCompany: async (id: string) => {
    if (!API_URL) throw new Error("API_URL is not defined");

    const token = getAuthToken();
    if (!token) {
      console.warn("No access token found. Postponing fetchSingleCompany.");
      return null;
    }

    const response = await fetch(`${API_URL}/api/v1/companies/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch single company: ${response.statusText}`);
    }

    const resData = await response.json();
    return resData.data ?? resData;
  },

  setFeatures: async (id, changes) => {
    if (!API_URL) throw new Error("API_URL is not defined");

    const response = await fetch(`${API_URL}/api/v1/companies/${id}/features`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(changes),
    });

    const resData = await response.json().catch(() => null);
    if (!response.ok) {
      const message = Array.isArray(resData?.message) ? resData.message.join(", ") : resData?.message;
      throw new Error(message || "Could not save the extras");
    }
    return resData.features as CompanyFeatures;
  },
}));

export default useCompanyStore;
