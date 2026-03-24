import type {
  BankAddPayload,
  BankAddResponse,
  BankListResponse,
  BankRemovePayload,
  BankRemoveResponse,
  BankSetDefaultPayload,
  BankSetDefaultResponse,
} from '@/api/model/enterprise/bank';
import { getRequest, postRequest } from '@/utils/request';

const API = {
  bankList: '/admin/enterprise/bank/list',
  bankAdd: '/admin/enterprise/bank/add',
  bankSetDefault: '/admin/enterprise/bank/setDefault',
  bankRemove: '/admin/enterprise/bank/remove',
};

export async function getBankList() {
  return getRequest<BankListResponse>({
    url: API.bankList,
    showError: true,
  });
}

export async function addBank(payload: BankAddPayload) {
  return postRequest<BankAddResponse>({
    url: API.bankAdd,
    data: payload,
    showError: true,
  });
}

export async function setDefaultBank(payload: BankSetDefaultPayload) {
  return postRequest<BankSetDefaultResponse>({
    url: API.bankSetDefault,
    data: payload,
    showError: true,
  });
}

export async function removeBank(payload: BankRemovePayload) {
  return postRequest<BankRemoveResponse>({
    url: API.bankRemove,
    data: payload,
    showError: true,
  });
}
