import type {
  RoleCreatePayload,
  RoleCreateResponse,
  RoleDeletePayload,
  RoleDeleteResponse,
  RoleListPayload,
  RoleListResponse,
  RoleNodeResponse,
  RoleUpdatePayload,
  RoleUpdateResponse,
} from '@/api/model/enterprise/role';
import { getRequest, postRequest } from '@/utils/request';

const Api = {
  nodes: '/admin/enterprise/role/nodes',
  list: '/admin/enterprise/role/list',
  create: '/admin/enterprise/role/create',
  update: '/admin/enterprise/role/update',
  delete: '/admin/enterprise/role/delete',
};

export function getRoleNodes() {
  return getRequest<RoleNodeResponse>({
    url: Api.nodes,
  });
}

export function getRoleList(params: RoleListPayload) {
  return getRequest<RoleListResponse>({
    url: Api.list,
    params,
  });
}

export function createRole(params: RoleCreatePayload) {
  return postRequest<RoleCreateResponse>({
    url: Api.create,
    params,
    showError: true,
  });
}

export function updateRole(params: RoleUpdatePayload) {
  return postRequest<RoleUpdateResponse>({
    url: Api.update,
    params,
    showError: true,
  });
}

export function deleteRole(params: RoleDeletePayload) {
  return postRequest<RoleDeleteResponse>({
    url: Api.delete,
    params,
    showError: true,
  });
}
