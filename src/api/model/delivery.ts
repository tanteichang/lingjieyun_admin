import type { ApiResponse, Pagination } from './common';

export interface DeliveryListPayload {
  project_id?: string;
  keyword_name?: string; // 申请人姓名
  keyword_mobile?: string; // 申请人手机号
  submit_status?: DeliverySubmitStatus; // 提交状态
  date_range?: string; // 提交时间范围
}

// 提交类型：1 用户提交 2 企业代提交
export enum DeliverySubmitType {
  User = 1,
  EnterpriseProxy = 2,
}

// 提交状态：0 待验收 1 已验收 2 不合格需重新提交
export enum DeliverySubmitStatus {
  Pending = 0,
  Accepted = 1,
  RejectedNeedResubmit = 2,
}

// 交付状态：0 未上传 1 已通过
export enum DeliveryStatus {
  NotUploaded = 0,
  Approved = 1,
  Rejected = 2,
}

export interface DeliveryItemFile {
  name: string;
  url: string;
  type: 'file' | 'image';
}

export interface DeliveryUserInfo {
  id: number;
  username: string;
  avatar: string;
}

export interface DeliveryItem {
  id: number;
  product_id: number;
  member_id: number;
  user_id: number;
  enterprise_id: number;
  submit_type: DeliverySubmitType;
  content: string | null;
  files: DeliveryItemFile[];
  submit_status: DeliverySubmitStatus;
  submit_count: number;
  status: number;
  created_at: string;
  updated_at: string | null;
  user_info: DeliveryUserInfo;
  submit_status_text: string;
  submit_type_text: string;
  is_uploaded: boolean;
  delivery_status: DeliveryStatus;
  delivery_status_text: string;
  user_name: string;
  user_mobile: string;
}

export interface DeliveryListResult extends Pagination<DeliveryItem> {
  stats: {
    total: number; // 所有数
    pending: number; // 待审核
    passed: number; // 通过
    rejected: number; // 拒绝
  };
}

export type DeliveryListResponse = ApiResponse<DeliveryListResult>;

export interface DeliveryReviewPayload {
  submit_id: number;
  submit_status: DeliverySubmitStatus;
  review_remark?: string;
}

export type DeliveryReviewResponse = ApiResponse<[]>;

export interface DeliveryUploadPayload {
  submit_ids: number[];
  files: DeliveryItemFile[];
}

export interface DeliveryUploadResult {
  submit_ids: number[];
  success_ids: number[];
  success_count: number;
  fail_count: number;
  submit_status: number;
  fail_items: {
    submit_id: number;
    error: string;
  }[];
  status: DeliveryStatus;
}

export type DeliveryUploadResponse = ApiResponse<DeliveryUploadResult>;
