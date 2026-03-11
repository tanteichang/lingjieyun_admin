import type {
  ExportFreelancerListPayload,
  ImportSettlementListLogPayload,
  ImportSettlementListLogResponse,
  ImportSettlementPayload,
  ImportSettlementResponse,
  SettlementDetailPayload,
  SettlementDetailResponse,
  SettlementListPayload,
  SettlementListResponse,
  TemplateDownloadPayload,
} from '@/api/model/enterprise/settlement';
import { getRequest, postRequest, request } from '@/utils/request';

const Api = {
  List: '/admin/enterprise/settlement/list',
  ExportFreelancerList: '/admin/enterprise/settlement/exportFreelancerList',
  Detail: '/admin/enterprise/settlement/detail',
  TemplateDownload: '/admin/enterprise/settlement/template/download',
  Import: '/admin/enterprise/settlement/import',
  ImportList: '/admin/enterprise/settlement/import/list',
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

export const getSettlementDetail = (params: SettlementDetailPayload) => {
  return getRequest<SettlementDetailResponse>({
    url: Api.Detail,
    params,
  });
};

export const downloadSettlementTemplate = (params: TemplateDownloadPayload) => {
  return request.get({
    url: Api.TemplateDownload,
    responseType: 'blob',
    params,
  });
};

export const importSettlement = (params: ImportSettlementPayload) => {
  return postRequest<ImportSettlementResponse>({
    url: Api.Import,
    params,
    showError: true,
  });
};

export const getImportSettlementList = (params: ImportSettlementListLogPayload) => {
  return getRequest<ImportSettlementListLogResponse>({
    url: Api.ImportList,
    params,
  });
};
