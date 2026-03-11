import { getRequest, postRequest } from '@/utils/request';

import type {
  ConfirmDisbursePayload,
  ConfirmDisburseResponse,
  CreatePaymentPayload,
  CreatePaymentResponse,
  DetailPayload,
  DetailResponse,
  ListPayload,
  ListResponse,
  ReUploadSettlementPayload,
  ReUploadSettlementResponse,
  SendDisburseCodePayload,
  SendDisburseCodeResponse,
} from '../model/enterprise/bill';

const Api = {
  List: '/admin/enterprise/bill/list',
  Detail: '/admin/enterprise/bill/detail',
  SendDisburseCode: '/admin/enterprise/bill/sendDisburseCode',
  ConfirmDisburse: '/admin/enterprise/bill/confirmDisburse',
  ReUploadSettlement: '/enterprise/bill/reuploadSettlement',
  CreatePayment: '/admin/enterprise/bill/createPayment',
};
/**
 * 获取账单列表
 */
export const getBillList = (params: ListPayload) => {
  return getRequest<ListResponse>({
    url: Api.List,
    params,
  });
};
/**
 * 获取账单详情
 */
export const getBillDetail = (params: DetailPayload) => {
  return getRequest<DetailResponse>({
    url: Api.Detail,
    params,
  });
};
/**
 * 发送发放验证码
 */
export const sendDisburseCode = (params: SendDisburseCodePayload) => {
  return postRequest<SendDisburseCodeResponse>({
    url: Api.SendDisburseCode,
    params,
    showError: true,
  });
};
/**
 * 确认授权并发放
 */
export const confirmDisburse = (params: ConfirmDisbursePayload) => {
  return postRequest<ConfirmDisburseResponse>({
    url: Api.ConfirmDisburse,
    params,
    showError: true,
  });
};
/**
 * 重新上传结算单
 */
export const reUploadSettlement = (params: ReUploadSettlementPayload) => {
  return postRequest<ReUploadSettlementResponse>({
    url: Api.ReUploadSettlement,
    params,
    showError: true,
  });
};

/**
 * 创建支付
 */
export const createPayment = (params: CreatePaymentPayload) => {
  return postRequest<CreatePaymentResponse>({
    url: Api.CreatePayment,
    params,
    showError: true,
  });
};
