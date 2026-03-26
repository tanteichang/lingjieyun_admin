import type { ApiResponse } from '../common';

export interface getSignPayload {
  agreement_type: number;
}

export interface getSignResult {
  agreement_id: number;
  agreement_no: string;
  can_sign: boolean;
  ess_flow_id: string;
  ess_sign_url: string;
  sign_status: number;
  sign_status_text: string;
}

export type getSignResponse = ApiResponse<getSignResult>;

export interface ViewAgreementResult {
  id: number;
  agreement_no: string;
  ess_file_url: string;
}

export type ViewAgreementResponse = ApiResponse<ViewAgreementResult>;
