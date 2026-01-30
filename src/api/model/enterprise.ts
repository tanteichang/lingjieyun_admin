import type { ApiResponse } from './common';

export interface EnterpriseInfo {
  id: number;
  name: string;
  logo: string;
  credit_code: string;
  mobile: string;
  email: string;
  address: string;
  audit_status: number;
}

export interface UserInfo {
  id: number;
  username: string;
  mobile: string;
  avatar: string;
}

export interface EnterpriseInfoResult {
  enterprise: EnterpriseInfo;
  user: UserInfo;
}

export type EnterpriseInfoResponse = ApiResponse<EnterpriseInfoResult>;
