export interface CompanyType {
  id: string;
  createdAt: string;
  updatedAt: string;
  code: string;
  logo: string;
  name: string;
  email: string;
  phone_number: number;
  location: string;
  type: string;
}

export enum CompanyKind {
  RESTAURANT = "RESTAURANT",
  BAR = "BAR",
  HOTEL = "HOTEL",
  SUPERMARKET = "SUPERMARKET",
  PHARMACY = "PHARMACY",
  SHOP = "SHOP",
}

export interface CompanyTypePayload {
  logo?: string;
  name: string;
  email: string;
  phone_number: string;
  location: string;
  type: CompanyKind;
}

// Extras SmartPOS turns on per company; the owner's app shows only these.
export type FeatureKey = "services" | "delivery" | "floorMap" | "kitchen";
export type CompanyFeatures = Record<FeatureKey, boolean>;

export interface CompanyTypeResponse {
  id: string;
  // Missing on servers from before extras could be switched.
  features?: Partial<CompanyFeatures> | null;
  createdAt: string;
  updatedAt: string;
  code: string;
  logo: string | null;
  name: string;
  email: string;
  phone_number: string;
  location: string;
  type: CompanyKind;
}
