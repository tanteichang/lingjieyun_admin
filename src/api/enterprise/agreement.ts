import type { getSignPayload, getSignResponse } from '@/api/model/enterprise/agreement';
import { getRequest } from '@/utils/request';

const Api = {
  getSign: '/admin/enterprise/agreement/goSign',
};

export function getSign(params: getSignPayload) {
  return getRequest<getSignResponse>({ url: Api.getSign, params, showError: true });
}
