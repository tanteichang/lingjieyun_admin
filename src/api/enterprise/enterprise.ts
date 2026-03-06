import type {
  CreateEnterprisePayload,
  CreateEnterpriseResponse,
  EnterpriseInfoResponse,
  JoinEnterprisePayload,
  JoinEnterpriseResponse,
  SearchEnterprisePayload,
  SearchEnterpriseResponse,
} from '@/api/model/enterprise/enterprise';
import { postRequest, request } from '@/utils/request';

const Api = {
  EnterpriseInfo: '/admin/enterprise/info',
  SearchEnterprise: '/admin/enterprise/searchEnterprise',
  JoinEnterprise: '/admin/enterprise/applyJoinEnterprise',
  CreateEnterprise: '/admin/enterprise/submitEnterprise',
};

export function getEnterpriseInfo() {
  return request.get<EnterpriseInfoResponse>({
    url: Api.EnterpriseInfo,
  });
}

export function searchEnterprise(params: SearchEnterprisePayload) {
  return request.get<SearchEnterpriseResponse>({
    url: Api.SearchEnterprise,
    params,
  });
}

export function joinEnterprise(params: JoinEnterprisePayload) {
  return postRequest<JoinEnterpriseResponse>({
    url: Api.JoinEnterprise,
    params,
    showError: true,
  });
}

export function createEnterprise(params: CreateEnterprisePayload) {
  return postRequest<CreateEnterpriseResponse>({
    url: Api.CreateEnterprise,
    params,
    showError: true,
  });
}
