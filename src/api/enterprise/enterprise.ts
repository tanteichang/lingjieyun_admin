import type {
  CreateEnterprisePayload,
  CreateEnterpriseResponse,
  EnterpriseInfoResponse,
  JoinEnterprisePayload,
  JoinEnterpriseResponse,
  SearchEnterprisePayload,
  SearchEnterpriseResponse,
  SendPayPasswordChangeSmsResponse,
  SetOrChangePayPasswordPayload,
  SetOrChangePayPasswordResponse,
  VerifyPayPasswordSmsPayload,
  VerifyPayPasswordSmsResponse,
} from '@/api/model/enterprise/enterprise';
import { postRequest, request } from '@/utils/request';

const Api = {
  EnterpriseInfo: '/admin/enterprise/info',
  SearchEnterprise: '/admin/enterprise/searchEnterprise',
  JoinEnterprise: '/admin/enterprise/applyJoinEnterprise',
  CreateEnterprise: '/admin/enterprise/submitEnterprise',
  SetPayPasswordByToken: '/admin/enterprise/setPayPasswordByToken',
  SendPayPasswordChangeSms: '/admin/enterprise/sendPayPasswordChangeSms',
  VerifyPayPasswordSms: '/admin/enterprise/verifyPayPasswordSms',
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
/**
 * 设置或修改支付密码
 */
export function setOrChangePayPassword(params: SetOrChangePayPasswordPayload) {
  return postRequest<SetOrChangePayPasswordResponse>({
    url: Api.SetPayPasswordByToken,
    params,
    showError: true,
  });
}

export function sendPayPasswordChangeSms() {
  return postRequest<SendPayPasswordChangeSmsResponse>({
    url: Api.SendPayPasswordChangeSms,
    showError: true,
  });
}

/**
 * 验证支付密码短信验证码
 */
export function verifyPayPasswordSms(params: VerifyPayPasswordSmsPayload) {
  return postRequest<VerifyPayPasswordSmsResponse>({
    url: Api.VerifyPayPasswordSms,
    params,
    showError: true,
  });
}
