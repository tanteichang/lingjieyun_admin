import type { ApiResponse } from '../common';

export interface IdCardPayload {
  image_url: string;
  card_side: 'FRONT' | 'BACK';
}

export interface IdCardResult {
  card_side: 'FRONT' | 'BACK';
  fields: {
    name: string;
    sex: string;
    nation: string;
    birth: string;
    address: string;
    id_card_no: string;
    authority: string;
    valid_date: string;
  };
  warnings: string[];
  quality: number;
  request_id: string;
}

export interface IdCardResponse extends ApiResponse<IdCardResult> {}

export interface BusinessLicensePayload {
  image_url: string;
}

export interface BusinessLicenseResult {
  fields: {
    credit_code: string;
    enterprise_name: string;
    legal_person_name: string;
    registered_capital: string;
    address: string;
    business_scope: string;
    enterprise_type: string;
    business_term: string;
    composing_form: string;
    establish_date: string;
    registration_date: string;
    registration_authority: string;
    title: string;
    serial_number: string;
    important: string;
  };
  warnings: {
    codes: string[];
    messages: string[];
    is_duplication: number;
  };
  extras: {
    angle: number;
    has_national_emblem: boolean;
    has_qr_code: boolean;
    has_seal: boolean;
    is_electronic: boolean;
    business_certificate: string[];
  };
  request_id: string;
}

export interface BusinessLicenseResponse extends ApiResponse<BusinessLicenseResult> {}
