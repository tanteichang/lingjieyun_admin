import type { ApiResponse } from './common';

// 项目类型
export interface ProjectType {
  id: number;
  name: string;
  sort: number;
  is_recommend: number;
}
export type ProjectTypeResponse = ApiResponse<ProjectType[]>;

// 发票类型
export interface InvoiceType {
  id: number;
  name: string;
  sort: number;
  is_recommend: number;
  parent_id?: number;
  children?: InvoiceType[];
}
export type InvoiceTypeResponse = ApiResponse<InvoiceType[]>;

// 工作经验
export interface Experience {
  id: number;
  label: string;
  min_value: number;
  max_value: number;
  is_recommend: number;
}
export type ExperienceResponse = ApiResponse<Experience[]>;

// 薪资范围
export interface Salary {
  id: number;
  label: string;
  min_value: number;
  max_value: number;
  is_recommend: number;
}
export type SalaryResponse = ApiResponse<Salary[]>;

// 学历
export interface Education {
  id: number;
  name: string;
  sort: number;
  is_recommend: number;
}
export type EducationResponse = ApiResponse<Education[]>;

// 职位
export interface Job {
  id: number;
  name: string;
  is_recommend: number;
  parent_id?: number;
  children?: Job[];
}
export type JobResponse = ApiResponse<Job[]>;
