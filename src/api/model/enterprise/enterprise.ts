import type { ApiResponse } from '../common';
import type { AdminType } from './admin';

export interface EnterpriseInfo {
  id: number;
  name: string;
  logo: string;
  credit_code: string;
  mobile: string;
  email: string;
  address: string;
  audit_status: number;
  agreement_sign_status: number;
  agreement_has_signed: boolean;
}

export enum SecurityLevel {
  VeryWeak = 1,
  RelativelyWeak = 2,
  Weak = 3,
  Normal = 4,
  Good = 5,
  RelativelyHigh = 6,
  High = 7,
  VeryHigh = 8,
}

export interface AdminInfo {
  id: number;
  mobile: string;
  admin_type: AdminType;
  role_id: number;
  security_level: SecurityLevel;
  security_level_text: string;
  has_pay_password: boolean;
}

export interface EnterpriseInfoResult {
  enterprise: EnterpriseInfo;
  admin: AdminInfo;
  register_admin_mobile_masked: string;
}

export type EnterpriseInfoResponse = ApiResponse<EnterpriseInfoResult>;

export interface SearchEnterprisePayload {
  keyword: string;
  limit: number;
}

export interface SearchEnterpriseResult {
  id: number;
  name: string;
  logo: string;
  credit_code: string;
  address: string;
}
export type SearchEnterpriseResponse = ApiResponse<{
  list: SearchEnterpriseResult[];
  total: number;
  keyword: string;
}>;

export interface JoinEnterprisePayload {
  admin_id: number;
  enterprise_id: number;
  apply_remark?: string;
}

export type JoinEnterpriseResponse = ApiResponse<[]>;

export interface CreateEnterprisePayload {
  admin_id: number;
  name: string;
  credit_code: string;
  business_license: string;
  industry_id: number;
  // industry: string;
  is_legal_admin: 0 | 1;
  mobile: string;
  email: string;
  address: string;
  legal_person_name: string;
  legal_person_id_front: string;
  legal_person_id_back: string;
  legal_person_phone: string;
  legal_person_id_no: string;
  super_admin_name?: string;
  super_admin_phone?: string;
  super_admin_id_front?: string;
  super_admin_id_back?: string;
  super_admin_id_no?: string;
}

export type CreateEnterpriseResponse = ApiResponse<[]>;

export interface SetOrChangePayPasswordPayload {
  pay_password: string;
  pay_password_token: string;
}

export type SetOrChangePayPasswordResponse = ApiResponse<[]>;

export type SendPayPasswordChangeSmsResponse = ApiResponse<{
  code: number;
  message: string;
}>;

export interface VerifyPayPasswordSmsPayload {
  sms_code: string;
}

export type VerifyPayPasswordSmsResponse = ApiResponse<{
  pay_password_token: string;
  expire_seconds: number;
}>;
