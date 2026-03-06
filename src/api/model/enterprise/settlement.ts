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
  product_id?: number;
  confirm_status?: ConfirmStatus;
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
