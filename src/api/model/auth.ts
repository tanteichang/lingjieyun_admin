import type { ApiResponse } from './common';

export interface RegisterPayload {
  name: string;
  credit_code: string;
  mobile: string;
  address?: string;
  business_license?: string;
  password: string;
  admin_mobile: string;
  admin_username?: string;
  sms_code: string;
}

export enum AuditStatus {
  Pending = 0,
  Approved = 1,
  Rejected = 2,
}

export interface RegisterResult {
  enterprise_id: number;
  audit_status: AuditStatus;
  audit_status_text: string;
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
  audit_status: number;
  expire_time: number;
}

export type LoginResponse = ApiResponse<LoginResult>;

export interface SendSmsCodePayload {
  mobile: string;
  type: 'forget_password' | 'register';
}

export type SendSmsCodeResponse = ApiResponse<[]>;
