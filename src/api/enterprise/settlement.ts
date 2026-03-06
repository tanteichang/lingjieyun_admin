import type {
  ExportFreelancerListPayload,
  SettlementListPayload,
  SettlementListResponse,
} from '@/api/model/enterprise/settlement';
import { getRequest, request } from '@/utils/request';

const Api = {
  List: '/admin/enterprise/settlement/list',
  ExportFreelancerList: '/admin/enterprise/settlement/exportFreelancerList',
};

export const getSettlementList = (params: SettlementListPayload) => {
  return getRequest<SettlementListResponse>({
    url: Api.List,
    params,
  });
};

export const exportFreelancerList = (params: ExportFreelancerListPayload) => {
  return request.get({
    url: Api.ExportFreelancerList,
    responseType: 'blob',
    params,
  });
};
