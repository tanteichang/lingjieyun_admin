import type {
  DeliveryListPayload,
  DeliveryListResponse,
  DeliveryReviewPayload,
  DeliveryReviewResponse,
  DeliveryUploadPayload,
  DeliveryUploadResponse,
} from '@/api/model/delivery';
import { getRequest, postRequest } from '@/utils/request';

const API = {
  list: '/admin/enterprise/delivery/list',
  review: '/admin/enterprise/delivery/review',
  upload: '/admin/enterprise/delivery/upload',
};

export function getDeliveryList(params: DeliveryListPayload) {
  return getRequest<DeliveryListResponse>({
    url: API.list,
    params,
  });
}

export function reviewDelivery(params: DeliveryReviewPayload) {
  return postRequest<DeliveryReviewResponse>({
    url: API.review,
    params,
    showError: true,
  });
}

export function uploadDelivery(params: DeliveryUploadPayload) {
  return postRequest<DeliveryUploadResponse>({
    url: API.upload,
    params,
    showError: true,
  });
}
