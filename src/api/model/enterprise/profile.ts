import type { ApiResponse } from '../common';

export interface EnterpriseProfileAddress {
  province: string;
  city: string;
  district: string;
  address_detail: string;
}

export interface EnterpriseProfileBasicInfo {
  logo: string;
  credit_code: string;
  legal_person_name: string;
  short_name: string;
  mobile: string;
  work_time: string;
  email: string;
  industry: string;
  address: EnterpriseProfileAddress;
  desc: string;
  employee_benefits: string;
}

export interface EnterpriseIndustryRegistration {
  establish_date: string;
  register_address: string;
  business_scope: string;
  business_license: string;
}

export interface EnterpriseLegalPersonInfo {
  name: string;
  phone: string;
  id_card_front: string;
  id_card_back: string;
}

export interface EnterpriseProfileCertificationInfo {
  industry_registration: EnterpriseIndustryRegistration;
  legal_person_info: EnterpriseLegalPersonInfo;
}

export interface EnterpriseProfile {
  enterprise_id: number;
  basic_info: EnterpriseProfileBasicInfo;
  certification_info: EnterpriseProfileCertificationInfo;
}

export type EnterpriseProfileResponse = ApiResponse<EnterpriseProfile>;

export interface EnterpriseProfileSavePayload {
  enterprise_id: number;
  logo?: string;
  credit_code?: string;
  legal_person_name?: string;
  short_name?: string;
  mobile?: string;
  work_time?: string;
  email?: string;
  industry_id?: string;
  industry?: string;
  province?: string;
  city?: string;
  district?: string;
  address_detail?: string;
  desc?: string;
  employee_benefits?: string;
  establish_date?: string;
  register_address?: string;
  business_scope?: string;
  business_license?: string;
  legal_person_phone?: string;
  legal_person_id_front?: string;
  legal_person_id_back?: string;
}

export type EnterpriseProfileSaveResponse = ApiResponse<[]>;
