import type { ApiResponse } from '../common';

export interface uploadResult {
  url: string;
  path: string;
  name: string;
  type: string;
  size: number;
}

export type uploadResponse = ApiResponse<uploadResult>;

export type uploadEnterpriseResponse = ApiResponse<
  {
    name: string;
    url: string;
    path: string;
    size: number;
    type: string;
    original_name: string;
  }[]
>;
