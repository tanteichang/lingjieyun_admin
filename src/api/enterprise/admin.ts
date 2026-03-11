import type {
  AddAdminPayload,
  AddAdminResponse,
  AdminApplyAuditPayload,
  AdminApplyAuditResponse,
  AdminApplyListPayload,
  AdminApplyListResponse,
  AdminDetailPayload,
  AdminDetailResponse,
  AdminListResponse,
  RemoveAdminPayload,
  RemoveAdminResponse,
  ToggleAdminPayload,
  ToggleAdminResponse,
  UpdateAdminPayload,
  UpdateAdminResponse,
} from '@/api/model/enterprise/admin';
import { getRequest, postRequest } from '@/utils/request';

const Api = {
  list: '/admin/enterprise/admin/list',
  remove: '/admin/enterprise/admin/remove',
  toggle: '/admin/enterprise/admin/toggle',
  add: '/admin/enterprise/admin/add',
  update: '/admin/enterprise/admin/update',
  detail: '/admin/enterprise/admin/detail',
  applyList: '/admin/enterprise/admin/applyList',
  auditApply: '/admin/enterprise/admin/auditApply',
};

export function getAdminList() {
  return getRequest<AdminListResponse>({ url: Api.list });
}

export function removeAdmin(data: RemoveAdminPayload) {
  return postRequest<RemoveAdminResponse>({ url: Api.remove, data, showError: true });
}

export function toggleAdmin(data: ToggleAdminPayload) {
  return postRequest<ToggleAdminResponse>({ url: Api.toggle, data, showError: true });
}

export function addAdmin(data: AddAdminPayload) {
  return postRequest<AddAdminResponse>({ url: Api.add, data, showError: true });
}

export function updateAdmin(data: UpdateAdminPayload) {
  return postRequest<UpdateAdminResponse>({ url: Api.update, data, showError: true });
}

export function getAdminDetail(params: AdminDetailPayload) {
  return getRequest<AdminDetailResponse>({ url: Api.detail, params, showError: true });
}

export function getAdminApplyList(params: AdminApplyListPayload) {
  return getRequest<AdminApplyListResponse>({ url: Api.applyList, params, showError: true });
}

export function auditAdminApply(data: AdminApplyAuditPayload) {
  return postRequest<AdminApplyAuditResponse>({ url: Api.auditApply, data, showError: true });
}
