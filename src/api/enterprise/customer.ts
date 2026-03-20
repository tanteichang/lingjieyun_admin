import type {
  CreateCustomerPayload,
  CreateCustomerResponse,
  CustomerDetailResponse,
  CustomerListQuery,
  CustomerListResponse,
  DeleteCustomerPayload,
  DeleteCustomerResponse,
  UpdateCustomerPayload,
  UpdateCustomerResponse,
} from '@/api/model/enterprise/customer';
import { getRequest, postRequest, request } from '@/utils/request';

const Api = {
  list: '/admin/enterprise/customer/list',
  create: '/admin/enterprise/customer/create',
  update: '/admin/enterprise/customer/update',
  delete: '/admin/enterprise/customer/delete',
  detail: '/admin/enterprise/customer/detail',
};

/**
 * 获取客户列表
 * @returns 客户列表响应
 */
export const getCustomerList = (query: CustomerListQuery) => {
  return getRequest<CustomerListResponse>({
    url: Api.list,
    params: query,
    showError: true,
  });
};

/**
 * 创建客户
 * @param data 创建客户请求参数
 * @returns 创建客户响应
 */
export const createCustomer = (data: CreateCustomerPayload) => {
  return postRequest<CreateCustomerResponse>({
    url: Api.create,
    data,
    showError: true,
  });
};

/**
 * 更新客户
 * @param data 更新客户请求参数
 * @returns 更新客户响应
 */
export const updateCustomer = (data: UpdateCustomerPayload) => {
  return postRequest<UpdateCustomerResponse>({
    url: Api.update,
    data,
    showError: true,
  });
};

/**
 * 删除客户
 * @param data 删除客户请求参数
 * @returns 删除客户响应
 */
export const deleteCustomer = (data: DeleteCustomerPayload) => {
  return postRequest<DeleteCustomerResponse>({
    url: Api.delete,
    data,
    showError: true,
  });
};

export const getCustomerDetail = (id: number) => {
  return getRequest<CustomerDetailResponse>({
    url: `${Api.detail}?id=${id}`,
    showError: true,
  });
};
