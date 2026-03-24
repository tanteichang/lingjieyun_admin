import type { ApiResponse, Pagination, Query } from '../common';

export enum ImportDataType {
  Talent = 1, // 人才导入
  Delivery = 2, // 交付物导入
  IdentityAuth = 3, // 身份认证信息导入
  PaymentOrder = 4, // 支付订单导入
  Customer = 5, // 客户导入
  Settlement = 6, // 结算单导入
  BatchRecruit = 7, // 批量招募
}

export interface ImportLogPayload extends Query {
  data_type: ImportDataType;
  task_id?: number;
}

export type ImportLogQuery = ImportLogPayload;

export interface ImportLogItem {
  id: number;
  batch_no: string;
  data_type: ImportDataType;
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
  error_info: string | null;
}

export type ImportLogResponse = ApiResponse<Pagination<ImportLogItem>>;
