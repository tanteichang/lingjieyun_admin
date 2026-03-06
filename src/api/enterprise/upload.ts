import type { uploadResponse, uploadEnterpriseResponse } from '@/api/model/enterprise/upload';
import { ContentTypeEnum } from '@/constants';
import { request } from '@/utils/request';

const API = {
  image: '/api/upload/image',
  file: '/api/upload/file',
  enterprise: '/api/upload/enterprise',
};

export const uploadFile = (file: File) => {
  return request.upload<uploadResponse>('file', file, {
    url: API.file,
  });
};

export const uploadImage = (file: File) => {
  return request.upload<uploadResponse>('file', file, {
    url: API.image,
  });
};

/**
 * 支持多文件上传
 * @param file
 * @returns
 */
export const uploadEnterprise = (file: File[] | File) => {
  const files = Array.isArray(file) ? file : [file];
  const formData = new FormData();
  files.forEach((item, index) => {
    formData.append(`file[${index}]`, item);
  });
  formData.append('length', String(files.length));

  return request.post<uploadEnterpriseResponse>({
    url: API.enterprise,
    data: formData,
    headers: {
      'Content-Type': ContentTypeEnum.FormData,
    },
  });
};
