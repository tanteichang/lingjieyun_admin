import { defineStore } from 'pinia';

import type { DeliveryUploadItem } from '@/api/model/enterprise/delivery';

export const useDeliveryStore = defineStore('_enterprise_delivery_list', {
  state: () => ({
    deliveries: {} as Record<string, DeliveryUploadItem>,
  }),
  actions: {
    // 存储当前页面的项目列表
    setDeliveries(deliveries: DeliveryUploadItem[]) {
      // 清空旧数据
      this.deliveries = {};
      this.deliveries = deliveries.reduce(
        (prev, cur) => {
          prev[cur.id] = cur;
          return prev;
        },
        {} as Record<string, DeliveryUploadItem>,
      );
    },
    getDelivery(id: string): DeliveryUploadItem | undefined {
      return this.deliveries[id];
    },
  },
  persist: true,
});
