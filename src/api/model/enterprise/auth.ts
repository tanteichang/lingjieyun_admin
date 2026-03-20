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
  can_access_console: boolean;
  rejected_join_apply?: boolean;
  message?: string;
  enterprise_id: number;
  enterprise_name: string;
  enterprise?: {
    id: number;
    name: string;
    audit_status: number;
    audit_status_text: string;
  };
  expire_time: number;
  need_enterprise_info?: boolean;
  agreement_has_signed?: boolean;
  agreement_sign_status?: number;
  pending_join_apply?: boolean;
  agreement?: {
    has_signed: boolean;
    sign_status: number;
    sign_status_text: string;
  };
  permission_paths?: string[];
  admin_info: {
    admin_type: number;
    id: number;
    is_super_admin: boolean;
    mobile: string;
  };
}

export type LoginResponse = ApiResponse<LoginResult>;

export interface SendSmsCodePayload {
  mobile: string;
  type: 'forget_password' | 'register';
}

export type SendSmsCodeResponse = ApiResponse<[]>;

export interface LoginByWeChatPayload {
  code: string;
}
export type LoginByWeChatResponse = ApiResponse<
  {
    key?: string; // 登录凭证
  } & LoginResult
>;

export type CaptchaResponse = ApiResponse<{
  captcha_id: string;
  captcha_image: string;
  expire_seconds: number;
  captcha_length: number;
}>;

export interface VerifyCaptchaPayload {
  captcha_id: string;
  captcha_code: string;
}

export type VerifyCaptchaResponse = ApiResponse<{
  valid: boolean;
}>;

export interface ChangePasswordPayload {
  old_password: string;
  new_password: string;
  confirm_password: string;
}
export type ChangePasswordResponse = ApiResponse<[]>;

export interface BindWeChatPayload {
  code?: string;
  state?: string;
  key?: string; // loginByWeChat 返回的登录凭证
}

export type BindWeChatResponse = ApiResponse<[]>;

export interface ForgetPasswordPayload {
  new_password: string;
  confirm_password: string;
  sms_code: string;
  mobile: string;
}

export type ForgetPasswordResponse = ApiResponse<[]>;

export interface BindItem {
  platform: string;
  platform_name: string;
  is_bound: boolean;
  status: number;
  bound_at: number;
}
export interface BindListResult {
  admin_id: string;
  user_id: string;
  enterprise_id: number;
  list: BindItem[];
  platforms: {
    wechat: BindItem;
  };
}

export type BindListResponse = ApiResponse<BindListResult>;

export type UnbindWeChatResponse = ApiResponse<[]>;
