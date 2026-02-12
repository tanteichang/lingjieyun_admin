import type {
  DeliveryCompletionPayload,
  DeliveryCompletionResponse,
  DeliveryListPayload,
  DeliveryListResponse,
  DeliveryReviewPayload,
  DeliveryReviewResponse,
  DeliverySummaryPayload,
  DeliveryUploadListPayload,
  DeliveryUploadListResponse,
  DeliveryUploadPayload,
  DeliveryUploadResponse,
} from '@/api/model/delivery';
import { getRequest, postRequest } from '@/utils/request';

const API = {
  list: '/admin/enterprise/delivery/list',
  uploadList: '/admin/enterprise/delivery/uploadList',
  review: '/admin/enterprise/delivery/review',
  upload: '/admin/enterprise/delivery/upload',
  deliverySummary: '/admin/enterprise/member/approvedDeliverySummary',
  deliveryCompletion: '/admin/enterprise/member/approvedDeliveryCompletion',
};

export function getDeliveryList(params: DeliveryListPayload) {
  return getRequest<DeliveryListResponse>({
    url: API.list,
    params,
  });
}

export function getDeliveryUploadList(params: DeliveryUploadListPayload) {
  return getRequest<DeliveryUploadListResponse>({
    url: API.uploadList,
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

export function getDeliverySummary(params: DeliverySummaryPayload) {
  return getRequest<DeliveryListResponse>({
    url: API.deliverySummary,
    params,
  });
}

export function getDeliveryCompletion(params: DeliveryCompletionPayload) {
  return getRequest<DeliveryCompletionResponse>({
    url: API.deliveryCompletion,
    params,
  });
}
