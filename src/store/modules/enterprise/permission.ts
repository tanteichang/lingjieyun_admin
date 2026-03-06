import { defineStore } from 'pinia';

import type { Role, RoleNode } from '@/api/model/enterprise/role';

export const usePermissionStore = defineStore('enterprise/permission', {
  state: () => ({
    roleList: [] as Role[],
    nodeList: [] as RoleNode[],
  }),
  actions: {
    setRoleList(roleList: Role[]) {
      this.roleList = roleList;
    },
    setNodeList(nodeList: RoleNode[]) {
      this.nodeList = nodeList;
    },
  },
  persist: {
    storage: window.sessionStorage,
  },
});
