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
  admin_id?: number;
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

export type SendSmsCodePayload =
  | {
      mobile: string;
      // 登录：login；忘记密码：forget_password；企业注册：register；
      // 新增企业管理员：admin_add；账单发放确认：bill_disburse
      type: 'login' | 'forget_password' | 'register' | 'admin_add' | 'bill_disburse';
    }
  | {
      mobile?: string;
      // 邮箱验证：email_verify；修改支付密码：pay_password_change
      // 这两个场景后端不要求传手机号
      type: 'email_verify' | 'pay_password_change';
    };

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
    email: BindItem;
  };
}

export type BindListResponse = ApiResponse<BindListResult>;

export type UnbindWeChatResponse = ApiResponse<[]>;

export interface SendEmailCodePayload {
  email: string;
}
export type SendEmailCodeResponse = ApiResponse<{
  email: string;
  scene: string;
  expire_seconds: number;
}>;

export interface VerifyEmailCodePayload {
  email: string;
  code: string;
}
export type VerifyEmailCodeResponse = ApiResponse<{
  valid: boolean;
  email: string;
  scene: string;
  consume: boolean;
}>;

export interface VerifyEmailSmsCodePayload {
  code: string;
}
export type VerifyEmailSmsCodeResponse = ApiResponse<{
  valid: boolean;
  mobile: string;
  mobile_masked: string;
  scene: string;
  consume: boolean;
}>;
