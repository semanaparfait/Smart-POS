import type{CompanyKind} from "@/stores/companies/companyTypes"
export enum UserRole {
    
    EMPLOYEE = "EMPLOYEE",
    OWNER = "OWNER"
}
export interface UserResponse    {
    id: string,
    createdAt: string,
    updatedAt: string,
    employee: UserRole,
    company: {
      id: string,
      createdAt: string,
      updatedAt: string,
      code: string,
      logo: string,
      name: string,
      email: string,
      phone_number: string,
      location: string,
      type: CompanyKind
    },
    name: string,
    email: string,
    phone: string,
    pin: null,
    password: string,
    role: UserRole,
    active: boolean,
    mustChangePassword: boolean,
    lastLoginAt: string
  }

  export interface UserPayload {
    companyCode: string,
    name: string,
    email: string,
    phone: string,
    role: UserRole
  }

  export interface createUserResponse {
  id: string,
  createdAt: string,
  updatedAt: string,
  company: {
    id: string,
  },
  name: string,
  email: string,
  phone: string,
  password: string,
  role: UserRole,
  active: boolean,
  mustChangePassword: boolean,
  lastLoginAt: null
}