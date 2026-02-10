import type { ApiResponse, Pagination, Query } from './common';

export interface TaskQuery extends Query {
  project_id?: number; // 项目ID
  task_status?: TaskStatus; // 任务状态枚举
  task_name?: string; // 任务名称
}

export enum TaskStatus {
  ongoing = 2, // 进行中
  paused = 3, // 已暂停
  terminated = 4, // 已终止
  completed = 5, // 已完成
  unpublished = 6, // 未发布
}

export const TASK_STATUS_TAG: Record<
  TaskStatus,
  {
    label: string;
    theme?: 'primary' | 'warning' | 'success' | 'danger';
    variant?: 'light' | 'light-outline';
    color?: string;
  }
> = {
  [TaskStatus.ongoing]: { label: '进行中', theme: 'success', variant: 'light' },
  [TaskStatus.paused]: { label: '已暂停', theme: 'primary', variant: 'light-outline' },
  [TaskStatus.completed]: { label: '已完成', theme: 'primary', variant: 'light' },
  [TaskStatus.terminated]: { label: '已终止', theme: 'danger', variant: 'light' },
  [TaskStatus.unpublished]: {
    label: '未发布',
    theme: 'primary',
    variant: 'light',
  },
};

// 招募类型枚举
export enum RecruitmentType {
  FREE = 0, // 自由招募
  DIRECTED = 1, // 定向招募
  BOTH = 2, // 同时选择两种
}

// 佣金结算方式枚举
export enum CommissionSettlementType {
  DAILY = 1, // 日结
  PER_TIME = 2, // 次结
  WEEKLY = 3, // 周结
  MONTHLY = 4, // 月结
}

// 验收时间要求枚举
export enum AcceptanceType {
  FINAL = 1, // 完结验收
  REGULAR = 2, // 定期验收
}

// 交付模式枚举
export enum DeliveryMode {
  MINI_APP = 1, // 小程序上传
  SYSTEM_BATCH = 2, // 系统批量上传
  BOTH = 3, // 同时选择（无限制）
}

// 项目信息接口
export interface TaskProject {
  id: number; // 项目ID
  name: string; // 项目名称
}

export enum SettlementType {
  PER_TIME = 1, // 按次
  ORDER = 2, // 按单
  DAILY = 3, // 按日
  WEEKLY = 4, // 按周
  MONTHLY = 5, // 按月
}

export enum AcceptancePeriodType {
  BY_DAY = 1, // 按日
  BY_WEEK = 2, // 按周
  BY_MONTH = 3, // 按月
}

export interface TaskCustomerInfo {
  contact_person: string;
  contact_phone: string;
  customer_no: string;
  full_name: string;
  id: number;
  name: string;
}

// 单个任务项的类型
export interface TaskItem {
  id: number; // 任务ID
  task_no: string; // 任务编号
  name: string; // 任务名称
  project: TaskProject; // 项目信息
  recruitment_type: RecruitmentType; // 招募类型（0-自由招募，1-定向招募，2-同时选择两种）
  recruitment_type_text: string; // 招募类型文本（根据recruitment_type自动生成）
  task_time: string; // 任务时间（格式：Y-m-d）
  start_time: string; // 开始时间（格式：Y-m-d H:i:s）
  end_time: string; // 结束时间（格式：Y-m-d H:i:s）
  task_status: TaskStatus; // 任务状态（2-进行中，3-已暂停，4-已终止，5-已完成，6-未发布）
  task_status_text: string; // 任务状态文本（根据task_status自动生成）
  required_personnel: number; // 所需人员数量
  member_count: number; // 已加入人员数量
  desc: string; // 任务描述
  accept: string; // 验收标准
  acceptance_type: AcceptanceType; // 验收时间要求（1-完结验收，2-定期验收）
  acceptance_type_text: string; // 验收时间要求文本（根据acceptance_type自动生成）
  acceptance_period_type: AcceptancePeriodType; // 验收周期类型（1-按日，2-按周，3-按月）
  acceptance_start_date: string; // 验收开始日期（格式：Y-m-d）
  acceptance_end_date: string; // 验收结束日期（格式：Y-m-d）
  commission: string; // 任务佣金（必填）
  commission_settlement_type: CommissionSettlementType; // 佣金结算方式（1-日结，2-次结，3-周结，4-月结）
  commission_settlement_type_text: string; // 佣金结算方式文本（根据commission_settlement_type自动生成）
  commission_min: string; // 佣金最小值（必填）
  commission_max: string; // 佣金最大值（必填）
  created_at: string; // 创建时间（格式：Y-m-d H:i:s）
  customer_info: TaskCustomerInfo;
  customer_id: number; // 客户ID
  delivery_mode: DeliveryMode; // 交付模式（1-小程序上传，2-系统批量上传，3-同时选择（无限制））
}

export interface Status_Counts {
  all: number; // 所有
  unpublished: number; // 未发布
  ongoing: number; // 进行中
  completed: number; // 已完成
  paused: number; // 已暂停
  terminated: number; // 已终止
}

export interface TaskListResult extends Pagination<TaskItem> {
  status_counts: Status_Counts;
}

export interface TaskListResponse extends ApiResponse<TaskListResult> {}

