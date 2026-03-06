import type {
  EnterpriseProfileResponse,
  EnterpriseProfileSavePayload,
  EnterpriseProfileSaveResponse,
} from '@/api/model/enterprise/profile';
import { getRequest, postRequest } from '@/utils/request';

const Api = {
  detail: '/admin/enterprise/profile/detail',
  save: '/admin/enterprise/profile/save',
};

export function getProfileDetail() {
  return getRequest<EnterpriseProfileResponse>({ url: Api.detail });
}

export function saveProfile(params: EnterpriseProfileSavePayload) {
  return postRequest<EnterpriseProfileSaveResponse>({
    url: Api.save,
    params,
    showError: true,
  });
}
