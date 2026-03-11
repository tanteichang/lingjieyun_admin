import type { ApiResponse, Pagination } from '@/api/model/common';

export enum PaymentStatus {
  Pending = 0, // 待付款
  Paying = 1, // 付款中
  Paid = 2, // 已付款
  Cancelled = 3, // 已取消
}

export enum ReceiveConfirmStatus {
  Pending = 0, // 待确认
  Confirmed = 1, // 已确认
  Disputed = 2, // 有异议
}

export interface PaymentListPayload {
  product_id?: number;
  payment_status?: PaymentStatus;
  receive_confirm_status?: ReceiveConfirmStatus;
  page: number;
  limit: number;
}

export interface PaymentUserInfo {
  id: number;
  username: string;
  avatar: string;
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
  payment_status: PaymentStatus;
  payment_time: string | null;
  payment_channel: string | null;
  payment_account: string | null;
  receive_account: string | null;
  status: number;
  created_at: string;
  updated_at: string;
  receive_confirm_status: ReceiveConfirmStatus;
  receive_confirm_time: string | null;
  receive_dispute_remark: string | null;
  user_info: PaymentUserInfo;
  statement_no: string;
  receipt: string | null;
  payment_status_text: string;
  receive_confirm_status_text: string;
}

export type PaymentListResponse = ApiResponse<Pagination<PaymentListItem>>;