export interface TaskPublishPayload {
  project_id: number; // 项目ID（**必填**，任务关联的项目ID）
  product_id?: number; // 任务ID（可选，如果提供则更新现有任务，否则创建新任务）
  product_no?: string; // 任务编号（可选，不提供则自动生成）
  name: string; // 任务名称
  settlement_type: SettlementType; // 结算方式（必填，1-按次，2-按单，3-按日，4-按周，5-按月）
  commission: string; // 任务佣金（必填）
  start_time: string; // 开始时间（必填，格式：Y-m-d H:i:s）
  end_time: string; // 结束时间（必填，格式：Y-m-d H:i:s）
  province?: string; // 省份（可选）
  city?: string; // 城市（可选）
  district?: string; // 区县（可选）
  detail_address?: string; // 详细地址（可选）
  longitude?: string; // 经度
  latitude?: string; // 纬度
  education_id?: number; // 学历要求（可选）
  experience_id?: number; // 工作经验要求（可选）
  job_id?: number; // 职位要求（可选）
  desc?: string; // 任务描述
  accept?: string; // 验收标准
  delivery_standard?: string; // 交付标准
  recruitment_type?: RecruitmentType; // 招募类型（可选，0-自由招募，1-定向招募，2-同时选择两种）
  required_personnel?: number; // 所需人员数量（可选，任务所需人员数量总和不能超过项目所需人员数量）
  commission_settlement_type?: CommissionSettlementType; // 佣金结算方式（可选，1-日结，2-次结，3-周结，4-月结）
  commission_min?: string; // 佣金最小值（可选）
  commission_max?: string; // 佣金最大值（可选）
  acceptance_type?: AcceptanceType; // 验收时间要求（可选，1-完结验收，2-定期验收）
  acceptance_period_type?: AcceptancePeriodType; // 验收周期类型（可选，1-按日，2-按周，3-按月，仅当`acceptance_type=2`时有效）
  acceptance_start_date?: string; // 完结验收开始日期（可选，格式：Y-m-d，仅当`acceptance_type=1`时有效）
  acceptance_end_date?: string; // 完结验收结束日期（可选，格式：Y-m-d，仅当`acceptance_type=1`时有效）
  delivery_mode?: DeliveryMode; // 交付模式（可选，1-小程序上传，2-系统批量上传，3-同时选择（无限制），默认3）
}

export interface TaskPublishResponse extends ApiResponse<{ product_id: number; product_no: string }> {}

export interface TaskPausePayload {
  id: number; // 任务ID（必填）
}

export interface TaskPauseResponse extends ApiResponse<[]> {}

export interface TaskResumePayload {
  id: number; // 任务ID（必填）
}

export interface TaskResumeResponse extends ApiResponse<[]> {}

export interface TaskTerminatePayload {
  id: number; // 任务ID（必填）
}

export interface TaskTerminateResponse extends ApiResponse<[]> {}

export interface TaskMemberListPayload {
  task_id: number; // 任务ID（必填）
}

export type TaskMemberListQuery = TaskMemberListPayload & Query;

export interface TaskMemberTalentInfo {
  id: number;
  name: string;
  phone: string;
  id_card: string;
}

export interface TaskMemberItem {
  id: number;
  product_id: number;
  apply_id: number;
  user_id: number;
  talent_pool_id: number;
  enterprise_id: number;
  member_type: number;
  member_status: number;
  join_time: string;
  status: number;
  created_at: string;
  updated_at: string | null;
  member_status_text: string;
  talent_info: TaskMemberTalentInfo;
  talent_info_name: string;
  talent_info_phone: string;
}

export interface TaskMemberListResponse extends ApiResponse<Pagination<TaskMemberItem>> {}

export interface TaskApplyListPayload {
  product_id?: number;
  date_range?: string;
  keyword_name?: string;
  keyword_mobile?: string;
  keyword_task?: string;
}

export type TaskApplyQuery = TaskApplyListPayload & Query;

export enum TaskApplyStatus {
  pending = 0, // 待审核
  passed = 1, // 已通过
  rejected = 2, // 已拒绝
}

export interface TaskApplyUserInfo {
  id: number;
  username: string;
  real_name: string;
  mobile: string;
  avatar: string;
}

export interface TaskApplyItem {
  id: number;
  product_id: number;
  user_id: number;
  enterprise_id: number;
  apply_status: TaskApplyStatus;
  apply_status_text: string;
  review_remark: string | null;
  review_time: string | null;
  review_user_id: number;
  status: number;
  created_at: string;
  updated_at: string;
  task_title: string; // 任务标题
  task_no: string; // 任务编号
  project_name: string; // 项目名称
  apply_time_text: string; // 报名时间文本
  user_info: TaskApplyUserInfo;
  user_info_mobile: string;
  user_info_real_name: string;
}

export interface TaskApplyListResult extends Pagination<TaskApplyItem> {
  stats: {
    total: number; // 总人数
    pending: number; // 待审核
    passed: number; // 已通过
    rejected: number; // 已拒绝
  };
}

export type TaskApplyListResponse = ApiResponse<TaskApplyListResult>;

export interface TaskApplyReviewPayload {
  apply_id: number;
  apply_status: TaskApplyStatus;
  review_remark: string;
}

export interface TaskApplyReviewResponse
  extends ApiResponse<{
    apply_id: number; // 报名ID
    apply_status: TaskApplyStatus; // 审核状态：1 审核通过 2 审核拒绝
    status_text: string; // 审核状态文本：通过 拒绝
  }> {}
