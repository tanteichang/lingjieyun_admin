import type { ApiResponse } from '../common';

export interface BankItem {
  id: number;
  company_name: string;
  card_no: string;
  card_no_masked: string;
  bank_name: string;
  account_name: string;
  is_default: number;
  can_operate: boolean;
  created_at: string;
  updated_at: string;
}

export interface BankListResult {
  list: BankItem[];
  is_super_admin: boolean;
  can_operate: boolean;
}

export type BankListResponse = ApiResponse<BankListResult>;

export interface BankAddPayload {
  company_name: string;
  card_no: string;
  bank_name: string;
  account_name?: string;
}

export interface BankAddResult {
  bank_id: number;
}

export type BankAddResponse = ApiResponse<BankAddResult>;

export interface BankSetDefaultPayload {
  bank_id: number;
}

export type BankSetDefaultResponse = ApiResponse<[]>;

export interface BankRemovePayload {
  bank_id: number;
}

export type BankRemoveResponse = ApiResponse<[]>;
