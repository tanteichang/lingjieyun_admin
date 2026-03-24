import type { TagProps } from 'tdesign-vue-next';
import type { VNode } from 'vue';

export enum Code {
  OK = 200,
}

export interface Query {
  page: number;
  limit: number;
}

export interface Row {
  index?: number;
  op?: VNode;
}

export interface StatusTagMeta {
  label: string;
  theme?: TagProps['theme'];
  variant?: TagProps['variant'];
  color?: string;
}
export type StatusTagMap<T extends string | number> = Record<T, StatusTagMeta>;

// 接口返回统一格式
export interface ApiResponse<T> {
  code: number;
  msg: string;
  data: T;
  time: string;
}
export interface Pagination<T> {
  total: number;
  limit: number;
  pages: number;
  page: number;
  list: T[];
}
