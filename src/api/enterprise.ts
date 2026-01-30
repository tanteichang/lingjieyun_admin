import { request } from '@/utils/request';

import type { EnterpriseInfoResponse } from './model/enterprise';

const Api = {
  EnterpriseInfo: '/admin/enterprise/info',
};

export function getEnterpriseInfo() {
  return request.get<EnterpriseInfoResponse>({
    url: Api.EnterpriseInfo,
  });
}
