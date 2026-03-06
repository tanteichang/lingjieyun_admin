import type { ApiResponse } from '../common';

export interface RegisterPayload {
  mobile: string;
  password: string;
  sms_code: string;
}

export enum AuditStatus {
  Pending = 0,
  Approved = 1,
  Rejected = 2,
}

export interface RegisterResult {
  admin_id: number;
  mobile: string;
  need_enterprise_info: boolean;
  registered: boolean;
}

export type RegisterResponse = ApiResponse<RegisterResult>;

export interface LoginPayload {
  mobile: string;
  password: string;
}

export interface LoginResult {
  token: string;
  enterprise_id: number;
  enterprise_name: string;
  enterprise?: {
    id: number;
    name: string;
    audit_status: number;
    audit_status_text: string;
  };
  expire_time: number;
  admin_id?: number;
  need_enterprise_info?: boolean;
  agreement_has_signed?: boolean;
  agreement_sign_status?: number;
  pending_join_apply?: boolean;
  agreement?: {
    has_signed: boolean;
    sign_status: number;
    sign_status_text: string;
  };
}

export type LoginResponse = ApiResponse<LoginResult>;

export interface SendSmsCodePayload {
  mobile: string;
  type: 'forget_password' | 'register';
}

export type SendSmsCodeResponse = ApiResponse<[]>;
