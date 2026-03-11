import type { DeliveryStatus } from '@/api/model/enterprise/delivery';

import type { ApiResponse, Pagination, Query } from '../common';
import type { TaskStatus } from './taskModel';

export enum ConfirmStatus {
  Pending = 0, // 待确认
  UserConfirmed = 1, // 用户已确认
  EnterpriseConfirmed = 2, // 企业已确认
  Settled = 3, // 已结算
  Disputed = 4, // 有异议
}

export interface SettlementListPayload extends Query {
  task_name?: string; // 任务名称
  customer_id?: number; // 客户ID
  project_id?: number;
  task_type_id?: number; // 任务类型ID
  task_status?: TaskStatus; // 任务状态
}

export interface Settlement {
  id: number;
  name: string;
  created_at: string;
  customer_id: number;
  project_id: number;
  project_type_id: number;
  invoice_type_id: number;
  task_status: TaskStatus;
  task_no: string;
  settlement_type: number;
  commission_min: string | null;
  commission_max: string | null;
  commission_settlement_type: number | null;
  task_title: string;
  publish_time: string;
  customer_name: string;
  project_name: string;
  task_type_name: string;
  invoice_type_name: string;
  task_status_text: string;
}

export type SettlementListResponse = ApiResponse<Pagination<Settlement>>;

export interface ExportFreelancerListPayload {
  product_id: number;
}

export interface SettlementDetailPayload extends Query {
  product_id: number;
  plan_date?: string;
  name?: string; // 姓名（模糊）
  mobile?: string; // 手机号（模糊）
  delivery_status?: DeliveryStatus; // 交付状态
}

export interface SettlementTaskInfo {
  product_id: number;
  task_id: number;
  task_title: string;
  settlement_type: number;
  settlement_type_text: string;
  task_type_id: number;
  task_type_name: string;
  commission: string | number | null;
  commission_min: number;
  commission_max: number;
  commission_settlement_type_text: string;
  project_id: number;
  project_name: string;
  task_status: TaskStatus;
  task_status_text: string;
  task_no: string;
}

export interface SettlementPlanDateItem {
  plan_date: string;
  delivery_count: number;
}

export interface SettlementDeliveryItem {
  id: number;
  member_id: number;
  name: string;
  mobile: string;
  id_card: string;
  delivery_status: DeliveryStatus;
  delivery_status_text: string;
  plan_delivery_date: string;
  created_at: string;
}

export interface SettlementDetail {
  task_info: SettlementTaskInfo;
  plan_date_list: SettlementPlanDateItem[];
  delivery_list: SettlementDeliveryItem[];
  delivery_total: number;
  delivery_page: number;
  delivery_limit: number;
  delivery_pages: number;
}
export type SettlementDetailResponse = ApiResponse<SettlementDetail>;

export interface TemplateDownloadPayload {
  type: 'empty' | 'with_members';
  product_id: number;
  plan_date: string;
}

export interface ImportSettlementPayload {
  file_url: string;
  file_name: string;
}

export interface ImportSettlementErrorItem {
  row_index: number;
  task_no: string;
  user_identity: string;
  error: string;
}

export interface ImportSettlementStats {
  settlement_count: number;
  import_amount: string;
  grant_amount: string;
  service_fee: string;
  additional_service_fee: string;
  personal_tax: string;
  vat_and_additional: string;
  total_cost: string;
  payment_success_count: number;
  payment_success_amount: string;
  paid_service_fee: string;
  payment_fail_count: number;
  payment_fail_amount: string;
}

export interface ImportSettlementResult {
  upload_id: number;
  upload_no: string;
  success: boolean;
  message: string;
  success_count: number;
  fail_count: number;
  errors: ImportSettlementErrorItem[];
  stats: ImportSettlementStats;
}
export type ImportSettlementResponse = ApiResponse<ImportSettlementResult>;

export interface ImportSettlementListLogPayload extends Query {}

export interface ImportSettlementLog {
  id: number;
  batch_no: string;
  data_type: number;
  source_url: string;
  enterprise_id: number;
  admin_id: number;
  total_count: number;
  success_count: number;
  fail_count: number;
  import_details: string;
  start_time: number;
  end_time: number;
  duration: number;
  remark: string;
  status: number;
  create_time: number;
  update_time: number;
  delete_time: number;
  total_amount: string;
  balance_check: number;
  balance_amount: string;
  match_status: number;
  start_time_text: string;
  end_time_text: string;
  stats: ImportSettlementStats;
}
export interface ImportSettlementListLogResponse extends ApiResponse<Pagination<ImportSettlementLog>> {}
