import { defineStore } from 'pinia';

import type { Customer } from '@/api/model/customer';

export const useCustomerStore = defineStore('_enterprise_customer_list', {
  state: () => ({
    customers: {} as Record<string, Customer>,
  }),
  actions: {
    // 存储当前页面的客户列表
    setCustomers(customers: Customer[]) {
      // 清空旧数据
      this.customers = {};
      this.customers = customers.reduce(
        (prev, cur) => {
          prev[cur.id] = cur;
          return prev;
        },
        {} as Record<string, Customer>,
      );
    },
    getCustomer(id: string): Customer | undefined {
      return this.customers[id];
    },
  },
  persist: true,
});
