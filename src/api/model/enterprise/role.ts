import type { ApiResponse } from '../common';

export interface RoleNode {
  name: string;
  key: string;
  path?: string;
  children?: RoleNode[];
}

export type RoleNodeResponse = ApiResponse<{ list: RoleNode[] }>;

export interface Role {
  id: number;
  role_name: string;
  create_time: string;
  desc?: string;
  rules?: string[] | string;
}

export interface RoleListPayload {
  enterprise_id: number;
}

export type RoleListResponse = ApiResponse<{ list: Role[] }>;

export interface RoleCreatePayload {
  enterprise_id: number;
  role_name: string;
  desc?: string;
  rules?: string[];
}

export type RoleCreateResponse = ApiResponse<{
  role_id: number;
  role_name: string;
}>;

export interface RoleUpdatePayload {
  role_id: number;
  role_name?: string;
  desc?: string;
  rules?: string[];
}

export type RoleUpdateResponse = ApiResponse<[]>;

export interface RoleDeletePayload {
  role_id: number;
}

export type RoleDeleteResponse = ApiResponse<[]>;
