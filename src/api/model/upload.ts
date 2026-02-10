import { ApiResponse } from './common';

export interface uploadResult {
  url: string;
  path: string;
  name: string;
  type: string;
  size: number;
}

export type uploadResponse = ApiResponse<uploadResult>;
