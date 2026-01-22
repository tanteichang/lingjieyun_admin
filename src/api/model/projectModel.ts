import type { Query } from './common';

export interface ProjectQuery extends Query {
  name?: string;
  type?: string;
  status?: string;
  company?: string;
}

export interface TaskQuery extends Query {
  name?: string;
  type?: string;
  recruitType?: string;
  status?: string;
}

export type ProjectStatus = 'processing' | 'paused' | 'completed' | 'terminated';

export interface ProjectItem {
  id: number;
  code: string;
  name: string;
  projectType: string;
  invoiceType: string;
  company: string;
  projectPeriod: string;
  taskCount: number;
  status: ProjectStatus;
  requiredStaff: number;
  memberCount: number;
}

export interface ProjectListResult {
  list: ProjectItem[];
  total: number;
}
