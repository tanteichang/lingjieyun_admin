import type { ApiResponse, Pagination, Query } from '../common';

export interface TalentPoolListQuery extends Query {
  keyword?: string;
  name?: string;
  phone?: string;
  sign_status?: number;
  auth_status?: number;
  channel?: string;
}

export enum TalentChannel {
  WechatMiniProgram = 1,
  AdminImport = 2,
  H5 = 3,
}

export enum TalentAuthStatus {
  Pending = 0,
  Verified = 1,
}

export enum TalentSignStatus {
  Pending = 0,
  Signed = 1,
}

export interface TalentPoolItem {
  id: number; // 人才ID
  name: string;
  phone: string;
  id_card: string;
  bank_card: string;
  user_id: number;
  create_time: number;
  extend: string;
  join_time: number;
  user_mobile: string | null; // 手机号
  channel: TalentChannel; // 入驻渠道（1=微信小程序, 2=后台导入, 3=H5）
  auth_status: TalentAuthStatus; // 认证状态（0=待认证, 1=已认证）
  signed_at: string | number | null; // 签约时间
  agreement_id: number | null; // 协议记录ID（用于判断签约状态）
  face_photo_url: string | null; // 人脸认证图片URL（用于判断是否人脸认证）
  id_card_masked: string; // 身份证号
  phone_masked: string; // 身份证号
  bank_card_masked: string; // 银行卡号
  sign_status: TalentSignStatus; // 签约状态（0=待签约, 1=已签约）
  sign_status_text: string; // 签约状态
  auth_status_text: string; // 认证状态
  is_face_verified: string; // 是否人脸认证（"是"/"否"）
  score_level: string; // 评分等级（默认"--"）
  sign_date: string; // 签约日期
}

export type TalentPoolListResponse = ApiResponse<Pagination<TalentPoolItem>>;

export interface TalentPoolBasicInfo {
  id: number;
  name: string;
  avatar: string;
  is_auth: boolean;
  is_signed: boolean;
  apply_count: number;
  education: string;
  score: number;
}

export interface TalentPoolContactInfo {
  phone: string;
  phone_masked: string;
}

export interface TalentPoolBankInfo {
  holder_name: string;
  bank_name: string;
  bank_card: string;
  bank_card_masked: string;
}

export interface TalentPoolIdentityInfo {
  id_card: string;
  id_card_masked: string;
  card_front: string;
  card_back: string;
}

export interface TalentPoolSignInfo {
  signed_at: string | number | null;
  agreement_no: string;
}

export interface TalentPoolResume {
  [key: string]: unknown;
}

export interface TalentPoolExtendData {
  source?: string;
  [key: string]: unknown;
}

export interface TalentPoolDetail {
  id: number;
  user_id: number;
  remark: string;
  join_time: number;
  basic_info: TalentPoolBasicInfo;
  contact_info: TalentPoolContactInfo;
  bank_info: TalentPoolBankInfo;
  identity_info: TalentPoolIdentityInfo;
  sign_info: TalentPoolSignInfo;
  resume: TalentPoolResume | null;
  has_resume: boolean;
  extend_data: TalentPoolExtendData;
}
export type TalentPoolDetailResponse = ApiResponse<TalentPoolDetail>;

export interface BatchRealnamePayload {
  images: {
    url: string;
    filename: string;
  }[];
}

export interface BatchRealnameErrorItem {
  id_card: string;
  message: string;
}

export interface BatchRealnameResult {
  success_count: number;
  fail_count: number;
  errors: BatchRealnameErrorItem[];
}

export type BatchRealnameResponse = ApiResponse<BatchRealnameResult>;
