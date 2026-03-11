import type { ApiResponse, Pagination, Query } from '../common';

export enum AdminStatus {
  disabled = 0, // 禁用
  enabled = 1, // 启用
  inactive = 2, // 待激活
}
export const ADMIN_STATUS_OPTIONS: Record<AdminStatus, string> = {
  [AdminStatus.disabled]: '禁用',
  [AdminStatus.enabled]: '启用',
  [AdminStatus.inactive]: '待激活',
};

export enum AdminType {
  Super = 1, // 超管
  Normal = 2, // 普通管理员
}

export interface Admin {
  id: number; // 管理员ID
  name: string; // 管理员姓名
  mobile: string; // 管理员手机号
  wechat: string; // 微信号
  sequence: number; // 排序
  can_audit: boolean; // 是否可审核
  status: number; // 状态
  status_text: string; // 状态文本
  created_at: string; // 创建时间
  admin_type_text: string; // 管理员类型文本
  admin_type: AdminType; // 管理员类型
  role_name: string; // 角色名称
}

export type AdminListResponse = ApiResponse<Pagination<Admin>>;

export interface RemoveAdminPayload {
  admin_id: number; // 管理员ID
}

export type RemoveAdminResponse = ApiResponse<[]>;

export interface ToggleAdminPayload {
  admin_id: number; // 管理员ID
}

export type ToggleAdminResponse = ApiResponse<[]>;

export interface AddAdminPayload {
  mobile: string; // 管理员手机号
  role_id: number; // 角色ID
}
export type AddAdminResponse = ApiResponse<{
  admin_id: number; // 管理员ID
  mobile: string; // 管理员手机号
  user_id: number; // 用户ID
  is_bound: boolean; // 是否绑定
  message: string; // 消息
}>;

export interface UpdateAdminPayload {
  admin_id: number; // 管理员ID
  role_id: number; // 角色ID
}

export type UpdateAdminResponse = ApiResponse<[]>;

export interface AdminDetailPayload {
  admin_id: number; // 管理员ID
}

export interface AdminDetail {
  admin_id: number; // 管理员ID
  user_id: number; // 用户ID
  mobile: string; // 手机号
  name: string; // 真实姓名
  wechat: string; // 微信号
  admin_type: number; // 管理员类型
  admin_type_text: string; // 管理员类型文本
  role_id: number; // 角色ID
  role_name: string; // 角色名称
  rules: string[]; // 权限规则
  status: number; // 状态
  status_text: string; // 状态文本
  created_at: string; // 创建时间
  updated_at: string; // 更新时间
}

export type AdminDetailResponse = ApiResponse<AdminDetail>;

export enum AdminApplyStatus {
  Pending = 0, // 待审核
  Passed = 1, // 审核通过
  Rejected = 2, // 审核拒绝
}

export interface AdminApplyUserInfo {
  id: number; // 用户ID
  username: string; // 用户名称
  mobile: string; // 手机号
  avatar: string | null; // 头像
}

export interface AdminApply {
  id: number; // 申请ID
  user_id: number; // 用户ID
  admin_id: number; // 关联管理员ID
  enterprise_id: number; // 企业ID
  apply_status: AdminApplyStatus; // 申请状态
  apply_remark: string; // 申请备注
  audit_user_id: number; // 审核人ID
  audit_time: string | null; // 审核时间
  audit_remark: string; // 审核备注
  created_at: string; // 申请时间
  user_info: AdminApplyUserInfo; // 申请用户信息
  apply_status_text: string; // 申请状态文本
}

export interface AdminApplyListPayload extends Query {}

export type AdminApplyListResponse = ApiResponse<Pagination<AdminApply>>;

export interface AdminApplyAuditPayload {
  apply_id: number; // 申请ID
  audit_status: AdminApplyStatus; // 申请状态
  audit_remark: string; // 审核备注
}

export type AdminApplyAuditResponse = ApiResponse<{
  apply_id: number; // 申请ID
  apply_status: AdminApplyStatus; // 申请状态
  apply_status_text: string; // 申请状态文本
}>;
