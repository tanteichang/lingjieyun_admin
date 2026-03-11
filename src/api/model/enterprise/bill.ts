import type { ApiResponse, Pagination, Query } from '../common';
// 获取账单列表
export enum PaymentStatus {
  Pending = 0, // 待支付
  Processing = 1, // 支付中
  Paid = 2, // 已支付
}
export const PaymentStatusMap = {
  [PaymentStatus.Pending]: '待支付',
  [PaymentStatus.Processing]: '支付中',
  [PaymentStatus.Paid]: '已支付',
};

export const PaymentStatusTag: Record<
  PaymentStatus,
  {
    label: string;
    theme?: 'primary' | 'warning' | 'success' | 'danger';
    variant?: 'light' | 'light-outline';
    color?: string;
  }
> = {
  [PaymentStatus.Pending]: { label: '待支付', theme: 'warning', variant: 'light' },
  [PaymentStatus.Processing]: { label: '支付中', theme: 'primary', variant: 'light' },
  [PaymentStatus.Paid]: { label: '已支付', theme: 'success', variant: 'light' },
};

export interface ListPayload extends Query {
  payment_status?: PaymentStatus;
  start_date?: string; // 2024-01-01
  end_date?: string;
  project_id?: number;
  product_id?: number;
  bill_no?: string;
}

export interface BillListItem {
  upload_id: number;
  created_at: string;
  settlement_name: string;
  payment_status: PaymentStatus;
  payment_status_text: string;
  customer_name: string;
  project_name: string;
  invoice_type: string;
  settlement_count: number;
  import_amount: string;
  distribution_amount: string;
  service_fee: string;
  extra_service_fee: string;
  personal_tax: string;
  vat_and_surcharge: string;
  total_fee: string;
  payment_info: string;
  bill_no: string;
  payment_success_count: number;
  payment_success_amount: string;
  paid_service_fee: string;
  payment_fail_count: number;
  payment_fail_amount: string;
  batch_no: string;
  task_name: string;
  enterprise_name: string;
  settlement_date: string;
  order_amount: string;
  total_pay: string;
  payment_time: string | null;
  payment_channel: string;
  payment_order_no: string;
  has_retry: number;
  can_reupload: boolean;
  parent_upload_id: number;
  sub_bills: BillListItem[];
}

export interface BillTabCounts {
  all: number;
  pending: number;
  paying: number;
  success: number;
  partial: number;
  fail: number;
  closed: number;
}

export interface BillListData extends Pagination<BillListItem> {
  tab_counts: BillTabCounts;
}

export type ListResponse = ApiResponse<BillListData>;

// 获取账单详情
export interface DetailPayload {
  upload_id: number;
}

export interface BillDetailPaymentInfo {
  payment_channel: string;
  service_fee_rate: string;
  distribution_amount: string;
  service_fee: string;
  personal_tax: string;
  payment_date: string;
}

export interface BillDetailFailReason {
  reason?: string;
  message?: string;
  [key: string]: unknown;
}

export interface BillDetailPaymentItem {
  distribution_amount: string;
  fail_reason: string;
  id_card: string;
  import_amount: string;
  operation: string | null;
  order_no: string;
  payment_order_id: number;
  payment_status: PaymentStatus;
  payment_status_text: string;
  payment_time: string | null;
  personal_tax: string;
  receipt: string | null;
  receive_info: string;
  recipient_name: string;
  service_fee: string;
  settlement_id: number;
}

export interface BillDetailFailRecord {
  [key: string]: unknown;
}

export interface BillDetailData {
  batch_no: string;
  task_name: string;
  project_name: string;
  customer_name: string;
  enterprise_name: string;
  payment_status: PaymentStatus;
  payment_status_text: string;
  total_payment_amount: string;
  payment_success_count: number;
  payment_fail_count: number;
  payment_fail_reasons: BillDetailFailReason[];
  payment_info: BillDetailPaymentInfo;
  success_count: number;
  fail_count: number;
  payment_list: BillDetailPaymentItem[];
  upload_id: number;
  created_at: string;
  settlement_name: string;
  invoice_type: string;
  settlement_count: number;
  import_amount: string;
  distribution_amount: string;
  service_fee: string;
  extra_service_fee: string;
  personal_tax: string;
  total_fee: string;
  payment_success_amount: string;
  payment_fail_amount: string;
  bill_no: string;
  has_retry: number;
  has_fail_records: boolean;
  can_reupload: boolean;
  fail_records: BillDetailFailRecord[];
}

export type DetailResponse = ApiResponse<BillDetailData>;

// 发送发放验证码
export interface SendDisburseCodePayload {
  upload_id: number;
}
export type SendDisburseCodeResponse = ApiResponse<[]>;

// 确认授权并发放
export interface ConfirmDisbursePayload {
  upload_id: number;
  sms_code: string;
  pay_password: string;
}
export type ConfirmDisburseResponse = ApiResponse<{
  disburse_token: string;
}>;

// 重新上传结算单
export interface ReUploadSettlementPayload {
  upload_id: number;
  file_url: string;
  file_name: string;
}
export type ReUploadSettlementResponse = ApiResponse<[]>;

// 创建支付
export interface CreatePaymentPayload {
  disburse_token: string;
}
export type CreatePaymentResponse = ApiResponse<[]>;
