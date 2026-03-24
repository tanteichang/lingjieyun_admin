import type { ApiResponse, Pagination, Query, StatusTagMap } from '../common';

// 客户信息接口
export interface Customer {
  id: number; // 客户ID
  customer_no: string; // 客户编号
  enterprise_id: number; // 企业ID
  name: string; // 客户名称
  full_name: string; // 客户全称
  credit_code: string; // 信用代码
  address: string; // 地址
  contact_phone: string; // 联系电话
  contact_person: string; // 联系人
  manager_id: number; // 管理员ID
  manager_name: string; // 负责人名称
  status: CustomerStatus; // 状态
  created_at: string; // 创建时间
  updated_at: string | null; // 更新时间
}

export interface CustomerListQuery extends Query {
  keyword?: string;
}

// 客户列表响应
export type CustomerListResponse = ApiResponse<Pagination<Customer>>;

// 创建客户请求参数
export interface CreateCustomerPayload {
  name: string; // 客户名称
  full_name: string; // 客户名称full_name
  contact_person: string; // 联系人
  contact_phone: string; // 联系电话
  credit_code: string; // 信用代码
  address: string; // 客户地址
  manager_id: number; // 管理员ID
}

// 创建客户响应
export interface CreateCustomerResponseData {
  customer_id: number; // 客户ID
}

export type CreateCustomerResponse = ApiResponse<CreateCustomerResponseData>;

// 更新客户请求参数
export interface UpdateCustomerPayload extends CreateCustomerPayload {
  id: number; // 客户ID
}

// 更新客户响应
export type UpdateCustomerResponse = ApiResponse<[]>;

// 删除客户请求参数
export interface DeleteCustomerPayload {
  id: number; // 客户ID
}

// 删除客户响应
export type DeleteCustomerResponse = ApiResponse<[]>;

// 批量导入客户请求参数
export interface BatchImportCustomerPayload {
  source_url: string; // 文件的url路径
  remark: string; // 备注
  start_row: number; // 起始行
}

// 批量导入客户响应
export type BatchImportCustomerResponse = ApiResponse<[]>;

export enum CustomerStatus {
  Active = 1,
  Disabled = 0,
}

export const CustomerStatusTag: StatusTagMap<CustomerStatus> = {
  [CustomerStatus.Active]: {
    label: '正常',
    theme: 'success',
  },
  [CustomerStatus.Disabled]: {
    label: '停用',
    theme: 'danger',
  },
};

export interface CustomerDetail {
  id: number; // 客户ID
  customer_no: string; // 客户编码
  enterprise_id: number; // 企业ID
  name: string; // 客户名称
  full_name: string; // 客户客户名称全称
  credit_code: string; // 统一社会信用码
  address: string; // 地址
  contact_phone: string; // 联系电话
  contact_person: string; // 联系人
  manager_id: number; // 负责人ID
  status: CustomerStatus; // 状态
  created_at: string; // 创建时间
  updated_at: string | null; // 更新时间
}

export type CustomerDetailResponse = ApiResponse<CustomerDetail>;
