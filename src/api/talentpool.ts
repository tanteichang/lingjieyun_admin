import { getRequest, postRequest } from '@/utils/request';

import type { TalentPoolListQuery, TalentPoolListResponse } from './model/talentpool';

// 人才库管理
const API = {
  list: '/admin/enterprise/talent_pool/list',
};

export function getList(params: TalentPoolListQuery) {
  return getRequest<TalentPoolListResponse>({
    url: API.list,
    params,
  });
}
