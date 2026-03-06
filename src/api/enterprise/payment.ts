import type { PaymentListPayload, PaymentListResponse } from '@/api/model/enterprise/payment';
import { getRequest, postRequest } from '@/utils/request';

const Api = {
  List: '/admin/enterprise/payment/list',
};

export const getPaymentList = (params: PaymentListPayload) => {
  return getRequest<PaymentListResponse>({
    url: Api.List,
    params,
  });
};
