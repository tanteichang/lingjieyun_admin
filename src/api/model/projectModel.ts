import type { ApiResponse, Query } from './common.js';

export interface ProjectQuery extends Query {
  name?: string;
  project_status?: ProjectStatus;
  customer_id?: string;
  project_type_id?: number;
}

export interface TaskQuery extends Query {
  name?: string;
  type?: string;
  recruitType?: string;
  status?: string;
}

export interface LogQuery extends Query {
  dateRange?: string[];
}

// 项目状态枚举（与后端统一）
export enum ProjectStatus {
  NotStarted = 1,
  InProgress = 2, // 进行中
  Paused = 3, // 已暂停
  Terminated = 4, // 已终止
  Completed = 5, // 已完成
}

export const PROJECT_STATUS_TAG: Record<
  ProjectStatus,
  {
    label: string;
    theme?: 'primary' | 'warning' | 'success' | 'danger';
    variant?: 'light' | 'light-outline';
    color?: string;
  }
> = {
  [ProjectStatus.NotStarted]: { label: '未开始', color: '#C0C0C0', variant: 'light' },
  [ProjectStatus.InProgress]: { label: '进行中', theme: 'primary', variant: 'light' },
  [ProjectStatus.Paused]: { label: '已暂停', theme: 'warning', variant: 'light' },
  [ProjectStatus.Completed]: { label: '已完成', theme: 'success', variant: 'light' },
  [ProjectStatus.Terminated]: { label: '已终止', theme: 'danger', variant: 'light' },
};

// 所属企业信息
export interface Enterprise {
  id: string;
  name: string;
}

// 列表项核心结构
export interface ProjectItem {
  id: string; // 唯一标识
  task_no: string; // 项目编号
  name: string; // 项目名称
  desc: string; // 项目描述
  invoice_type_name: string; // 发票类型
  enterprise_name: string; // 所属企业
  projectTime: string; // 项目时间
  start_time: string; // 项目开始时间
  end_time: string; // 项目结束时间
  task_count: number; // 任务数量
  project_status: ProjectStatus; // 项目状态（枚举值）
  required_personnel: number; // 所需人员数量表
  direct_recruitment_count: number; // 定向招募人数
  free_recruitment_count: number; // 自由招募人数
}

// 分页返回结构
export interface ProjectPageResult {
  total: number; // 总数据量
  limit: number; // 每页条数
  pages: number; // 总页数
  page: number; // 当前页码
  list: ProjectItem[]; // 列表数据
}

// 完整的接口返回类型
export type ProjectListResponse = ApiResponse<ProjectPageResult>;

export interface ProjectCreatePayload {
  name: string;
  customer_id: string;
  desc: string;
  invoice_type_id: number;
  start_time: string;
  end_time: string;
  project_type: number;
}

export interface ProjectCreateResult {
  product_id: number;
}

export type ProjectCreateResponse = ApiResponse<ProjectCreateResult>;

export interface ProjectUpdatePayload {
  id: string;
  name: string;
  job_id: string;
  zone_id: string;
  desc: number;
  accept: string;
  delivery_standard: string;
}

export interface ProjectUpdateResult {
  product_id: number;
}

export type ProjectUpdateResponse = ApiResponse<ProjectUpdateResult>;

export interface ProjectClosePayload {
  id: string;
}

export type ProjectCloseResponse = ApiResponse<[]>;

export interface ProjectPausePayload {
  id: string;
}

export type ProjectPauseResponse = ApiResponse<[]>;

export interface ProjectTerminatePayload {
  id: string;
}

export type ProjectTerminateResponse = ApiResponse<[]>;

export interface ProjectResumePayload {
  id: string;
}

export type ProjectResumeResponse = ApiResponse<[]>;
