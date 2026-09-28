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
  company: null,
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