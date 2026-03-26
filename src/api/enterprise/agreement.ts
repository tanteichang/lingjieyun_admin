import type { getSignPayload, getSignResponse, ViewAgreementResponse } from '@/api/model/enterprise/agreement';
import { getRequest } from '@/utils/request';

const Api = {
  getSign: '/admin/enterprise/agreement/goSign',
  ViewAgreement: '/admin/enterprise/agreement/view',
};

export function getSign(params: getSignPayload) {
  return getRequest<getSignResponse>({ url: Api.getSign, params, showError: true });
}

export function viewAgreement() {
  return getRequest<ViewAgreementResponse>({ url: Api.ViewAgreement, showError: true });
}
