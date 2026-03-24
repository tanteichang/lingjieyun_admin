import type {
  BusinessLicensePayload,
  BusinessLicenseResponse,
  IdCardPayload,
  IdCardResponse,
} from '@/api/model/enterprise/ocr';
import { postRequest } from '@/utils/request';

const API = {
  idCard: '/admin/enterprise/ocr/idCard',
  businessLicense: '/admin/enterprise/ocr/businessLicense',
};

export function ocrIdCard(payload: IdCardPayload) {
  return postRequest<IdCardResponse>({
    url: API.idCard,
    data: payload,
    showError: true,
  });
}

export function ocrBusinessLicense(payload: BusinessLicensePayload) {
  return postRequest<BusinessLicenseResponse>({
    url: API.businessLicense,
    data: payload,
    showError: true,
  });
}
