import { postRequest, request } from '@/utils/request';

import type {
  CreateCustomerPayload,
  CreateCustomerResponse,
  CustomerListResponse,
  DeleteCustomerPayload,
  DeleteCustomerResponse,
  UpdateCustomerPayload,
  UpdateCustomerResponse,
} from './model/customer';

const Api = {
  list: '/admin/enterprise/customer/list',
  create: '/admin/enterprise/customer/create',
  update: '/admin/enterprise/customer/update',
  delete: '/admin/enterprise/customer/delete',
};

/**
 * 获取客户列表
 * @returns 客户列表响应
 */
export const getCustomerList = () => {
  return request.get<CustomerListResponse>({
    url: Api.list,
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
