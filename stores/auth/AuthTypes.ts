export interface Login {
  deviceId: string;
    email: string;
    password: string;
}

export interface superadminType 
{
  id: string,
  createdAt: string,
  updatedAt: string,
  employee: null,
  // The owner's company; none for the super admin.
  company: SignedInCompany | null,
  name: string,
  email: string,
  phone: string,
  pin: null,
  password: string,
  role: string,
  active: true,
  mustChangePassword: true,
  lastLoginAt: string
}

export interface SignedInCompany {
  id: string;
  code: string;
  name: string;
  logo: string | null;
  email: string;
  phone_number: string;
  location: string;
  type: string;
  // Extras SmartPOS turned on for the company.
  features?: { services?: boolean; delivery?: boolean; floorMap?: boolean; kitchen?: boolean } | null;
}
