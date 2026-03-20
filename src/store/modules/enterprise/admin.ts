import { defineStore } from 'pinia';
import type { Admin } from '@/api/model/enterprise/admin';
import { getAdminList } from '@/api/enterprise/admin';

export const useAdminStore = defineStore('_enterprise_admin_list', {
  state: () => ({
    admins: [] as Admin[],
  }),
  actions: {
    initAdmins() {
      if (this.admins.length === 0) {
        return getAdminList().then((res) => {
          this.setAdmins(res.data.list);
          return res.data.list;
        });
      }
    },
    getAdmins() {
      return this.admins;
    },
    setAdmins(admins: Admin[]) {
      this.admins = admins;
    },
    getSelectOptions() {
      return this.admins.map((admin) => ({
        label: `${admin.name}(${admin.mobile})`,
        value: admin.id,
      }));
    },
  },
  persist: {
    storage: window.localStorage,
  },
});
