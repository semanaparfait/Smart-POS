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

export interface CompanyTypeResponse {
  id: string;
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
