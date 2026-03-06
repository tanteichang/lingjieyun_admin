import type {
  BatchRealnamePayload,
  BatchRealnameResponse,
  TalentPoolDetailResponse,
  TalentPoolListQuery,
  TalentPoolListResponse,
} from '@/api/model/enterprise/talentpool';
import { getRequest, postRequest } from '@/utils/request';

// 人才库管理
const API = {
  list: '/admin/enterprise/talent_pool/list',
  detail: '/admin/enterprise/talent_pool/detail',
  batchRealname: '/admin/enterprise/talent_pool/batchRealname',
};

export function getList(params: TalentPoolListQuery) {
  return getRequest<TalentPoolListResponse>({
    url: API.list,
    params,
  });
}

export function getDetail(params: { talent_pool_id: number }) {
  return getRequest<TalentPoolDetailResponse>({
    url: API.detail,
    params,
  });
}

export function batchRealname(params: BatchRealnamePayload) {
  return postRequest<BatchRealnameResponse>({
    url: API.batchRealname,
    params,
    showError: true,
  });
}
