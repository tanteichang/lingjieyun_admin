import type { ApiResponse, Pagination, Query, StatusTagMap } from '../common';
import type {
  UserResumeBaseInfo,
  UserResumeEducationItem,
  UserResumeProjectHistoryItem,
  UserResumeWorkExperienceItem,
} from './member';

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
export const TalentAuthStatusTag: StatusTagMap<TalentAuthStatus> = {
  [TalentAuthStatus.Pending]: { label: '待认证', theme: 'warning' },
  [TalentAuthStatus.Verified]: { label: '已认证', theme: 'success' },
};

export enum TalentSignStatus {
  Pending = 0,
  Signed = 1,
}
export const TalentSignStatusTag: StatusTagMap<TalentSignStatus> = {
  [TalentSignStatus.Pending]: { label: '待签约', theme: 'warning', variant: 'outline' },
  [TalentSignStatus.Signed]: { label: '已签约', theme: 'success', variant: 'outline' },
};

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
  education: number;
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

export interface TalentPoolResumeEducationItem {
  school_name?: string;
  school?: string;
  start_time?: string;
  end_time?: string;
  education?: string;
  degree?: string;
  major?: string;
  major_name?: string;
}

export interface TalentPoolResumeJobIntention {
  expected_position?: string;
  expected_salary?: string;
  expected_city?: string;
  available_time?: string;
}

export interface TalentPoolResumeWorkExperienceItem {
  company_name?: string;
  company?: string;
  start_time?: string;
  end_time?: string;
  position?: string;
  role?: string;
  description?: string | string[];
  desc?: string[];
}

export interface TalentPoolResumeCertificateItem {
  url?: string;
  image_url?: string;
  image?: string;
  name?: string;
}

export interface TalentPoolResume {
  personal_advantage?: string;
  education_list?: TalentPoolResumeEducationItem[];
  job_intention?: TalentPoolResumeJobIntention;
  work_experience_list?: TalentPoolResumeWorkExperienceItem[];
  certificate_list?: TalentPoolResumeCertificateItem[];
  [key: string]: unknown;
}

export interface TalentPoolExtendData {
  source?: string;
  [key: string]: unknown;
}

export interface TalentPoolJianli {
  certificate: string[];
  education: UserResumeEducationItem[];
  jianli: UserResumeBaseInfo | null;
  project_history: UserResumeProjectHistoryItem[];
  work_experience: UserResumeWorkExperienceItem[];
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
  jianli: TalentPoolJianli | null;
  has_resume: boolean;
  extend_data: TalentPoolExtendData | TalentPoolExtendData[];
}
export type TalentPoolDetailResponse = ApiResponse<TalentPoolDetail>;

export interface TalentPoolAddBankPayload {
  talent_pool_id: number;
  talent_name: string;
  bank_name: string;
  card_no: string;
}

export type TalentPoolAddBankResponse = ApiResponse<{
  bank_id: number;
}>;

export interface TalentPoolUpdateIdCardImagesPayload {
  talent_pool_id: number;
  card_front: string;
  card_back: string;
}

export type TalentPoolUpdateIdCardImagesResponse = ApiResponse<{
  identity_id: number;
  user_id: number;
  created: boolean;
}>;

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

export interface PaymentListPayload extends Query {
  talent_pool_id: number;
  project_name?: string;
  start_time?: string;
  end_time?: string;
}

export interface PaymentListItem {
  id: number;
  settlement_id: number;
  product_id: number;
  member_id: number;
  user_id: number;
  enterprise_id: number;
  order_no: string;
  payment_amount: string;
  payment_method: number;
  payment_status: number;
  payment_time: string | null;
  payment_channel: string | null;
  payment_account: string | null;
  receive_account: string | null;
  status: number;
  created_at: string;
  updated_at: string;
  receive_confirm_status: number;
  receive_confirm_time: string | null;
  receive_dispute_remark: string | null;
  settlement_name: string;
  statement_no: string;
  task_id: number;
  task_name: string;
  product_name: string;
  project_id: number;
  project_name: string;
  amount_text: string;
  payment_time_formatted: string;
}

export type PaymentListResponse = ApiResponse<Pagination<PaymentListItem>>;

export interface ConfirmationListPayload extends Query {
  talent_pool_id: number;
}

export interface ConfirmationListItem {
  id: number;
  product_id: number;
  confirmation_no: string;
  confirmation_file: string;
  signed_at: string;
  created_at: string;
  task_id: number;
  task_name: string;
  task_no: string;
  task_status: number;
  task_status_text: string;
  product_name: string;
  pdf_url: string;
  confirmation_url: string;
  signed_at_formatted: string;
}

export type ConfirmationListResponse = ApiResponse<Pagination<ConfirmationListItem>>;

export interface TaskListPayload extends Query {
  talent_pool_id: number;
}

export interface TalentTaskInfo {
  id: number;
  name: string;
  task_no: string;
  commission: string;
  start_time: string;
  end_time: string;
  task_status: number;
  task_status_text: string;
  project_id: number;
  project_name: string;
}

export interface TaskListItem {
  task_id: number;
  product_id: number;
  member_id: number;
  member_ids: number[];
  talent_pool_id: number;
  user_id: number;
  project_id: number;
  project_name: string;
  task_name: string;
  task_no: string;
  task_status: number;
  task_status_text: string;
  member_status: number;
  member_status_text: string;
  apply_time: string;
  join_time: string;
  settlement_count: number;
  settlement_amount_total: string;
  task_info: TalentTaskInfo;
  job_name: string;
}

export type TaskListResponse = ApiResponse<Pagination<TaskListItem>>;

export interface BatchImportPayload {
  source_url: string;
  remark?: string;
}

export type BatchImportResponse = ApiResponse<[]>;

export interface BatchUploadIdCardPayload {
  images: {
    url: string;
    filename: string;
  }[];
}
export type BatchUploadIdCardResponse = ApiResponse<{
  success_count: number;
  fail_count: number;
  errors: {
    id_card: string;
    message: string;
  }[];
  log_id: number;
}>;
