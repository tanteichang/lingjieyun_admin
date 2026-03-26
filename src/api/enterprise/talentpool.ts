import type {
  BatchImportPayload,
  BatchImportResponse,
  BatchRealnamePayload,
  BatchRealnameResponse,
  BatchUploadIdCardPayload,
  BatchUploadIdCardResponse,
  ConfirmationListPayload,
  ConfirmationListResponse,
  PaymentListPayload,
  PaymentListResponse,
  TalentPoolAddBankPayload,
  TalentPoolAddBankResponse,
  TalentPoolDetailResponse,
  TalentPoolListQuery,
  TalentPoolListResponse,
  TalentPoolUpdateIdCardImagesPayload,
  TalentPoolUpdateIdCardImagesResponse,
  TaskListPayload,
  TaskListResponse,
} from '@/api/model/enterprise/talentpool';
import { getRequest, postRequest } from '@/utils/request';

// 人才库管理
const API = {
  list: '/admin/enterprise/talent_pool/list',
  detail: '/admin/enterprise/talent_pool/detail',
  addBank: '/admin/enterprise/talent_pool/addBank',
  updateIdCardImages: '/admin/enterprise/talent_pool/updateIdCardImages',
  batchRealname: '/admin/enterprise/talent_pool/batchRealname',
  paymentList: '/admin/enterprise/talent_pool/paymentList',
  confirmationList: '/admin/enterprise/talent_pool/confirmationList',
  taskList: '/admin/enterprise/talent_pool/taskList',
  batchImport: '/admin/enterprise/talent_pool/batchImport',
  downloadImportTemplate: '/admin/enterprise/talent_pool/downloadImportTemplate',
  batchUploadIdCard: '/admin/enterprise/talent_pool/batchUploadIdCard',
};

export function getList(params: TalentPoolListQuery) {
  return getRequest<TalentPoolListResponse>({
    url: API.list,
    params,
    showError: true,
  });
}

export function getDetail(params: { talent_pool_id: number }) {
  return getRequest<TalentPoolDetailResponse>({
    url: API.detail,
    params,
    showError: true,
  });
}

export function addBank(params: TalentPoolAddBankPayload) {
  return postRequest<TalentPoolAddBankResponse>({
    url: API.addBank,
    params,
    showError: true,
  });
}

export function updateIdCardImages(params: TalentPoolUpdateIdCardImagesPayload) {
  return postRequest<TalentPoolUpdateIdCardImagesResponse>({
    url: API.updateIdCardImages,
    params,
    showError: true,
  });
}

export function batchRealname(params: BatchRealnamePayload) {
  return postRequest<BatchRealnameResponse>({
    url: API.batchRealname,
    params,
    showError: true,
  });
}

export function getPaymentList(params: PaymentListPayload) {
  return getRequest<PaymentListResponse>({
    url: API.paymentList,
    params,
    showError: true,
  });
}

export function getConfirmationList(params: ConfirmationListPayload) {
  return getRequest<ConfirmationListResponse>({
    url: API.confirmationList,
    params,
    showError: true,
  });
}

export function getTaskList(params: TaskListPayload) {
  return getRequest<TaskListResponse>({
    url: API.taskList,
    params,
    showError: true,
  });
}

export function batchImport(params: BatchImportPayload) {
  return postRequest<BatchImportResponse>({
    url: API.batchImport,
    params,
    showError: true,
  });
}

export function downloadImportTemplate() {
  return getRequest<Blob>({
    url: API.downloadImportTemplate,
    showError: true,
    responseType: 'blob',
  });
}

export function batchUploadIdCard(params: BatchUploadIdCardPayload) {
  return postRequest<BatchUploadIdCardResponse>({
    url: API.batchUploadIdCard,
    params,
    showError: true,
  });
}
