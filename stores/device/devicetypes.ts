import type {CompanyKind} from "@/stores/companies/companyTypes"
export enum RegistrationStatusEnum {
  PENDING = 'PENDING',
  REQUESTED = 'REQUESTED',
  REGISTERED = 'REGISTERED',
  REJECTED = 'REJECTED',
  DISABLED = 'DISABLED',
}

export interface DeviceType   {
   id:string,
   createdAt:string,
   updatedAt:string,
   deviceId:string,
   deviceName:string,
   deviceOs:string,
   registrationStatus:RegistrationStatusEnum,
   company: {
     id:string,
     createdAt:string,
     updatedAt:string,
     code:string,
     logo:string | null,
     name:string,
     email:string,
     phone_number:string,
     location:string,
     type:CompanyKind
    }
  }