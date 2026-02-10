import { request } from '@/utils/request';
import { uploadResponse } from './model/upload';

const API = {
  image: '/api/upload/image',
  file: '/api/upload/file',
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
