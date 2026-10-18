export interface InstallationRequestPayload {
  businessName: string;
  businessType: string;
  location: string;
  branches: number;
  plan: string;
  contactName: string;
  phone: string;
  email?: string;
  preferredDate?: string;
  notes?: string;
}

export interface ContactMessagePayload {
  name: string;
  email: string;
  phone?: string;
  topic: string;
  message: string;
}
