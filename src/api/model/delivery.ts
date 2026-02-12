import type { ApiResponse, Pagination, Query } from './common';
import type { TaskStatus } from './taskModel';

export interface DeliveryListPayload extends Query {
  keyword_name?: string; // 所属项目名称
  submit_status?: DeliverySubmitStatus; // 提交状态
  date_range?: string; // 日期范围
  keyword_mobile?: string; // 手机号
  project_id?: number; // 任务ID
}

export interface DeliveryUploadListPayload extends Query {
  project_name?: string; // 所属项目名称
  enterprise_name?: string; // 企业名称
  delivery_status?: DeliveryStatus;
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

export interface DeliveryUploadItem {
  id: number;
  name: string; // 任务名称
  project_id: number; // 任务ID
  project_type_id: number; // 任务类型ID
  delivery_mode: number; // 交付模式：1-小程序上传（只能小程序端上传），2-系统批量上传（只能企业端上传），3-同时选择（无限制）
  task_status: TaskStatus; // 任务
  status: number;
  created_at: string;
  task_title: string; // 任务标题
  project_name: string; // 所属项目名称
  enterprise_name: string;
  task_type_text: string;
  delivery_mode_text: string;
  publish_time: string;
  delivery_upload_time: string; // 上传时间
  status_text: string;
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

export type DeliveryUploadListResponse = ApiResponse<Pagination<DeliveryUploadItem>>;

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

export interface DeliverySummaryPayload {
  project_id: number;
}

export interface DeliveryCompletionPayload {
  project_id: number;
}

export interface DeliveryCompletionItem {
  member_id: number;
  user_id: number;
  real_name: string;
  mobile: string;
  card_no: string;
  delivery_status: DeliveryStatus;
  delivery_status_text: string;
}
export type DeliveryCompletionResponse = ApiResponse<Pagination<DeliveryCompletionItem>>;
